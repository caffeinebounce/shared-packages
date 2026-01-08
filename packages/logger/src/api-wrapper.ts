/**
 * API Route Wrapper with Error Logging
 *
 * Provides a higher-order function to wrap Next.js API route handlers with
 * automatic error logging, correlation ID tracking, and standardized error responses.
 *
 * @example
 * ```typescript
 * import { withErrorLogging } from "@caffeinebounce/logger";
 *
 * export const GET = withErrorLogging(
 *   async (req: NextRequest) => {
 *     // Your route logic here
 *     return NextResponse.json({ data });
 *   },
 *   { endpoint: "/api/companies", method: "GET" }
 * );
 * ```
 */

import { type NextRequest, NextResponse } from "next/server";
import {
  createApiErrorResponse,
  extractSupabaseErrorContext,
  extractValidationErrorContext,
  getOrGenerateCorrelationId,
} from "./error-logger";
import { getServerLogger } from "./logger";

// ============================================
// Types
// ============================================

/**
 * API handler type that can optionally accept route context (for dynamic routes).
 */
export type ApiHandler<TContext = unknown> = TContext extends undefined
  ? (req: NextRequest) => Promise<NextResponse> | NextResponse
  : (
      req: NextRequest,
      context: TContext,
    ) => Promise<NextResponse> | NextResponse;

/**
 * Context passed to the error logging wrapper.
 */
export interface ErrorLoggingContext {
  /** The API endpoint path, e.g. "/api/companies" */
  endpoint: string;
  /** HTTP method */
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  /** Optional user ID for context */
  userId?: string;
}

/**
 * Standardized API error codes.
 */
export type ApiErrorCode =
  | "validation_error"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "rate_limited"
  | "supabase_error"
  | "internal_error";

// ============================================
// Helper Functions
// ============================================

/**
 * Determines the appropriate HTTP status code based on the error type.
 */
function determineStatusCode(error: unknown): number {
  // Type guard for errors with status or statusCode properties
  if (
    error &&
    typeof error === "object" &&
    ("status" in error || "statusCode" in error)
  ) {
    const statusError = error as { status?: number; statusCode?: number };
    const status = statusError.status ?? statusError.statusCode;
    if (typeof status === "number" && status >= 400 && status < 600) {
      return status;
    }
  }

  // Check for validation errors by message pattern
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (
      message.includes("validation") ||
      message.includes("invalid") ||
      message.includes("required")
    ) {
      return 400;
    }
    if (
      message.includes("unauthorized") ||
      message.includes("not authenticated")
    ) {
      return 401;
    }
    if (message.includes("forbidden") || message.includes("not allowed")) {
      return 403;
    }
    if (message.includes("not found")) {
      return 404;
    }
  }

  // Default to 500 for unclassified errors
  return 500;
}

/**
 * Checks if an error code looks like a Supabase/Postgres error code.
 * Postgres error codes are 5-character strings like "23505" (unique violation).
 * Supabase also uses codes like "PGRST116" for PostgREST errors.
 */
function isSupabaseErrorCode(code: unknown): boolean {
  if (typeof code !== "string") return false;
  // Postgres error codes: 5-digit alphanumeric (e.g., "23505", "42P01")
  if (/^[0-9A-Z]{5}$/.test(code)) return true;
  // PostgREST error codes (e.g., "PGRST116")
  if (/^PGRST\d+$/.test(code)) return true;
  // Supabase Auth error codes (e.g., "invalid_credentials")
  if (code.includes("_") && !code.includes(" ")) return true;
  return false;
}

/**
 * Determines the standardized error code based on error type and status code.
 */
function determineErrorCode(error: unknown, statusCode: number): ApiErrorCode {
  // Check for Supabase-style errors with specific error code patterns
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    isSupabaseErrorCode((error as { code: unknown }).code)
  ) {
    return "supabase_error";
  }

  switch (statusCode) {
    case 400:
      return "validation_error";
    case 401:
      return "unauthorized";
    case 403:
      return "forbidden";
    case 404:
      return "not_found";
    case 409:
      return "conflict";
    case 429:
      return "rate_limited";
    default:
      return "internal_error";
  }
}

/**
 * Safely converts an error to a Supabase-like shape for context extraction.
 */
function toSupabaseLike(error: unknown): {
  message?: string;
  code?: string;
  details?: string;
} {
  if (error && typeof error === "object") {
    const candidate = error as {
      message?: string;
      code?: string;
      details?: string;
    };
    return {
      message: candidate.message,
      code: candidate.code,
      details: candidate.details,
    };
  }
  return {};
}

/**
 * Safely converts an error to a validation-like shape for context extraction.
 */
function toValidationLike(error: unknown): {
  field?: string;
  value?: unknown;
  reason?: string;
} {
  if (error && typeof error === "object") {
    const candidate = error as {
      field?: string;
      value?: unknown;
      reason?: string;
    };
    return {
      field: candidate.field,
      value: candidate.value,
      reason: candidate.reason,
    };
  }
  return {};
}

/**
 * Extracts a detailed human-readable error message from various error types.
 * Handles Error instances, Supabase errors (plain objects with message), database errors, and other types.
 * This version has more sophisticated handling than the basic extractErrorMessage in error-logger.ts,
 * including support for error/error_description fields and database error code formatting.
 */
function extractDetailedErrorMessage(error: unknown): string {
  // Standard Error instance
  if (error instanceof Error) {
    return error.message;
  }

  // Plain object with message property (Supabase errors)
  if (error && typeof error === "object") {
    const obj = error as Record<string, unknown>;

    // Try common message fields in order of preference
    if (typeof obj.message === "string" && obj.message) {
      return obj.message;
    }
    if (typeof obj.error === "string" && obj.error) {
      return obj.error;
    }
    if (typeof obj.error_description === "string" && obj.error_description) {
      return obj.error_description;
    }

    // Include code if available for context
    if (typeof obj.code === "string" && obj.code) {
      const details = typeof obj.details === "string" ? `: ${obj.details}` : "";
      return `Database error (${obj.code})${details}`;
    }

    // Last resort: try to serialize meaningfully
    try {
      return JSON.stringify(error);
    } catch {
      return "[Unserializable error object]";
    }
  }

  // Primitive types
  if (typeof error === "string") {
    return error;
  }

  return String(error);
}

/**
 * Maximum depth for extracting nested error causes.
 * Prevents infinite recursion from circular references.
 */
const MAX_CAUSE_DEPTH = 10;

/**
 * Extracts nested error cause chain for better debugging.
 * postgres.js and other libraries wrap underlying errors in `cause`.
 * This recursively extracts the full cause chain with depth limiting
 * and circular reference detection to prevent infinite loops.
 */
function extractErrorCause(
  error: unknown,
  depth = 0,
  visited = new WeakSet<object>(),
): Record<string, unknown> | undefined {
  if (!error || typeof error !== "object") {
    return undefined;
  }

  // Prevent infinite recursion from deep cause chains
  if (depth > MAX_CAUSE_DEPTH) {
    return { truncated: true, reason: "max depth exceeded" };
  }

  // Detect circular references
  const errorTarget = error as object;
  if (visited.has(errorTarget)) {
    return { circular: true };
  }
  visited.add(errorTarget);

  const errorObj = error as Record<string, unknown>;

  // Build a comprehensive error details object
  const details: Record<string, unknown> = {};

  // Extract postgres.js specific properties
  if ("query" in errorObj) {
    details.query = String(errorObj.query).substring(0, 200); // Truncate long queries
  }
  if ("parameters" in errorObj) {
    // Sanitize parameters to avoid logging sensitive data like passwords or tokens
    const rawParameters = errorObj.parameters as unknown;
    if (Array.isArray(rawParameters)) {
      details.parameters = {
        kind: "array",
        count: rawParameters.length,
      };
    } else if (rawParameters && typeof rawParameters === "object") {
      const keys = Object.keys(rawParameters as Record<string, unknown>);
      details.parameters = {
        kind: "object",
        keys,
        count: keys.length,
      };
    } else if (rawParameters !== undefined && rawParameters !== null) {
      details.parameters = {
        kind: "other",
        type: typeof rawParameters,
      };
    }
  }
  if ("code" in errorObj) {
    details.code = errorObj.code;
  }
  if ("severity" in errorObj) {
    details.severity = errorObj.severity;
  }
  if ("detail" in errorObj) {
    details.detail = errorObj.detail;
  }
  if ("hint" in errorObj) {
    details.hint = errorObj.hint;
  }
  if ("position" in errorObj) {
    details.position = errorObj.position;
  }
  if ("constraint" in errorObj) {
    details.constraint = errorObj.constraint;
  }

  // Recursively extract cause chain with depth tracking
  if ("cause" in errorObj && errorObj.cause) {
    const causeError = errorObj.cause;
    if (causeError instanceof Error) {
      details.cause = {
        message: causeError.message,
        name: causeError.name,
        ...(causeError.cause
          ? { nestedCause: extractErrorCause(causeError, depth + 1, visited) }
          : {}),
      };
    } else if (typeof causeError === "object") {
      details.cause = extractErrorCause(causeError, depth + 1, visited);
    } else {
      details.cause = String(causeError);
    }
  }

  return Object.keys(details).length > 0 ? details : undefined;
}

// ============================================
// Main Wrapper Function
// ============================================

/**
 * Wraps an API route handler with structured error logging and correlation tracking.
 *
 * Automatically:
 * - Generates/extracts correlation IDs for request tracing
 * - Logs errors with full context before responding
 * - Returns standardized error responses
 * - Captures stack traces and error types
 * - Extracts Supabase and validation error context
 *
 * @example Simple route without context
 * ```typescript
 * export const GET = withErrorLogging(
 *   async (req: NextRequest) => {
 *     const data = await fetchData();
 *     return NextResponse.json({ data });
 *   },
 *   { endpoint: "/api/companies", method: "GET" }
 * );
 * ```
 *
 * @example Dynamic route with context
 * ```typescript
 * export const GET = withErrorLogging(
 *   async (req: NextRequest, { params }: { params: { id: string } }) => {
 *     const data = await fetchById(params.id);
 *     return NextResponse.json({ data });
 *   },
 *   { endpoint: "/api/companies/[id]", method: "GET" }
 * );
 * ```
 */
// Overload for handlers with context parameter (dynamic routes)
export function withErrorLogging<TContext extends NonNullable<unknown>>(
  handler: ApiHandler<TContext>,
  context: ErrorLoggingContext,
): ApiHandler<TContext>;

// Overload for handlers without context parameter (simple routes)
export function withErrorLogging(
  handler: ApiHandler<undefined>,
  context: ErrorLoggingContext,
): ApiHandler<undefined>;

// Implementation
export function withErrorLogging<TContext = undefined>(
  handler: ApiHandler<TContext>,
  context: ErrorLoggingContext,
): ApiHandler<TContext> {
  return (async (
    req: NextRequest,
    routeContext?: TContext,
  ): Promise<NextResponse> => {
    const logger = getServerLogger();

    const correlationId = getOrGenerateCorrelationId(req);

    try {
      // Execute the route handler with proper context passing
      let result: NextResponse | Promise<NextResponse>;
      if (routeContext !== undefined) {
        const handlerWithContext = handler as (
          req: NextRequest,
          context: TContext,
        ) => Promise<NextResponse> | NextResponse;
        result = handlerWithContext(req, routeContext);
      } else {
        const handlerWithoutContext = handler as (
          req: NextRequest,
        ) => Promise<NextResponse> | NextResponse;
        result = handlerWithoutContext(req);
      }

      const response = await result;

      if (logger) {
        // Log successful requests at info level
        logger.info(`[${context.method}] ${context.endpoint} - Success`, {
          event: "api.request.success",
          endpoint: context.endpoint,
          method: context.method,
          userId: context.userId,
          correlationId,
          statusCode: response.status,
        });
      }

      // Add correlation ID to response headers for tracing
      response.headers.set("x-correlation-id", correlationId);

      return response;
    } catch (error) {
      // Extract error details - handle Supabase errors which are plain objects with message property
      const errorMessage = extractDetailedErrorMessage(error);
      const errorType =
        error instanceof Error ? error.constructor.name : typeof error;
      const stack = error instanceof Error ? error.stack : undefined;

      // Extract cause chain for postgres.js and other nested errors
      const errorCause = extractErrorCause(error);

      // Determine appropriate status code and standardized error code
      const statusCode = determineStatusCode(error);
      const errorCode = determineErrorCode(error, statusCode);

      if (logger) {
        // Extract specialized error contexts
        const supabaseContext = extractSupabaseErrorContext(
          toSupabaseLike(error),
        );
        const validationContext = extractValidationErrorContext(
          toValidationLike(error),
        );

        // Log the error with full context
        logger.error(
          `[${context.method}] ${context.endpoint} - ${errorMessage}`,
          {
            event: "api.request.error",
            endpoint: context.endpoint,
            method: context.method,
            userId: context.userId,
            correlationId,
            statusCode,
            errorType,
            errorMessage,
            errorCause, // Include nested error cause for postgres.js and other wrapped errors
            stack,
            ...supabaseContext,
            ...validationContext,
          },
        );
      }

      // Return standardized error response
      const errorResponse = {
        ...createApiErrorResponse(errorMessage, correlationId),
        code: errorCode,
      };

      const response = NextResponse.json(errorResponse, { status: statusCode });
      response.headers.set("x-correlation-id", correlationId);
      return response;
    }
  }) as ApiHandler<TContext>;
}
