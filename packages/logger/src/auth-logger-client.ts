/**
 * Client-safe auth logger
 *
 * This module provides a client-safe version of authLogger that uses dynamic imports
 * to avoid the @logtail/next dynamic require() issue with Turbopack.
 *
 * Import from "@caffeinebounce/logger/client" in client components:
 *
 * @example
 * ```typescript
 * import { authLoggerClient } from "@caffeinebounce/logger/client";
 *
 * // Use exactly like authLogger
 * authLoggerClient.signInSuccess(userId, email);
 * ```
 */

import type { authLogger as AuthLoggerType } from "./auth-logger";

// Lazy-loaded logger module
let loggerModule: { authLogger: typeof AuthLoggerType } | null = null;
let loadingPromise: Promise<void> | null = null;

async function ensureLoggerLoaded(): Promise<void> {
  if (loggerModule) return;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    try {
      // Dynamic import to avoid Turbopack SSG issues with @logtail/next
      const mod = await import("./auth-logger");
      loggerModule = { authLogger: mod.authLogger };
    } catch (error) {
      // Logger failed to load - calls will be no-ops
      // This can happen during SSG or in edge environments
      if (typeof window !== "undefined") {
        console.warn("[logger] Failed to load auth logger:", error);
      }
    }
  })();

  return loadingPromise;
}

type AuthLoggerInterface = typeof AuthLoggerType;

// Create a proxy method that lazily loads the logger
function createLazyMethod<K extends keyof AuthLoggerInterface>(
  method: K,
): AuthLoggerInterface[K] {
  return ((...args: Parameters<AuthLoggerInterface[K]>) => {
    if (loggerModule) {
      // Logger already loaded, call directly
      // biome-ignore lint/suspicious/noExplicitAny: Dynamic method call requires any
      (loggerModule.authLogger[method] as any)(...args);
    } else {
      // Start loading and call when ready
      ensureLoggerLoaded().then(() => {
        if (loggerModule) {
          // biome-ignore lint/suspicious/noExplicitAny: Dynamic method call requires any
          (loggerModule.authLogger[method] as any)(...args);
        }
      });
    }
  }) as AuthLoggerInterface[K];
}

/**
 * Client-safe auth logger
 *
 * Drop-in replacement for `authLogger` that uses dynamic imports to avoid
 * Turbopack SSG issues with @logtail/next.
 *
 * All methods match the original authLogger API:
 * - signInAttempt, signInSuccess, signInFailure
 * - mfaRequired, mfaSuccess, mfaFailure
 * - signUpAttempt, signUpSuccess, signUpFailure
 * - emailVerificationSent
 * - passwordResetRequested, passwordResetCompleted, passwordResetFailed
 * - signOut, sessionRefresh
 */
export const authLoggerClient: AuthLoggerInterface = {
  signInAttempt: createLazyMethod("signInAttempt"),
  signInSuccess: createLazyMethod("signInSuccess"),
  signInFailure: createLazyMethod("signInFailure"),
  mfaRequired: createLazyMethod("mfaRequired"),
  mfaSuccess: createLazyMethod("mfaSuccess"),
  mfaFailure: createLazyMethod("mfaFailure"),
  signUpAttempt: createLazyMethod("signUpAttempt"),
  signUpSuccess: createLazyMethod("signUpSuccess"),
  signUpFailure: createLazyMethod("signUpFailure"),
  emailVerificationSent: createLazyMethod("emailVerificationSent"),
  passwordResetRequested: createLazyMethod("passwordResetRequested"),
  passwordResetCompleted: createLazyMethod("passwordResetCompleted"),
  passwordResetFailed: createLazyMethod("passwordResetFailed"),
  signOut: createLazyMethod("signOut"),
  sessionRefresh: createLazyMethod("sessionRefresh"),
};
