import { describe, expect, it, vi } from "vitest";
import { authLogger } from "./auth-logger";
import { logger } from "./logger";

vi.mock("./logger", () => ({
  logger: {
    auth: vi.fn(),
  },
}));

describe("authLogger", () => {
  it("logs sign-in attempts with account domain instead of raw email", () => {
    authLogger.signInAttempt("User@Example.com", "google");

    expect(logger.auth).toHaveBeenCalledWith(
      "info",
      "User attempting to sign in",
      {
        event: "auth.signin.attempt",
        accountDomain: "example.com",
        provider: "google",
      },
    );
  });

  it("logs sign-in success with account domain instead of raw email", () => {
    authLogger.signInSuccess("user-123", "User@Example.com", true);

    expect(logger.auth).toHaveBeenCalledWith(
      "info",
      "User signed in successfully",
      {
        event: "auth.signin.success",
        userId: "user-123",
        accountDomain: "example.com",
        mfaUsed: true,
      },
    );
  });

  it("omits account domain when the email input has no domain", () => {
    authLogger.signInAttempt("not-an-email");

    expect(logger.auth).toHaveBeenCalledWith(
      "info",
      "User attempting to sign in",
      {
        event: "auth.signin.attempt",
        provider: "email",
      },
    );
  });
});
