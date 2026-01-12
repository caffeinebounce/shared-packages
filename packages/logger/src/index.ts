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
// API route wrapper with error logging
export type {
  ApiErrorCode,
  ApiHandler,
  ErrorLoggingContext,
} from "./api-wrapper";
export { withErrorLogging } from "./api-wrapper";
export { authLogger } from "./auth-logger";
// Deployment environment detection
export {
  clearEnvironmentCache,
  type DeploymentEnvironment,
  detectDeploymentEnvironment,
  getDeploymentEnvironment,
} from "./environment";
export type {
  ApiErrorContext,
  ApiErrorResponse,
} from "./error-logger";

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
// Form error logging utilities
export {
  type FormErrorContext,
  type FormErrorType,
  useFormErrorLogger,
  useLogFormNetworkError,
  useLogFormSubmissionError,
  useLogFormValidationError,
} from "./form-error-logger";
export {
  getClientLogger,
  getServerLogger,
  Logger,
  logger,
} from "./logger";
export type {
  AuthLogContext,
  LogContext,
  LogLevel,
} from "./types";
// Client-side error logging hooks
export {
  type ErrorLogContext,
  useErrorLogger,
} from "./use-error-logger";
// Client-safe error logging (no @logtail/next dependency)
export {
  type SafeErrorLogContext,
  useErrorLoggerSafe,
} from "./use-error-logger-safe";
