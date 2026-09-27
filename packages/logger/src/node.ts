/**
 * @caffeinebounce/logger/node
 *
 * Next-free entrypoint for plain Node processes such as workers, CLIs, and
 * MCP servers. It does not load `next` or React, so it works in installs
 * that have neither.
 *
 * @example
 * ```typescript
 * import { logger, sanitizeErrorMessageForClient } from "@caffeinebounce/logger/node";
 *
 * logger.info("Job finished", { event: "job.finished", jobId: "123" });
 *
 * // Before a short-lived process exits:
 * await logger.flush();
 * ```
 */

import { createAdminLogger } from "./admin-logger-core";
import { createAuthLogger } from "./auth-logger-core";
import { logger } from "./node-logger";

export {
  clearEnvironmentCache,
  type DeploymentEnvironment,
  detectDeploymentEnvironment,
  getDeploymentEnvironment,
} from "./environment";
export type {
  ApiErrorContext,
  ApiErrorResponse,
  RequestWithHeaders,
} from "./error-logger";
export {
  createApiErrorResponse,
  extractErrorMessage,
  extractErrorStack,
  extractErrorType,
  extractSupabaseErrorContext,
  extractValidationErrorContext,
  getOrGenerateCorrelationId,
} from "./error-logger";
export { sanitizeErrorMessageForClient } from "./error-sanitizer";
export type { LogSink } from "./logger-core";
export {
  getServerLogger,
  Logger,
  logger,
  type NodeLogSink,
} from "./node-logger";
export type {
  AuthLogContext,
  LogContext,
  LogLevel,
} from "./types";

/**
 * Auth event logging helpers bound to the Node logger
 */
export const authLogger = createAuthLogger(logger);

/**
 * Admin event logging helpers bound to the Node logger
 */
export const adminLogger = createAdminLogger(logger);
