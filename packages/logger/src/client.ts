/**
 * Client-safe exports from @caffeinebounce/logger
 *
 * This module provides client-safe versions of logger utilities that
 * use dynamic imports to avoid the @logtail/next dynamic require()
 * issue with Turbopack.
 *
 * Import from "@caffeinebounce/logger/client" in client components
 * instead of "@caffeinebounce/logger" to avoid build errors.
 *
 * @example
 * ```typescript
 * // In client components:
 * import { useErrorLoggerSafe, authLoggerClient } from "@caffeinebounce/logger/client";
 *
 * function MyComponent() {
 *   const { logError } = useErrorLoggerSafe();
 *
 *   const handleSignIn = async () => {
 *     authLoggerClient.signInAttempt(email);
 *     // ...
 *   };
 * }
 * ```
 */

export type {
  ApiErrorCode,
  ApiHandler,
  ErrorLoggingContext,
} from "./api-wrapper";
// Client-safe auth logger with lazy loading
export { authLoggerClient } from "./auth-logger-client";
export type {
  ApiErrorContext,
  ApiErrorResponse,
} from "./error-logger";
export type {
  FormErrorContext,
  FormErrorType,
} from "./form-error-logger";
// Re-export types that are safe for client-side use
export type {
  AuthLogContext,
  LogContext,
  LogLevel,
} from "./types";
export {
  type ErrorLogContext,
  type SafeErrorLogContext,
  useErrorLoggerSafe,
} from "./use-error-logger-safe";
