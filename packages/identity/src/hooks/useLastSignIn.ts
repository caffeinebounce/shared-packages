"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Supported sign-in methods.
 * NOTE: Keep in sync with OAuthProvider type in types.ts.
 * Add new providers here only after they are fully wired into the sign-in flow.
 */
export type SignInMethod = "email" | "google" | "azure";

/** Valid sign-in methods for runtime validation */
const VALID_METHODS: SignInMethod[] = ["email", "google", "azure"];
const PENDING_OAUTH_KEYS = {
  google: "pending_oauth_google",
  azure: "pending_oauth_azure",
} as const satisfies Record<Exclude<SignInMethod, "email">, string>;
const LEGACY_PENDING_OAUTH_METHOD_KEY = "pending_oauth_method";

/** Stored last sign-in data */
export interface LastSignInData {
  /** The authentication method used */
  method: SignInMethod;
  /** The email address (will be masked when displayed) */
  email: string;
  /** ISO timestamp of when this sign-in occurred */
  timestamp: string;
}

/** Options for the useLastSignIn hook */
export interface UseLastSignInOptions {
  /** localStorage key for storing data. Default: "last_signin" */
  storageKey?: string;
}

/**
 * Mask an email address for privacy display.
 * Shows first character, asterisks, and domain.
 * @example "user@example.com" -> "u***@example.com"
 */
export function maskEmail(email: string): string {
  // Handle empty or invalid input
  if (!email || !email.includes("@")) return email;

  const parts = email.split("@");
  // Only handle valid emails with exactly one @ symbol
  if (parts.length !== 2) return email;

  const [localPart, domain] = parts;
  if (!localPart || !domain) return email;

  if (localPart.length <= 1) {
    return `${localPart}***@${domain}`;
  }

  return `${localPart[0]}***@${domain}`;
}

/**
 * Hook to manage last sign-in method tracking.
 *
 * Stores and retrieves the user's last successful sign-in method
 * in localStorage to help them remember how they signed up.
 *
 * @example
 * ```tsx
 * function SigninPage() {
 *   const { lastSignIn, recordSignIn, clearLastSignIn } = useLastSignIn();
 *
 *   // Show hint if available
 *   if (lastSignIn) {
 *     return <LastSignInHint {...lastSignIn} onClear={clearLastSignIn} />;
 *   }
 *
 *   // Record on successful sign-in
 *   const handleSuccess = (method, email) => {
 *     recordSignIn(method, email);
 *   };
 * }
 * ```
 */
export function useLastSignIn(options: UseLastSignInOptions = {}) {
  const { storageKey = "last_signin" } = options;
  const [lastSignIn, setLastSignIn] = useState<LastSignInData | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const data = JSON.parse(stored) as LastSignInData;
        // Strictly validate the data structure
        if (
          data.method &&
          VALID_METHODS.includes(data.method) &&
          data.email &&
          data.email.includes("@") &&
          data.timestamp &&
          !Number.isNaN(Date.parse(data.timestamp))
        ) {
          setLastSignIn(data);
        }
      }
    } catch {
      // Ignore parse errors or localStorage access issues
    }
    setIsLoaded(true);
  }, [storageKey]);

  /**
   * Record a successful sign-in.
   * Call this after authentication succeeds.
   */
  const recordSignIn = useCallback(
    (method: SignInMethod, email: string) => {
      const data: LastSignInData = {
        method,
        email: email.trim(), // Trim for consistency
        timestamp: new Date().toISOString(),
      };

      try {
        localStorage.setItem(storageKey, JSON.stringify(data));
        setLastSignIn(data);
      } catch {
        // Ignore localStorage write errors (e.g., private browsing)
      }
    },
    [storageKey],
  );

  /**
   * Clear the stored last sign-in data.
   * Call this on sign-out or when user clicks "Not you?".
   */
  const clearLastSignIn = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // Ignore localStorage errors
    }
    setLastSignIn(null);
  }, [storageKey]);

  const markPendingOAuthSignIn = useCallback(
    (method: Exclude<SignInMethod, "email">) => {
      try {
        for (const key of Object.values(PENDING_OAUTH_KEYS)) {
          sessionStorage.removeItem(key);
        }
        sessionStorage.removeItem(LEGACY_PENDING_OAUTH_METHOD_KEY);
        if (method === "google") {
          sessionStorage.setItem(PENDING_OAUTH_KEYS.google, "1");
        } else {
          sessionStorage.setItem(PENDING_OAUTH_KEYS.azure, "1");
        }
      } catch {
        // Ignore sessionStorage errors
      }
    },
    [],
  );

  /**
   * Complete pending OAuth sign-in recording.
   * Call this after a successful OAuth callback to record the method.
   * Checks sessionStorage for pending OAuth method and user email.
   *
   * @example
   * ```tsx
   * // In your OAuth callback page after successful auth:
   * const { completePendingOAuthSignIn } = useLastSignIn();
   * useEffect(() => {
   *   if (user?.email) {
   *     completePendingOAuthSignIn(user.email);
   *   }
   * }, [user?.email]);
   * ```
   */
  const completePendingOAuthSignIn = useCallback(
    (email: string) => {
      try {
        const legacyMethodRaw = sessionStorage.getItem(
          LEGACY_PENDING_OAUTH_METHOD_KEY,
        );
        const legacyMethod =
          legacyMethodRaw &&
          VALID_METHODS.includes(legacyMethodRaw as SignInMethod) &&
          legacyMethodRaw !== "email"
            ? (legacyMethodRaw as Exclude<SignInMethod, "email">)
            : null;
        const pendingMethod =
          legacyMethod ??
          (sessionStorage.getItem(PENDING_OAUTH_KEYS.google)
            ? "google"
            : sessionStorage.getItem(PENDING_OAUTH_KEYS.azure)
              ? "azure"
              : null);

        if (pendingMethod && email) {
          recordSignIn(pendingMethod, email);
          for (const key of Object.values(PENDING_OAUTH_KEYS)) {
            sessionStorage.removeItem(key);
          }
          sessionStorage.removeItem(LEGACY_PENDING_OAUTH_METHOD_KEY);
        }
      } catch {
        // Ignore sessionStorage errors
      }
    },
    [recordSignIn],
  );

  return {
    /** The last sign-in data, or null if none stored */
    lastSignIn,
    /** Whether the hook has finished loading from localStorage */
    isLoaded,
    /** Record a new sign-in */
    recordSignIn,
    /** Clear stored sign-in data */
    clearLastSignIn,
    /** Mark an OAuth method as pending before redirecting to the provider */
    markPendingOAuthSignIn,
    /** Complete pending OAuth sign-in recording (call after OAuth callback) */
    completePendingOAuthSignIn,
  };
}
