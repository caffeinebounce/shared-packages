"use client";

import { useCallback, useEffect } from "react";

const DEFAULT_MAX_ERRORS = 20;
const DEFAULT_STORAGE_KEY = "session_errors";

// Module-level singleton to ensure only one set of listeners is active globally
let listenersInitialized = false;
let currentStorageKey = DEFAULT_STORAGE_KEY;
let currentMaxErrors = DEFAULT_MAX_ERRORS;

/**
 * Represents an error captured during the session
 */
export interface SessionError {
  message: string;
  stack?: string;
  timestamp: string;
  type: "error" | "unhandledrejection";
}

/**
 * Options for configuring the useSessionErrors hook
 */
export interface UseSessionErrorsOptions {
  /** Maximum number of errors to store (default: 20) */
  maxErrors?: number;
  /** Session storage key for storing errors (default: "session_errors") */
  storageKey?: string;
}

/**
 * Add an error to session storage (limited to maxErrors)
 */
function addError(error: SessionError) {
  if (typeof window === "undefined") return;
  try {
    const stored = sessionStorage.getItem(currentStorageKey);
    const errors: SessionError[] = stored ? JSON.parse(stored) : [];

    // Add new error and limit to max
    errors.push(error);
    if (errors.length > currentMaxErrors) {
      errors.shift(); // Remove oldest
    }

    sessionStorage.setItem(currentStorageKey, JSON.stringify(errors));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Initialize global error listeners (singleton pattern).
 * Called once when the first hook instance mounts.
 */
function initializeErrorListeners() {
  if (listenersInitialized || typeof window === "undefined") return;
  listenersInitialized = true;

  const handleError = (event: ErrorEvent) => {
    addError({
      message: event.message || "Unknown error",
      stack: event.error?.stack,
      timestamp: new Date().toISOString(),
      type: "error",
    });
  };

  const handleRejection = (event: PromiseRejectionEvent) => {
    const reason = event.reason;
    addError({
      message:
        reason instanceof Error
          ? reason.message
          : String(reason) || "Unhandled promise rejection",
      stack: reason instanceof Error ? reason.stack : undefined,
      timestamp: new Date().toISOString(),
      type: "unhandledrejection",
    });
  };

  window.addEventListener("error", handleError);
  window.addEventListener("unhandledrejection", handleRejection);

  // Note: We intentionally don't remove these listeners since they should
  // persist for the entire session to capture all errors
}

/**
 * Hook that captures console errors and unhandled promise rejections
 * during the session. Stores the last N errors in sessionStorage.
 *
 * Uses a singleton pattern to ensure only one set of global listeners
 * is active, regardless of how many components use this hook.
 *
 * @param options Configuration options for error tracking
 * @returns Object with methods to get and clear session errors
 *
 * @example
 * ```tsx
 * function FeedbackDialog() {
 *   const { getErrors, clearErrors } = useSessionErrors({
 *     maxErrors: 10,
 *     storageKey: "my_app_errors",
 *   });
 *
 *   const handleSubmit = async () => {
 *     const errors = getErrors();
 *     await submitFeedback({ sessionErrors: errors });
 *     clearErrors();
 *   };
 * }
 * ```
 */
export function useSessionErrors(options: UseSessionErrorsOptions = {}) {
  const { maxErrors = DEFAULT_MAX_ERRORS, storageKey = DEFAULT_STORAGE_KEY } =
    options;

  // Update module-level config (first caller wins for listeners)
  if (!listenersInitialized) {
    currentMaxErrors = maxErrors;
    currentStorageKey = storageKey;
  }

  // Initialize global listeners on first hook usage
  useEffect(() => {
    initializeErrorListeners();
  }, []);

  const getErrors = useCallback((): SessionError[] => {
    if (typeof window === "undefined") return [];
    try {
      const stored = sessionStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }, [storageKey]);

  const clearErrors = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      sessionStorage.removeItem(storageKey);
    } catch {
      // Ignore storage errors
    }
  }, [storageKey]);

  return { getErrors, clearErrors };
}
