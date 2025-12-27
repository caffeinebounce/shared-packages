/**
 * @caffeinebounce/logger
 *
 * Shared logging utility for Better Stack integration.
 * Provides structured logging for both server and client-side code.
 *
 * @example
 * ```typescript
 * import { logger, authLogger, useErrorLogger, useFormErrorLogger } from "@caffeinebounce/logger";
 *
 * // Universal logger (works on server and client)
 * logger.info("Something happened", { event: "my.event", userId: "123" });
 *
 * // Auth-specific helpers
 * authLogger.signInSuccess("user-id", "user@example.com");
 *
 * // Client component hooks (recommended)
 * const { logError } = useErrorLogger();
 * const logFormError = useFormErrorLogger();
 * ```
 */

// Re-export @logtail/next hooks and types for direct use
export { Logger as BetterStackLogger, useLogger } from "@logtail/next";
export { adminLogger } from "./admin-logger";
export { authLogger } from "./auth-logger";
export {
  getClientLogger,
  getServerLogger,
  Logger,
  logger,
} from "./logger";

// Error logging utilities
export {
  createApiErrorResponse,
  extractErrorMessage,
  extractErrorStack,
  extractErrorType,
  extractSupabaseErrorContext,
  extractValidationErrorContext,
  getOrGenerateCorrelationId,
} from "./error-logger";

export type {
  ApiErrorContext,
  ApiErrorResponse,
} from "./error-logger";

// Client-side error logging hooks
export {
  useErrorLogger,
  type ErrorLogContext,
} from "./use-error-logger";

// Form error logging utilities
export {
  logFormNetworkError,
  logFormSubmissionError,
  logFormValidationError,
  useFormErrorLogger,
  type FormErrorContext,
  type FormErrorType,
} from "./form-error-logger";

export type {
  AuthLogContext,
  LogContext,
  LogLevel,
} from "./types";
