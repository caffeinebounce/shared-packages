/**
 * Client-safe error logging hook
 *
 * This version does NOT use @logtail/next directly, avoiding the
 * dynamic require() issue with Turbopack.
 *
 * Instead, it uses the browser's console API with structured output
 * and can optionally send logs to an API endpoint.
 *
 * For full Better Stack integration in client components, use an API
 * route that handles logging server-side.
 */

import { useCallback } from "react";

export interface ErrorLogContext {
  component?: string;
  action?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Client-safe hook for logging errors
 *
 * Uses console logging as a fallback instead of @logtail/next
 * to avoid Turbopack SSG issues.
 *
 * @returns Object with error logging function
 */
export function useErrorLoggerSafe() {
  const logError = useCallback((error: unknown, context?: ErrorLogContext) => {
    const message =
      error instanceof Error ? error.message : String(error || "Unknown error");

    const errorType =
      error instanceof Error ? error.constructor.name : typeof error;

    const logContext: Record<string, unknown> = {
      level: "error",
      errorType,
      timestamp: new Date().toISOString(),
      ...(error instanceof Error && { stack: error.stack }),
      ...(context?.component && { component: context.component }),
      ...(context?.action && { action: context.action }),
      ...(context?.userId && { userId: context.userId }),
      ...context?.metadata,
    };

    // Log to console with structured format
    console.error("[Error]", message, logContext);

    // Optionally, you could send this to an API endpoint:
    // fetch('/api/log', { method: 'POST', body: JSON.stringify({ message, ...logContext }) });
  }, []);

  return { logError };
}

// Also export the original type for compatibility
export type { ErrorLogContext as SafeErrorLogContext };
