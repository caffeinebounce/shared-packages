/**
 * Admin action logging helpers
 *
 * Convenience functions for logging admin events with consistent structure.
 */

import { createAdminLogger } from "./admin-logger-core";
import { logger } from "./logger";

/**
 * Admin event logging helpers
 */
export const adminLogger = createAdminLogger(logger);
