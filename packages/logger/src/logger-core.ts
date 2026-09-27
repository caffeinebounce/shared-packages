/**
 * Framework-neutral logger core
 *
 * Holds the structured logging behavior shared by every entrypoint: console
 * fallback, deployment environment tagging, and auth context sanitization.
 * Entry-specific subclasses decide which Better Stack sink to use, so this
 * module must not import `next` or the `@logtail/next` package index.
 */

import { getDeploymentEnvironment } from "./environment";
import type { AuthLogContext, LogContext, LogLevel } from "./types";
import { SENSITIVE_KEYS } from "./types";

const DEFAULT_INGESTING_URL = "https://in.logs.betterstack.com";

/**
 * Minimal logging surface a Better Stack sink must provide.
 */
export interface LogSink {
  debug(message: string, args?: Record<string, unknown>): void;
  info(message: string, args?: Record<string, unknown>): void;
  warn(message: string, args?: Record<string, unknown>): void;
  error(message: string, args?: Record<string, unknown>): void;
}

/**
 * Structured logger methods the auth and admin helpers depend on.
 */
export type StructuredLogger = Pick<
  BaseLogger,
  "debug" | "info" | "warn" | "error" | "auth"
>;

export interface SinkSettings {
  token: string;
  ingestingUrl: string;
}

/**
 * Resolve the server-side Better Stack token and ingesting URL from env.
 * Returns null (and warns outside CI) when no token is configured.
 */
export function resolveServerSinkSettings(): SinkSettings | null {
  const token =
    process.env.BETTER_STACK_SOURCE_TOKEN || process.env.LOGTAIL_SOURCE_TOKEN;
  const ingestingUrl =
    process.env.BETTER_STACK_INGESTING_URL ||
    process.env.LOGTAIL_URL ||
    DEFAULT_INGESTING_URL;

  if (!token) {
    // Only warn in non-CI environments to avoid noisy CI logs
    if (!process.env.CI) {
      console.warn(
        "[Logger] No server token found. Set BETTER_STACK_SOURCE_TOKEN in .env.local",
      );
    }
    return null;
  }

  return { token, ingestingUrl };
}

/**
 * Resolve the browser-side Better Stack token and ingesting URL from env.
 * Returns null (and warns outside CI) when no token is configured.
 */
export function resolveClientSinkSettings(): SinkSettings | null {
  const token =
    process.env.NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN ||
    process.env.NEXT_PUBLIC_LOGTAIL_SOURCE_TOKEN;
  const ingestingUrl =
    process.env.NEXT_PUBLIC_BETTER_STACK_INGESTING_URL ||
    process.env.NEXT_PUBLIC_LOGTAIL_URL ||
    DEFAULT_INGESTING_URL;

  if (!token) {
    // Only warn in non-CI environments to avoid noisy CI logs
    if (!process.env.CI) {
      console.warn(
        "[Logger] No client token found. Set NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN in .env.local",
      );
    }
    return null;
  }

  return { token, ingestingUrl };
}

/**
 * Ensure the logtail config has the token and ingesting URL set.
 * The @logtail/next library reads from process.env at module load,
 * but we need to ensure it's set before creating loggers.
 */
export function applySinkSettings(
  logtailConfig: unknown,
  { token, ingestingUrl }: SinkSettings,
): void {
  // Cast to any to set properties on the config object
  // biome-ignore lint/suspicious/noExplicitAny: Required to set private config properties
  const cfg = logtailConfig as any;
  cfg.token = token;
  cfg.ingestingUrl = ingestingUrl;
}

/**
 * Shared structured logger. Subclasses choose the Better Stack sink.
 */
export abstract class BaseLogger {
  protected abstract getSink(): LogSink | null;

  private log(level: LogLevel, message: string, context?: LogContext): void {
    const logger = this.getSink();

    if (!logger) {
      // Fallback to console if logger not configured
      console[level](message, context);
      return;
    }

    // Get hostname from context if available (for accurate environment detection)
    const hostname =
      (context?.requestHost as string) || (context?.host as string) || null;

    const logData = {
      message,
      timestamp: new Date().toISOString(),
      // Add deployment environment to distinguish preview from production
      deploymentEnvironment: getDeploymentEnvironment(hostname),
      ...(context || {}),
    };

    switch (level) {
      case "debug":
        logger.debug(message, logData);
        break;
      case "info":
        logger.info(message, logData);
        break;
      case "warn":
        logger.warn(message, logData);
        break;
      case "error":
        logger.error(message, logData);
        break;
    }
  }

  debug(message: string, context?: LogContext): void {
    this.log("debug", message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log("info", message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log("warn", message, context);
  }

  error(message: string, context?: LogContext): void {
    this.log("error", message, context);
  }

  /**
   * Log authentication events with automatic sanitization
   */
  auth(level: LogLevel, message: string, context: AuthLogContext): void {
    // Sanitize context to ensure no sensitive data is logged
    const sanitizedContext = this.sanitizeContext({ ...context }) as LogContext;

    this.log(level, message, sanitizedContext);
  }

  /**
   * Recursively sanitize context to remove sensitive data.
   *
   * Note: Uses case-insensitive substring matching for field names.
   * This is intentionally aggressive to prevent accidental sensitive data leakage.
   * Fields containing any of the SENSITIVE_KEYS substrings will be filtered.
   * For example, 'userPasswordHint' would be filtered due to containing 'password'.
   * This tradeoff favors security over potential false positives.
   */
  private sanitizeContext(obj: unknown): unknown {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (typeof obj !== "object") {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitizeContext(item));
    }

    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      // Never log sensitive fields
      if (
        SENSITIVE_KEYS.some((k) => key.toLowerCase().includes(k.toLowerCase()))
      ) {
        // Skip sensitive fields entirely
        continue;
      }

      // Recursively sanitize nested objects
      sanitized[key] =
        value && typeof value === "object"
          ? this.sanitizeContext(value)
          : value;
    }

    return sanitized;
  }
}
