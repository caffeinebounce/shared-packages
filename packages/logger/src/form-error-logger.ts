/**
 * Form error logging utilities
 *
 * Provides convenient helpers for logging form-related errors
 * including validation errors, submission errors, and network errors
 */

import { useLogger } from "@logtail/next";
import { useCallback } from "react";

export type FormErrorType =
  | "validation"
  | "submission"
  | "network"
  | "auth"
  | "unknown";

export interface FormErrorContext {
  formName: string;
  userId?: string;
  fieldName?: string;
  errorType: FormErrorType;
  message: string;
  metadata?: Record<string, unknown>;
}

/**
 * Hook for logging form-related errors
 *
 * Provides structured logging for form validation errors, submission errors,
 * and network errors that occur during form operations
 *
 * @returns Object with form error logging function
 *
 * @example
 * ```typescript
 * import { useFormErrorLogger } from "@caffeinebounce/logger";
 *
 * export function LoginForm() {
 *   const logFormError = useFormErrorLogger();
 *
 *   const handleSubmit = async (email: string, password: string) => {
 *     try {
 *       const result = validateEmail(email);
 *       if (!result.valid) {
 *         logFormError({
 *           formName: "LoginForm",
 *           fieldName: "email",
 *           errorType: "validation",
 *           message: result.error,
 *         });
 *         return;
 *       }
 *
 *       const user = await signIn(email, password);
 *     } catch (error) {
 *       logFormError({
 *         formName: "LoginForm",
 *         errorType: "submission",
 *         message: error instanceof Error ? error.message : "Unknown error",
 *       });
 *     }
 *   };
 *
 *   return <form onSubmit={handleSubmit}>...</form>;
 * }
 * ```
 */
export function useFormErrorLogger() {
  const { warn: logWarn, error: logError } = useLogger();

  const logFormError = useCallback(
    (context: FormErrorContext) => {
      const logFn = context.errorType === "validation" ? logWarn : logError;

      logFn(`Form error: ${context.formName}`, {
        event: `form.error.${context.errorType}`,
        form: context.formName,
        userId: context.userId,
        field: context.fieldName,
        errorType: context.errorType,
        message: context.message,
        timestamp: new Date().toISOString(),
        ...context.metadata,
      });
    },
    [logError, logWarn],
  );

  return logFormError;
}

/**
 * Log form validation error
 *
 * Convenience function for logging validation errors with consistent structure
 *
 * @param formName Name of the form
 * @param fieldName Field that failed validation
 * @param message Validation error message
 * @param userId Optional user ID
 *
 * @example
 * ```typescript
 * import { logFormValidationError } from "@caffeinebounce/logger";
 *
 * const result = validateEmail(email);
 * if (!result.valid) {
 *   logFormValidationError("LoginForm", "email", result.error, userId);
 * }
 * ```
 */
export function logFormValidationError(
  formName: string,
  fieldName: string,
  message: string,
  userId?: string,
): void {
  const { warn } = useLogger();
  warn(`Form validation error: ${formName}`, {
    event: "form.error.validation",
    form: formName,
    field: fieldName,
    message,
    userId,
    errorType: "validation",
    timestamp: new Date().toISOString(),
  });
}

/**
 * Log form submission error
 *
 * Convenience function for logging errors that occur during form submission
 *
 * @param formName Name of the form
 * @param message Error message
 * @param metadata Additional context (status code, endpoint, etc.)
 * @param userId Optional user ID
 *
 * @example
 * ```typescript
 * import { logFormSubmissionError } from "@caffeinebounce/logger";
 *
 * try {
 *   await submitForm(data);
 * } catch (error) {
 *   logFormSubmissionError(
 *     "RegistrationForm",
 *     error instanceof Error ? error.message : "Unknown error",
 *     { endpoint: "/api/auth/register", statusCode: 400 },
 *     userId
 *   );
 * }
 * ```
 */
export function logFormSubmissionError(
  formName: string,
  message: string,
  metadata?: Record<string, unknown>,
  userId?: string,
): void {
  const { error } = useLogger();
  error(`Form submission error: ${formName}`, {
    event: "form.error.submission",
    form: formName,
    message,
    userId,
    errorType: "submission",
    timestamp: new Date().toISOString(),
    ...metadata,
  });
}

/**
 * Log form network error
 *
 * Convenience function for logging network-related form errors
 *
 * @param formName Name of the form
 * @param message Error message
 * @param statusCode HTTP status code (if available)
 * @param userId Optional user ID
 *
 * @example
 * ```typescript
 * import { logFormNetworkError } from "@caffeinebounce/logger";
 *
 * try {
 *   const response = await fetch("/api/data");
 *   if (!response.ok) {
 *     logFormNetworkError(
 *       "DataForm",
 *       `Server error: ${response.statusText}`,
 *       response.status,
 *       userId
 *     );
 *   }
 * } catch (error) {
 *   logFormNetworkError(
 *     "DataForm",
 *     "Network request failed",
 *     undefined,
 *     userId
 *   );
 * }
 * ```
 */
export function logFormNetworkError(
  formName: string,
  message: string,
  statusCode?: number,
  userId?: string,
): void {
  const { error } = useLogger();
  error(`Form network error: ${formName}`, {
    event: "form.error.network",
    form: formName,
    message,
    statusCode,
    userId,
    errorType: "network",
    timestamp: new Date().toISOString(),
  });
}
