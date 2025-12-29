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
 * import { useLogFormValidationError } from "@caffeinebounce/logger";
 *
 * const logValidationError = useLogFormValidationError();
 *
 * // In your form handler
 * logValidationError("RegistrationForm", "email", "Invalid email format", userId);
 * ```
 */
export function useLogFormValidationError() {
  const { warn } = useLogger();

  return (
    formName: string,
    fieldName: string,
    message: string,
    userId?: string,
  ) => {
    warn(`Form validation error: ${formName}`, {
      event: "form.error.validation",
      form: formName,
      field: fieldName,
      message,
      userId,
      errorType: "validation",
      timestamp: new Date().toISOString(),
    });
  };
}

/**
 * Hook to log form submission error
 *
 * Returns a function for logging errors that occur during form submission
 *
 * @example
 * ```typescript
 * import { useLogFormSubmissionError } from "@caffeinebounce/logger";
 *
 * const logSubmissionError = useLogFormSubmissionError();
 *
 * try {
 *   await submitForm(data);
 * } catch (error) {
 *   logSubmissionError(
 *     "RegistrationForm",
 *     error instanceof Error ? error.message : "Unknown error",
 *     { endpoint: "/api/auth/register", statusCode: 400 },
 *     userId
 *   );
 * }
 * ```
 */
export function useLogFormSubmissionError() {
  const { error } = useLogger();

  return (
    formName: string,
    message: string,
    metadata?: Record<string, unknown>,
    userId?: string,
  ) => {
    error(`Form submission error: ${formName}`, {
      event: "form.error.submission",
      form: formName,
      message,
      userId,
      errorType: "submission",
      timestamp: new Date().toISOString(),
      ...metadata,
    });
  };
}

/**
 * Hook to log form network error
 *
 * Returns a function for logging network-related form errors
 *
 * @example
 * ```typescript
 * import { useLogFormNetworkError } from "@caffeinebounce/logger";
 *
 * const logNetworkError = useLogFormNetworkError();
 *
 * try {
 *   const response = await fetch("/api/data");
 *   if (!response.ok) {
 *     logNetworkError(
 *       "DataForm",
 *       `Server error: ${response.statusText}`,
 *       response.status,
 *       userId
 *     );
 *   }
 * } catch (error) {
 *   logNetworkError(
 *     "DataForm",
 *     "Network request failed",
 *     undefined,
 *     userId
 *   );
 * }
 * ```
 */
export function useLogFormNetworkError() {
  const { error } = useLogger();

  return (
    formName: string,
    message: string,
    statusCode?: number,
    userId?: string,
  ) => {
    error(`Form network error: ${formName}`, {
      event: "form.error.network",
      form: formName,
      message,
      statusCode,
      userId,
      errorType: "network",
      timestamp: new Date().toISOString(),
    });
  };
}
