/**
 * Client-safe exports from @caffeinebounce/logger
 *
 * This module provides client-safe versions of logger utilities that
 * DO NOT import @logtail/next, avoiding the dynamic require() issue
 * with Turbopack.
 *
 * Import from "@caffeinebounce/logger/client" in client components
 * instead of "@caffeinebounce/logger" to avoid build errors.
 *
 * @example
 * ```typescript
 * // In client components:
 * import { useErrorLoggerSafe } from "@caffeinebounce/logger/client";
 *
 * function MyComponent() {
 *   const { logError } = useErrorLoggerSafe();
 *   // ...
 * }
 * ```
 */

export type {
  ApiErrorCode,
  ApiHandler,
  ErrorLoggingContext,
} from "./api-wrapper";
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
