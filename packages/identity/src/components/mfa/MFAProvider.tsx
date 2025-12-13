"use client";

import type { AuthenticatorAssuranceLevels } from "@supabase/supabase-js";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import type { CreateClientFn } from "../../types";

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
  const [currentLevel, setCurrentLevel] =
    useState<AuthenticatorAssuranceLevels | null>(null);
  const [nextLevel, setNextLevel] =
    useState<AuthenticatorAssuranceLevels | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshAAL = useCallback(async () => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setCurrentLevel(null);
        setNextLevel(null);
        return;
      }

      const { data, error } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

      if (error) {
        console.error("Error getting AAL:", error);
        return;
      }

      setCurrentLevel(data.currentLevel);
      setNextLevel(data.nextLevel);
    } catch (error) {
      console.error("Error in refreshAAL:", error);
    } finally {
      setLoading(false);
    }
  }, [createClient]);

  useEffect(() => {
    refreshAAL();

    // Listen for auth state changes
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
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
