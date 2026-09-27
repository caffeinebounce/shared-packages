/**
 * Client-safe error message sanitization
 *
 * Framework-neutral: no Next.js or @logtail/next imports, so it is safe to use
 * from plain Node processes through `@caffeinebounce/logger/node`.
 */

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
      lowerMessage.includes("not allowed") ||
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
