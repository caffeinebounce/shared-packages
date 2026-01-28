"use client";

import { useErrorLoggerSafe as useErrorLogger } from "@caffeinebounce/logger/client";
import type { AuthenticatorAssuranceLevels } from "@supabase/supabase-js";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import type { CreateClientFn } from "../../types";

/**
 * Debounce window for auth events in milliseconds.
 * Prevents rapid successive refreshAAL calls from auth state changes.
 */
const AUTH_DEBOUNCE_MS = 100;

interface MFAContextType {
  currentLevel: AuthenticatorAssuranceLevels | null;
  nextLevel: AuthenticatorAssuranceLevels | null;
  needsMFA: boolean;
  loading: boolean;
  refreshAAL: () => Promise<void>;
}

const MFAContext = createContext<MFAContextType>({
  currentLevel: null,
  nextLevel: null,
  needsMFA: false,
  loading: true,
  refreshAAL: async () => {},
});

export function useMFA() {
  return useContext(MFAContext);
}

export interface MFAProviderProps {
  /** Supabase client factory */
  createClient: CreateClientFn;
  /** Children to render */
  children: ReactNode;
}

/**
 * MFAProvider - Context provider for MFA state
 *
 * Tracks the current MFA assurance level and provides hooks for checking MFA status.
 *
 * @example
 * ```tsx
 * <MFAProvider createClient={createClient}>
 *   <App />
 * </MFAProvider>
 * ```
 */
export function MFAProvider({ createClient, children }: MFAProviderProps) {
  const { logError } = useErrorLogger();
  const [currentLevel, setCurrentLevel] =
    useState<AuthenticatorAssuranceLevels | null>(null);
  const [nextLevel, setNextLevel] =
    useState<AuthenticatorAssuranceLevels | null>(null);
  const [loading, setLoading] = useState(true);

  // Track last auth event time for debouncing
  const lastAuthEventRef = useRef<number>(0);

  const refreshAAL = useCallback(async () => {
    try {
      const supabase = createClient();
      // Use getSession(), which reads from client-side storage (no API call),
      // instead of getUser(), which makes an API call that can trigger token refresh
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        setCurrentLevel(null);
        setNextLevel(null);
        return;
      }

      const { data, error } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

      if (error) {
        logError(error, {
          component: "MFAProvider",
          action: "getAAL",
        });
        return;
      }

      setCurrentLevel(data.currentLevel);
      setNextLevel(data.nextLevel);
    } catch (error) {
      logError(error, {
        component: "MFAProvider",
        action: "refreshAAL",
      });
    } finally {
      setLoading(false);
    }
  }, [createClient, logError]);

  useEffect(() => {
    // Mark initial load time to prevent immediate duplicate from listener
    lastAuthEventRef.current = Date.now();
    refreshAAL();

    // Listen for auth state changes with debouncing
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      // Debounce rapid auth events to prevent redundant getSession() calls
      const now = Date.now();
      if (now - lastAuthEventRef.current < AUTH_DEBOUNCE_MS) {
        return;
      }
      lastAuthEventRef.current = now;
      refreshAAL();
    });

    return () => subscription.unsubscribe();
  }, [refreshAAL, createClient]);

  // User needs MFA if they have a factor enrolled (nextLevel = aal2) but haven't verified it (currentLevel = aal1)
  const needsMFA = currentLevel === "aal1" && nextLevel === "aal2";

  return (
    <MFAContext.Provider
      value={{ currentLevel, nextLevel, needsMFA, loading, refreshAAL }}
    >
      {children}
    </MFAContext.Provider>
  );
}

/**
 * useRequireMFA - Hook to check if MFA verification is required
 *
 * @example
 * ```tsx
 * const { needsMFA, loading, isVerified } = useRequireMFA();
 *
 * if (loading) return <Loading />;
 * if (needsMFA) return <MFAChallenge />;
 * if (!isVerified) return <AccessDenied />;
 * ```
 */
export function useRequireMFA() {
  const { needsMFA, loading } = useMFA();

  return {
    needsMFA,
    loading,
    isVerified: !needsMFA && !loading,
  };
}
