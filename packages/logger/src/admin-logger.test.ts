import { describe, expect, it, vi } from "vitest";
import { adminLogger } from "./admin-logger";
import { logger } from "./logger";

// Mock the logger
vi.mock("./logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

describe("adminLogger", () => {
  describe("user management actions", () => {
    it("logs user view action", () => {
      adminLogger.userView("admin-123", "user-456", { page: "profile" });

      expect(logger.info).toHaveBeenCalledWith("Admin viewed user details", {
        event: "admin.user.view",
        adminId: "admin-123",
        targetUserId: "user-456",
        page: "profile",
      });
    });

    it("logs password reset action", () => {
      adminLogger.userPasswordReset(
        "admin-123",
        "user-456",
        "user@example.com",
      );

      expect(logger.info).toHaveBeenCalledWith(
        "Admin triggered password reset",
        {
          event: "admin.user.passwordReset",
          adminId: "admin-123",
          targetUserId: "user-456",
          targetAccountDomain: "example.com",
        },
      );
    });

    it("logs MFA reset action", () => {
      adminLogger.userMfaReset("admin-123", "user-456", "user@example.com");

      expect(logger.info).toHaveBeenCalledWith("Admin reset user MFA", {
        event: "admin.user.mfaReset",
        adminId: "admin-123",
        targetUserId: "user-456",
        targetAccountDomain: "example.com",
      });
    });

    it("logs user restore action", () => {
      adminLogger.userRestore("admin-123", "user-456", {
        reason: "User requested restoration",
        previousDeletedAt: "2025-01-01T00:00:00Z",
      });

      expect(logger.info).toHaveBeenCalledWith(
        "Admin restored deleted account",
        {
          event: "admin.user.restore",
          adminId: "admin-123",
          targetUserId: "user-456",
          reason: "User requested restoration",
          previousDeletedAt: "2025-01-01T00:00:00Z",
        },
      );
    });
  });

  describe("cohort management actions", () => {
    it("logs cohort creation", () => {
      adminLogger.cohortCreate("admin-123", "cohort-789", "Spring 2025");

      expect(logger.info).toHaveBeenCalledWith("Admin created cohort", {
        event: "admin.cohort.create",
        adminId: "admin-123",
        cohortId: "cohort-789",
        cohortName: "Spring 2025",
      });
    });

    it("logs cohort update", () => {
      adminLogger.cohortUpdate("admin-123", "cohort-789", { isActive: true });

      expect(logger.info).toHaveBeenCalledWith("Admin updated cohort", {
        event: "admin.cohort.update",
        adminId: "admin-123",
        cohortId: "cohort-789",
        changes: { isActive: true },
      });
    });

    it("logs cohort archive", () => {
      adminLogger.cohortArchive("admin-123", "cohort-789", "Spring 2025");

      expect(logger.info).toHaveBeenCalledWith("Admin archived cohort", {
        event: "admin.cohort.archive",
        adminId: "admin-123",
        cohortId: "cohort-789",
        cohortName: "Spring 2025",
      });
    });
  });

  describe("application management actions", () => {
    it("logs application review", () => {
      adminLogger.applicationReview("admin-123", "app-456", "approved");

      expect(logger.info).toHaveBeenCalledWith("Admin reviewed application", {
        event: "admin.application.review",
        adminId: "admin-123",
        applicationId: "app-456",
        status: "approved",
      });
    });

    it("logs application status change", () => {
      adminLogger.applicationStatusChange(
        "admin-123",
        "app-456",
        "draft",
        "submitted",
      );

      expect(logger.info).toHaveBeenCalledWith(
        "Admin changed application status",
        {
          event: "admin.application.statusChange",
          adminId: "admin-123",
          applicationId: "app-456",
          fromStatus: "draft",
          toStatus: "submitted",
        },
      );
    });
  });

  describe("impersonation actions", () => {
    it("logs impersonation start", () => {
      adminLogger.impersonateStart("admin-123", "user-456", "user@example.com");

      expect(logger.warn).toHaveBeenCalledWith(
        "Super admin started user impersonation",
        {
          event: "admin.impersonate.start",
          adminId: "admin-123",
          targetUserId: "user-456",
          targetAccountDomain: "example.com",
        },
      );
    });

    it("logs impersonation end", () => {
      adminLogger.impersonateEnd("admin-123", "user-456", 300);

      expect(logger.info).toHaveBeenCalledWith(
        "Super admin ended user impersonation",
        {
          event: "admin.impersonate.end",
          adminId: "admin-123",
          targetUserId: "user-456",
          durationSeconds: 300,
        },
      );
    });
  });

  describe("general admin actions", () => {
    it("logs admin role change", () => {
      adminLogger.adminRoleChange(
        "admin-123",
        "user-456",
        null,
        "program_admin",
      );

      expect(logger.info).toHaveBeenCalledWith("Admin role changed", {
        event: "admin.role.change",
        adminId: "admin-123",
        targetUserId: "user-456",
        fromRole: null,
        toRole: "program_admin",
      });
    });

    it("logs access denied", () => {
      adminLogger.accessDenied(
        "user-456",
        "delete_cohort",
        "Not a super admin",
      );

      expect(logger.warn).toHaveBeenCalledWith("Admin access denied", {
        event: "admin.access.denied",
        userId: "user-456",
        attemptedAction: "delete_cohort",
        reason: "Not a super admin",
      });
    });
  });
});
