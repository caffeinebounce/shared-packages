/**
 * Authentication logging helpers
 *
 * Convenience functions for logging auth events with consistent structure.
 */

import { createAuthLogger } from "./auth-logger-core";
import { logger } from "./logger";

/**
 * Auth event logging helpers
 */
export const authLogger = createAuthLogger(logger);
