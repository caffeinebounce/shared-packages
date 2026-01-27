"use client";

import { useCallback, useEffect, useState } from "react";

/** Supported sign-in methods */
export type SignInMethod = "email" | "google" | "azure" | "github";

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
  const [localPart, domain] = email.split("@");
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
        // Validate the data structure
        if (data.method && data.email && data.timestamp) {
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
        email,
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

  /**
   * Complete pending OAuth sign-in recording.
   * Call this after a successful OAuth callback to record the method.
   * Checks sessionStorage for pending OAuth method and user email.
   */
  const completePendingOAuthSignIn = useCallback(
    (email: string) => {
      try {
        const pendingMethod = sessionStorage.getItem(
          "pending_oauth_method",
        ) as SignInMethod | null;
        if (pendingMethod && email) {
          recordSignIn(pendingMethod, email);
          sessionStorage.removeItem("pending_oauth_method");
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
    /** Complete pending OAuth sign-in recording (call after OAuth callback) */
    completePendingOAuthSignIn,
  };
}
