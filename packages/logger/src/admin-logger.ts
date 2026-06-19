/**
 * Admin action logging helpers
 *
 * Convenience functions for logging admin events with consistent structure.
 */

import { extractAccountDomain } from "./email-domain";
import { logger } from "./logger";

function targetAccountDomainContext(targetEmail: string): {
  targetAccountDomain?: string;
} {
  const targetAccountDomain = extractAccountDomain(targetEmail);

  return targetAccountDomain ? { targetAccountDomain } : {};
}

/**
 * Admin event logging helpers
 */
export const adminLogger = {
  // User management actions
  userView: (
    adminId: string,
    targetUserId: string,
    context?: Record<string, unknown>,
  ) => {
    logger.info("Admin viewed user details", {
      event: "admin.user.view",
      adminId,
      targetUserId,
      ...context,
    });
  },

  userPasswordReset: (
    adminId: string,
    targetUserId: string,
    targetEmail: string,
  ) => {
    logger.info("Admin triggered password reset", {
      event: "admin.user.passwordReset",
      adminId,
      targetUserId,
      ...targetAccountDomainContext(targetEmail),
    });
  },

  userMfaReset: (
    adminId: string,
    targetUserId: string,
    targetEmail: string,
  ) => {
    logger.info("Admin reset user MFA", {
      event: "admin.user.mfaReset",
      adminId,
      targetUserId,
      ...targetAccountDomainContext(targetEmail),
    });
  },

  userRestore: (
    adminId: string,
    targetUserId: string,
    context?: {
      reason?: string;
      previousDeletedAt?: string;
    },
  ) => {
    logger.info("Admin restored deleted account", {
      event: "admin.user.restore",
      adminId,
      targetUserId,
      ...context,
    });
  },

  // Cohort management actions
  cohortCreate: (adminId: string, cohortId: string, cohortName: string) => {
    logger.info("Admin created cohort", {
      event: "admin.cohort.create",
      adminId,
      cohortId,
      cohortName,
    });
  },

  cohortUpdate: (
    adminId: string,
    cohortId: string,
    changes: Record<string, unknown>,
  ) => {
    logger.info("Admin updated cohort", {
      event: "admin.cohort.update",
      adminId,
      cohortId,
      changes,
    });
  },

  cohortArchive: (adminId: string, cohortId: string, cohortName: string) => {
    logger.info("Admin archived cohort", {
      event: "admin.cohort.archive",
      adminId,
      cohortId,
      cohortName,
    });
  },

  // Application management actions
  applicationReview: (
    adminId: string,
    applicationId: string,
    status: string,
  ) => {
    logger.info("Admin reviewed application", {
      event: "admin.application.review",
      adminId,
      applicationId,
      status,
    });
  },

  applicationStatusChange: (
    adminId: string,
    applicationId: string,
    fromStatus: string,
    toStatus: string,
  ) => {
    logger.info("Admin changed application status", {
      event: "admin.application.statusChange",
      adminId,
      applicationId,
      fromStatus,
      toStatus,
    });
  },

  // Impersonation actions (super admin only)
  // TODO: Implement user impersonation feature
  impersonateStart: (
    adminId: string,
    targetUserId: string,
    targetEmail: string,
  ) => {
    logger.warn("Super admin started user impersonation", {
      event: "admin.impersonate.start",
      adminId,
      targetUserId,
      ...targetAccountDomainContext(targetEmail),
    });
  },

  impersonateEnd: (adminId: string, targetUserId: string, duration: number) => {
    logger.info("Super admin ended user impersonation", {
      event: "admin.impersonate.end",
      adminId,
      targetUserId,
      durationSeconds: duration,
    });
  },

  // General admin actions
  adminRoleChange: (
    adminId: string,
    targetUserId: string,
    fromRole: string | null,
    toRole: string | null,
  ) => {
    logger.info("Admin role changed", {
      event: "admin.role.change",
      adminId,
      targetUserId,
      fromRole,
      toRole,
    });
  },

  accessDenied: (userId: string, attemptedAction: string, reason: string) => {
    logger.warn("Admin access denied", {
      event: "admin.access.denied",
      userId,
      attemptedAction,
      reason,
    });
  },
};
