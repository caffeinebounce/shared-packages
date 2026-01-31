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

import { NextResponse } from "next/server.js";
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
 * Permissive request/response types for cross-version Next.js compatibility.
 * These use `any` to avoid type conflicts when Next.js minor versions differ between packages.
 * We only need the headers property for correlation ID extraction at runtime.
 */
// biome-ignore lint/suspicious/noExplicitAny: Required for cross-version Next.js compatibility
type AnyRequest = any;
// biome-ignore lint/suspicious/noExplicitAny: Required for cross-version Next.js compatibility
type AnyResponse = any;

/**
 * API handler type that can optionally accept route context (for dynamic routes).
 * Uses permissive types for cross-version Next.js compatibility.
 */
export type ApiHandler<TContext = unknown> = TContext extends undefined
  ? (req: AnyRequest) => Promise<AnyResponse> | AnyResponse
  : (req: AnyRequest, context: TContext) => Promise<AnyResponse> | AnyResponse;

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
 * Patterns that indicate SQL content in error messages.
 * These are used to detect and sanitize database query leaks.
 */
const SQL_PATTERNS = [
  // SQL keywords at word boundaries (case insensitive matching done separately)
  /\b(SELECT|INSERT|UPDATE|DELETE|FROM|WHERE|JOIN|INNER\s+JOIN|LEFT\s+JOIN|RIGHT\s+JOIN|OUTER\s+JOIN|ON|AND|OR|ORDER\s+BY|GROUP\s+BY|HAVING|LIMIT|OFFSET|VALUES|SET|INTO)\b/i,
  // Quoted identifiers like "table"."column"
  /"[\w_]+"(\."[\w_]+")+/,
  // Parameter placeholders like $1, $2
  /\$\d+/,
  // Failed query prefix (postgres.js style)
  /Failed query:/i,
  // Params suffix (postgres.js style)
  /params:\s*[\d,\s]+$/i,
];

/**
 * User-friendly error messages based on error codes.
 * Maps internal/database error codes to human-readable messages.
 */
const FRIENDLY_ERROR_MESSAGES: Record<string, string> = {
  // PostgreSQL error codes
  "23505": "A record with this value already exists",
  "23503": "This operation references data that doesn't exist",
  "23502": "Required information is missing",
  "22P02": "Invalid input format",
  "42P01": "The requested resource could not be found",
  "42703": "Invalid field reference",
  // Generic fallbacks
  database: "A database error occurred",
  internal: "An internal error occurred",
  validation: "Invalid request data",
};

/**
 * Sanitizes an error message for client consumption by removing SQL queries
 * and other sensitive database implementation details.
 *
 * This function:
 * - Uses friendly messages for known database error codes
 * - Detects SQL patterns (SELECT, INSERT, quoted identifiers, etc.)
 * - Replaces them with generic, user-friendly messages
 * - Preserves safe error messages when possible
 *
 * @param message - The raw error message that may contain SQL
 * @param errorCode - Optional database error code for better friendly messages
 * @returns A sanitized message safe to return to clients
 *
 * @example
 * ```typescript
 * // SQL query gets sanitized
 * sanitizeErrorMessageForClient('Failed query: SELECT "id" FROM "users" WHERE "email" = $1');
 * // Returns: "A database error occurred"
 *
 * // Error code provides friendly message
 * sanitizeErrorMessageForClient('duplicate key value...', '23505');
 * // Returns: "A record with this value already exists"
 *
 * // Non-SQL errors pass through
 * sanitizeErrorMessageForClient('Invalid email format');
 * // Returns: "Invalid email format"
 * ```
 */
export function sanitizeErrorMessageForClient(
  message: string,
  errorCode?: string,
): string {
  // Priority 1: Check for specific PostgreSQL error codes (most reliable)
  if (errorCode && FRIENDLY_ERROR_MESSAGES[errorCode]) {
    return FRIENDLY_ERROR_MESSAGES[errorCode];
  }

  // Priority 2: Check if message contains SQL patterns
  const containsSql = SQL_PATTERNS.some((pattern) => pattern.test(message));

  if (containsSql) {
    // Message contains SQL - try to infer a friendly message from content
    const lowerMessage = message.toLowerCase();

    if (
      lowerMessage.includes("not found") ||
      lowerMessage.includes("no rows") ||
      lowerMessage.includes("does not exist")
    ) {
      return "The requested resource was not found";
    }

    if (
      lowerMessage.includes("unique") ||
      lowerMessage.includes("duplicate") ||
      lowerMessage.includes("already exists")
    ) {
      return "A record with this value already exists";
    }

    if (
      lowerMessage.includes("foreign key") ||
      lowerMessage.includes("violates foreign")
    ) {
      return "This operation references data that doesn't exist";
    }

    if (
      lowerMessage.includes("not-null") ||
      (lowerMessage.includes("null") && lowerMessage.includes("violates"))
    ) {
      return "Required information is missing";
    }

    if (
      lowerMessage.includes("invalid") ||
      lowerMessage.includes("malformed")
    ) {
      return "Invalid input format";
    }

    // Default for SQL-containing messages
    return FRIENDLY_ERROR_MESSAGES.database;
  }

  // Priority 3: No SQL detected - sanitize any quoted identifiers that might leak schema
  // Remove patterns like "table_name" or "column_name" that look like SQL identifiers
  const sanitized = message.replace(/"[\w_]+"/g, "[field]");
  return sanitized;
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
    req: AnyRequest,
    routeContext?: TContext,
  ): Promise<AnyResponse> => {
    const logger = getServerLogger();

    const correlationId = getOrGenerateCorrelationId(req);

    try {
      // Execute the route handler with proper context passing
      let result: AnyResponse | Promise<AnyResponse>;
      if (routeContext !== undefined) {
        const handlerWithContext = handler as (
          req: AnyRequest,
          context: TContext,
        ) => Promise<AnyResponse> | AnyResponse;
        result = handlerWithContext(req, routeContext);
      } else {
        const handlerWithoutContext = handler as (
          req: AnyRequest,
        ) => Promise<AnyResponse> | AnyResponse;
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

      // Extract database error code if available (for better friendly messages)
      const dbErrorCode =
        error && typeof error === "object" && "code" in error
          ? String((error as { code: unknown }).code)
          : undefined;

      // Sanitize error message for client response (removes SQL queries and schema details)
      // Full error details are preserved in logs for debugging
      const clientMessage = sanitizeErrorMessageForClient(
        errorMessage,
        dbErrorCode,
      );

      if (logger) {
        // Extract specialized error contexts
        const supabaseContext = extractSupabaseErrorContext(
          toSupabaseLike(error),
        );
        const validationContext = extractValidationErrorContext(
          toValidationLike(error),
        );

        // Log the error with full context (including raw SQL for debugging)
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
            errorMessage, // Full message for debugging (not sent to client)
            clientMessage, // Sanitized message that was sent to client
            errorCause, // Include nested error cause for postgres.js and other wrapped errors
            stack,
            ...supabaseContext,
            ...validationContext,
          },
        );
      }

      // Return standardized error response with SANITIZED message (no SQL leaks)
      const errorResponse = {
        ...createApiErrorResponse(clientMessage, correlationId),
        code: errorCode,
      };

      const response = NextResponse.json(errorResponse, { status: statusCode });
      response.headers.set("x-correlation-id", correlationId);
      return response;
    }
  }) as ApiHandler<TContext>;
}
