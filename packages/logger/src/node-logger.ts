/**
 * Node logger binding for plain Node processes (workers, CLIs, MCP servers)
 *
 * The `@logtail/next` package index loads `next/navigation`, so this binding
 * imports only its logger and config modules, which have no `next` runtime
 * dependency. `tests/consumer-smoke` proves this in an install without `next`.
 */

import { config as logtailConfig } from "@logtail/next/dist/config.js";
import { Logger as BetterStackLogger } from "@logtail/next/dist/logger.js";
import {
  applySinkSettings,
  BaseLogger,
  type LogSink,
  resolveServerSinkSettings,
} from "./logger-core";

/**
 * Better Stack sink returned by the Node binding.
 */
export interface NodeLogSink extends LogSink {
  /** Send any batched log events now. */
  flush(): Promise<void>;
}

let serverLogger: NodeLogSink | null = null;

/**
 * Get or create the Better Stack server logger.
 * Returns null when no BETTER_STACK_SOURCE_TOKEN is configured.
 */
export function getServerLogger(): NodeLogSink | null {
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
 * Server logger for plain Node processes.
 * Falls back to console output when Better Stack is not configured.
 */
export class Logger extends BaseLogger {
  protected getSink(): NodeLogSink | null {
    return getServerLogger();
  }

  /**
   * Send batched Better Stack events. Await this before a short-lived
   * process exits so queued logs are not dropped.
   */
  flush(): Promise<void> {
    return serverLogger ? serverLogger.flush() : Promise.resolve();
  }
}

/**
 * Default Node logger instance
 */
export const logger = new Logger();
