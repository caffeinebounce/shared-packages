/**
 * @compass/logger
 *
 * Shared logging utility for Better Stack integration.
 * Provides structured logging for both server and client-side code.
 *
 * @example
 * ```typescript
 * import { logger, authLogger } from "@compass/logger";
 *
 * // Use the universal logger (auto-detects runtime)
 * logger.info("Something happened", { event: "my.event", userId: "123" });
 *
 * // Use auth-specific helpers
 * authLogger.signInSuccess("user-id", "user@example.com");
 *
 * // Use the useLogger hook in client components (recommended)
 * import { useLogger } from "@compass/logger";
 * const log = useLogger();
 * log.info("User action", { userId: 42 });
 * ```
 */

// Re-export @logtail/next hooks and types for direct use
export { Logger as BetterStackLogger, useLogger } from "@logtail/next";
export { adminLogger } from "./admin-logger";
export { authLogger } from "./auth-logger";
export {
  getClientLogger,
  getServerLogger,
  Logger,
  logger,
} from "./logger";

export type {
  AuthLogContext,
  LogContext,
  LogLevel,
} from "./types";
