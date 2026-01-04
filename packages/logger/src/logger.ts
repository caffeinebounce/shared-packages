/**
 * Core logger utility for Better Stack integration
 * Provides structured logging for both server and client-side code
 */

import {
  Logger as BetterStackLogger,
  config as logtailConfig,
} from "@logtail/next";
import { getDeploymentEnvironment } from "./environment";
import type { AuthLogContext, LogContext, LogLevel } from "./types";
import { SENSITIVE_KEYS } from "./types";

// Server-side logger instance
let serverLogger: BetterStackLogger | null = null;

// Client-side logger instance
let clientLogger: BetterStackLogger | null = null;

/**
 * Ensure the logtail config has the token and ingesting URL set
 * The @logtail/next library reads from process.env at module load,
 * but we need to ensure it's set before creating loggers
 */
function ensureConfig(token: string, ingestingUrl: string): void {
  // Cast to any to set properties on the config object
  // biome-ignore lint/suspicious/noExplicitAny: Required to set private config properties
  const cfg = logtailConfig as any;
  cfg.token = token;
  cfg.ingestingUrl = ingestingUrl;
}

/**
 * Get or create server-side logger
 * Only available in Node.js runtime (server components, API routes)
 */
export function getServerLogger(): BetterStackLogger | null {
  if (typeof window !== "undefined") {
    console.warn(
      "Server logger called from client-side. Use getClientLogger() instead.",
    );
    return null;
  }

  if (!serverLogger) {
    const token =
      process.env.BETTER_STACK_SOURCE_TOKEN || process.env.LOGTAIL_SOURCE_TOKEN;
    const ingestingUrl =
      process.env.BETTER_STACK_INGESTING_URL ||
      process.env.LOGTAIL_URL ||
      "https://in.logs.betterstack.com";

    if (!token) {
      console.warn(
        "[Logger] No server token found. Set BETTER_STACK_SOURCE_TOKEN in .env.local",
      );
      return null;
    }

    // Ensure config is set before creating logger
    ensureConfig(token, ingestingUrl);
    serverLogger = new BetterStackLogger();
  }

  return serverLogger;
}

/**
 * Get or create client-side logger
 * Only available in browser runtime (client components)
 */
export function getClientLogger(): BetterStackLogger | null {
  if (typeof window === "undefined") {
    console.warn(
      "Client logger called from server-side. Use getServerLogger() instead.",
    );
    return null;
  }

  if (!clientLogger) {
    // Check if token is configured
    const token =
      process.env.NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN ||
      process.env.NEXT_PUBLIC_LOGTAIL_SOURCE_TOKEN;
    const ingestingUrl =
      process.env.NEXT_PUBLIC_BETTER_STACK_INGESTING_URL ||
      process.env.NEXT_PUBLIC_LOGTAIL_URL ||
      "https://in.logs.betterstack.com";

    if (!token) {
      console.warn(
        "[Logger] No client token found. Set NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN in .env.local",
      );
      return null;
    }

    // Ensure config is set before creating logger
    ensureConfig(token, ingestingUrl);
    clientLogger = new BetterStackLogger();
  }

  return clientLogger;
}

/**
 * Universal logger that works on both server and client
 * Automatically selects the correct logger based on runtime
 */
export class Logger {
  private getLogger(): BetterStackLogger | null {
    return typeof window === "undefined"
      ? getServerLogger()
      : getClientLogger();
  }

  private log(level: LogLevel, message: string, context?: LogContext): void {
    const logger = this.getLogger();

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

/**
 * Default logger instance
 */
export const logger = new Logger();
