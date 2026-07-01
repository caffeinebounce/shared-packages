/**
 * Type definitions for the logger
 */

/**
 * Log levels matching Better Stack/Logtail
 */
export type LogLevel = "debug" | "info" | "warn" | "error";

/**
 * Base context for all logs
 */
export interface LogContext {
  event: string;
  [key: string]: unknown;
}

/**
 * Authentication event context
 */
export interface AuthLogContext extends LogContext {
  userId?: string;
  accountDomain?: string;
  provider?: string;
  mfaUsed?: boolean;
  requestId?: string;
  userAgent?: string;
  ip?: string;
}

/**
 * Sensitive field keys that should never be logged
 */
export const SENSITIVE_KEYS = [
  "password",
  "token",
  "accessToken",
  "refreshToken",
  "secret",
  "apiKey",
  "privateKey",
  "authorization",
  "cookie",
  "sessionId",
  "email",
] as const;
