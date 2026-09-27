/**
 * Core logger utility for Better Stack integration
 * Provides structured logging for both server and client-side code
 *
 * This binding uses the `@logtail/next` package index, which loads `next`.
 * Plain Node processes should import `@caffeinebounce/logger/node` instead.
 */

import {
  Logger as BetterStackLogger,
  config as logtailConfig,
} from "@logtail/next";
import {
  applySinkSettings,
  BaseLogger,
  resolveClientSinkSettings,
  resolveServerSinkSettings,
} from "./logger-core";

// Server-side logger instance
let serverLogger: BetterStackLogger | null = null;

// Client-side logger instance
let clientLogger: BetterStackLogger | null = null;

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
    const settings = resolveServerSinkSettings();
    if (!settings) {
      return null;
    }

    // Ensure config is set before creating logger
    applySinkSettings(logtailConfig, settings);
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
    const settings = resolveClientSinkSettings();
    if (!settings) {
      return null;
    }

    // Ensure config is set before creating logger
    applySinkSettings(logtailConfig, settings);
    clientLogger = new BetterStackLogger();
  }

  return clientLogger;
}

/**
 * Universal logger that works on both server and client
 * Automatically selects the correct logger based on runtime
 */
export class Logger extends BaseLogger {
  protected getSink(): BetterStackLogger | null {
    return typeof window === "undefined"
      ? getServerLogger()
      : getClientLogger();
  }
}

/**
 * Default logger instance
 */
export const logger = new Logger();
