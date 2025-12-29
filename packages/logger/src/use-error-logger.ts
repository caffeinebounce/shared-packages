/**
 * Client-side error logging hook
 *
 * Provides a convenient way to log errors in client components
 * using the @caffeinebounce/logger package
 */

import { useLogger } from "@logtail/next";
import { useCallback } from "react";

export interface ErrorLogContext {
  component?: string;
  action?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Hook for logging errors in client components
 *
 * Automatically logs errors to Better Stack and handles both Error objects
 * and arbitrary error types
 *
 * @returns Object with error logging function
 *
 * @example
 * ```typescript
 * import { useErrorLogger } from "@caffeinebounce/logger";
 *
 * export function MyComponent() {
 *   const { logError } = useErrorLogger();
 *
 *   const handleClick = async () => {
 *     try {
 *       await fetchData();
 *     } catch (error) {
 *       logError(error, {
 *         component: "MyComponent",
 *         action: "fetchData",
 *       });
 *     }
 *   };
 *
 *   return <button onClick={handleClick}>Fetch</button>;
 * }
 * ```
 */
export function useErrorLogger() {
  const { error: logErrorToLogger } = useLogger();

  const logError = useCallback(
    (error: unknown, context?: ErrorLogContext) => {
      const message =
        error instanceof Error
          ? error.message
          : String(error || "Unknown error");

      const errorType =
        error instanceof Error ? error.constructor.name : typeof error;

      const stack = error instanceof Error ? error.stack : undefined;

      logErrorToLogger(message, {
        event: `client.error.${context?.action || "unknown"}`,
        component: context?.component,
        action: context?.action,
        userId: context?.userId,
        errorType,
        stack,
        timestamp: new Date().toISOString(),
        ...context?.metadata,
      });
    },
    [logErrorToLogger],
  );

  return { logError };
}
