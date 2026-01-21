import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock the auth-logger module
vi.mock("./auth-logger", () => ({
  authLogger: {
    signInAttempt: vi.fn(),
    signInSuccess: vi.fn(),
    signInFailure: vi.fn(),
    mfaRequired: vi.fn(),
    mfaSuccess: vi.fn(),
    mfaFailure: vi.fn(),
    signUpAttempt: vi.fn(),
    signUpSuccess: vi.fn(),
    signUpFailure: vi.fn(),
    emailVerificationSent: vi.fn(),
    passwordResetRequested: vi.fn(),
    passwordResetCompleted: vi.fn(),
    passwordResetFailed: vi.fn(),
    signOut: vi.fn(),
    sessionRefresh: vi.fn(),
  },
}));

describe("authLoggerClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the module state by clearing the cache
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("lazy loading", () => {
    it("loads the module on first call", async () => {
      const { authLoggerClient } = await import("./auth-logger-client");
      const { authLogger } = await import("./auth-logger");

      authLoggerClient.signInAttempt("test@example.com");

      // Wait for async loading
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(authLogger.signInAttempt).toHaveBeenCalledWith("test@example.com");
    });

    it("reuses loaded module for subsequent calls", async () => {
      const { authLoggerClient } = await import("./auth-logger-client");
      const { authLogger } = await import("./auth-logger");

      authLoggerClient.signInAttempt("user1@example.com");
      await new Promise((resolve) => setTimeout(resolve, 10));

      authLoggerClient.signInAttempt("user2@example.com");
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(authLogger.signInAttempt).toHaveBeenCalledTimes(2);
      expect(authLogger.signInAttempt).toHaveBeenNthCalledWith(
        1,
        "user1@example.com",
      );
      expect(authLogger.signInAttempt).toHaveBeenNthCalledWith(
        2,
        "user2@example.com",
      );
    });
  });

  describe("method proxying", () => {
    it("proxies signInAttempt correctly", async () => {
      const { authLoggerClient } = await import("./auth-logger-client");
      const { authLogger } = await import("./auth-logger");

      authLoggerClient.signInAttempt("test@example.com", "google");
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(authLogger.signInAttempt).toHaveBeenCalledWith(
        "test@example.com",
        "google",
      );
    });

    it("proxies signInSuccess correctly", async () => {
      const { authLoggerClient } = await import("./auth-logger-client");
      const { authLogger } = await import("./auth-logger");

      authLoggerClient.signInSuccess("user-123", "test@example.com", true);
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(authLogger.signInSuccess).toHaveBeenCalledWith(
        "user-123",
        "test@example.com",
        true,
      );
    });

    it("proxies signInFailure correctly", async () => {
      const { authLoggerClient } = await import("./auth-logger-client");
      const { authLogger } = await import("./auth-logger");

      authLoggerClient.signInFailure("test@example.com", "Invalid password");
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(authLogger.signInFailure).toHaveBeenCalledWith(
        "test@example.com",
        "Invalid password",
      );
    });

    it("proxies mfaRequired correctly", async () => {
      const { authLoggerClient } = await import("./auth-logger-client");
      const { authLogger } = await import("./auth-logger");

      authLoggerClient.mfaRequired("user-123", "test@example.com");
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(authLogger.mfaRequired).toHaveBeenCalledWith(
        "user-123",
        "test@example.com",
      );
    });

    it("proxies mfaSuccess correctly", async () => {
      const { authLoggerClient } = await import("./auth-logger-client");
      const { authLogger } = await import("./auth-logger");

      authLoggerClient.mfaSuccess("user-123", "test@example.com");
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(authLogger.mfaSuccess).toHaveBeenCalledWith(
        "user-123",
        "test@example.com",
      );
    });

    it("proxies mfaFailure correctly", async () => {
      const { authLoggerClient } = await import("./auth-logger-client");
      const { authLogger } = await import("./auth-logger");

      authLoggerClient.mfaFailure(
        "user-123",
        "test@example.com",
        "Invalid code",
      );
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(authLogger.mfaFailure).toHaveBeenCalledWith(
        "user-123",
        "test@example.com",
        "Invalid code",
      );
    });

    it("proxies signUpAttempt correctly", async () => {
      const { authLoggerClient } = await import("./auth-logger-client");
      const { authLogger } = await import("./auth-logger");

      authLoggerClient.signUpAttempt("new@example.com");
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(authLogger.signUpAttempt).toHaveBeenCalledWith("new@example.com");
    });

    it("proxies signUpSuccess correctly", async () => {
      const { authLoggerClient } = await import("./auth-logger-client");
      const { authLogger } = await import("./auth-logger");

      authLoggerClient.signUpSuccess("user-456", "new@example.com");
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(authLogger.signUpSuccess).toHaveBeenCalledWith(
        "user-456",
        "new@example.com",
      );
    });

    it("proxies signUpFailure correctly", async () => {
      const { authLoggerClient } = await import("./auth-logger-client");
      const { authLogger } = await import("./auth-logger");

      authLoggerClient.signUpFailure("new@example.com", "Email taken");
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(authLogger.signUpFailure).toHaveBeenCalledWith(
        "new@example.com",
        "Email taken",
      );
    });

    it("proxies emailVerificationSent correctly", async () => {
      const { authLoggerClient } = await import("./auth-logger-client");
      const { authLogger } = await import("./auth-logger");

      authLoggerClient.emailVerificationSent("new@example.com");
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(authLogger.emailVerificationSent).toHaveBeenCalledWith(
        "new@example.com",
      );
    });

    it("proxies passwordResetRequested correctly", async () => {
      const { authLoggerClient } = await import("./auth-logger-client");
      const { authLogger } = await import("./auth-logger");

      authLoggerClient.passwordResetRequested("test@example.com");
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(authLogger.passwordResetRequested).toHaveBeenCalledWith(
        "test@example.com",
      );
    });

    it("proxies passwordResetCompleted correctly", async () => {
      const { authLoggerClient } = await import("./auth-logger-client");
      const { authLogger } = await import("./auth-logger");

      authLoggerClient.passwordResetCompleted("user-123", "test@example.com");
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(authLogger.passwordResetCompleted).toHaveBeenCalledWith(
        "user-123",
        "test@example.com",
      );
    });

    it("proxies passwordResetFailed correctly", async () => {
      const { authLoggerClient } = await import("./auth-logger-client");
      const { authLogger } = await import("./auth-logger");

      authLoggerClient.passwordResetFailed("test@example.com", "Token expired");
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(authLogger.passwordResetFailed).toHaveBeenCalledWith(
        "test@example.com",
        "Token expired",
      );
    });

    it("proxies signOut correctly", async () => {
      const { authLoggerClient } = await import("./auth-logger-client");
      const { authLogger } = await import("./auth-logger");

      authLoggerClient.signOut("user-123", "test@example.com");
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(authLogger.signOut).toHaveBeenCalledWith(
        "user-123",
        "test@example.com",
      );
    });

    it("proxies sessionRefresh correctly", async () => {
      const { authLoggerClient } = await import("./auth-logger-client");
      const { authLogger } = await import("./auth-logger");

      authLoggerClient.sessionRefresh("user-123");
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(authLogger.sessionRefresh).toHaveBeenCalledWith("user-123");
    });
  });

  describe("rapid calls", () => {
    it("handles multiple rapid calls without race conditions", async () => {
      const { authLoggerClient } = await import("./auth-logger-client");
      const { authLogger } = await import("./auth-logger");

      // Fire multiple calls rapidly
      authLoggerClient.signInAttempt("user1@example.com");
      authLoggerClient.signInAttempt("user2@example.com");
      authLoggerClient.signInAttempt("user3@example.com");

      // Wait for all to complete
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(authLogger.signInAttempt).toHaveBeenCalledTimes(3);
    });

    it("handles mixed method calls correctly", async () => {
      const { authLoggerClient } = await import("./auth-logger-client");
      const { authLogger } = await import("./auth-logger");

      authLoggerClient.signInAttempt("test@example.com");
      authLoggerClient.signInSuccess("user-123", "test@example.com");
      authLoggerClient.signOut("user-123", "test@example.com");

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(authLogger.signInAttempt).toHaveBeenCalledTimes(1);
      expect(authLogger.signInSuccess).toHaveBeenCalledTimes(1);
      expect(authLogger.signOut).toHaveBeenCalledTimes(1);
    });
  });
});

describe("authLoggerClient error handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("handles module import failure gracefully", async () => {
    // Mock a failing import
    vi.doMock("./auth-logger", () => {
      throw new Error("Module not found");
    });

    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    // Re-import to get the fresh module with failing import
    const { authLoggerClient } = await import("./auth-logger-client");

    // Should not throw when calling methods
    expect(() => {
      authLoggerClient.signInAttempt("test@example.com");
    }).not.toThrow();

    // Wait for async operations
    await new Promise((resolve) => setTimeout(resolve, 50));

    consoleSpy.mockRestore();
  });
});
