/**
 * Error logging utilities
 *
 * Generic error logging helpers for API routes and error handling
 * Integrates with Better Stack for centralized error tracking
 */

import type { NextRequest } from "next/server";

export interface ApiErrorContext {
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  userId?: string;
  correlationId?: string;
  statusCode: number;
  error: unknown;
  details?: Record<string, unknown>;
}

/**
 * Standard API error response with correlation ID
 */
export interface ApiErrorResponse {
  error: string;
  correlationId: string;
  timestamp: string;
  details?: Record<string, unknown>;
}

/**
 * Extract or generate correlation ID for request tracing
 *
 * Looks for existing correlation/request ID headers, or generates a new one.
 * The ID is used to link related logs together in Better Stack.
 *
 * Checks headers in order:
 * 1. x-correlation-id
 * 2. x-request-id
 * 3. x-trace-id
 * 4. Generates new ID if none found
 *
 * @param req NextRequest object
 * @returns Correlation ID string
 *
 * @example
 * ```typescript
 * import { getOrGenerateCorrelationId } from "@caffeinebounce/logger";
 *
 * export async function GET(req: NextRequest) {
 *   const correlationId = getOrGenerateCorrelationId(req);
 *   // Use correlationId in responses and error logging
 *   return NextResponse.json({ data, correlationId });
 * }
 * ```
 */
export function getOrGenerateCorrelationId(req: NextRequest): string {
  // Check for existing correlation ID from upstream or client
  const existingId =
    req.headers.get("x-correlation-id") ||
    req.headers.get("x-request-id") ||
    req.headers.get("x-trace-id");

  if (existingId) {
    return existingId;
  }

  // Generate new correlation ID: format: req-timestamp-random
  // Example: req-1704067200000-a7b3c9d2
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 10);
  return `req-${timestamp}-${random}`;
}

/**
 * Extract user-friendly error message from various error types
 *
 * Handles:
 * - Error objects (uses message property)
 * - Strings (returns as-is)
 * - Objects with error property
 * - Supabase errors
 * - Unknown types (converts to string)
 *
 * @param error Error of any type
 * @returns User-friendly error message
 */
export function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof (error as any).message === "string"
  ) {
    return (error as any).message;
  }

  return String(error || "Unknown error");
}

/**
 * Extract error type/constructor name
 *
 * @param error Error of any type
 * @returns Error type name
 */
export function extractErrorType(error: unknown): string {
  if (error instanceof Error) {
    return error.constructor.name;
  }

  if (typeof error === "object" && error !== null) {
    return (error as any).constructor?.name || "Object";
  }

  return typeof error;
}

/**
 * Extract stack trace if available
 *
 * @param error Error of any type
 * @returns Stack trace string or undefined
 */
export function extractErrorStack(error: unknown): string | undefined {
  if (error instanceof Error) {
    return error.stack;
  }

  return undefined;
}

/**
 * Extract relevant error context from a Supabase error
 *
 * Handles Supabase-specific error format and extracts useful debugging info
 * without exposing sensitive information
 *
 * @param error Supabase error object
 * @returns Extracted error details
 *
 * @example
 * ```typescript
 * const { data, error } = await supabase.from("users").select();
 * if (error) {
 *   const context = extractSupabaseErrorContext(error);
 *   logger.error("Database error", { ...context });
 * }
 * ```
 */
export function extractSupabaseErrorContext(error: {
  message?: string;
  code?: string;
  details?: string;
}): Record<string, unknown> {
  return {
    errorCode: error.code,
    errorDetails: error.details,
    // Don't include raw message as it might be logged elsewhere
  };
}

/**
 * Extract relevant error context from a validation error
 *
 * Safely extracts validation details without exposing sensitive values
 *
 * @param error Validation error object
 * @returns Extracted validation details
 *
 * @example
 * ```typescript
 * try {
 *   validateEmail(email);
 * } catch (error) {
 *   const context = extractValidationErrorContext(error);
 *   logger.warn("Validation failed", context);
 * }
 * ```
 */
export function extractValidationErrorContext(error: {
  field?: string;
  value?: unknown;
  reason?: string;
}): Record<string, unknown> {
  return {
    field: error.field,
    // Don't log the actual value as it might be sensitive
    valueType: typeof error.value,
    reason: error.reason,
  };
}

/**
 * Create a standard API error response with correlation ID
 *
 * @param message Error message to send to client
 * @param correlationId Request correlation ID
 * @param details Optional additional error details
 * @returns Formatted error response
 *
 * @example
 * ```typescript
 * import { createApiErrorResponse } from "@caffeinebounce/logger";
 *
 * export async function POST(req: NextRequest) {
 *   try {
 *     // handle request
 *   } catch (error) {
 *     const response = createApiErrorResponse(
 *       "Failed to process request",
 *       correlationId
 *     );
 *     return NextResponse.json(response, { status: 500 });
 *   }
 * }
 * ```
 */
export function createApiErrorResponse(
  message: string,
  correlationId: string,
  details?: Record<string, unknown>,
): ApiErrorResponse {
  return {
    error: message,
    correlationId,
    timestamp: new Date().toISOString(),
    ...(details && { details }),
  };
}
