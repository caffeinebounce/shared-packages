import { describe, expect, it } from "vitest";
import {
  sanitizeAuthError,
  sanitizeSigninError,
  sanitizeSignupError,
} from "./utils";

describe("sanitizeAuthError", () => {
  describe("user already exists errors", () => {
    it("sanitizes 'user already registered' error", () => {
      expect(sanitizeAuthError("User already registered")).toBe(
        "An account with this email already exists. Please sign in instead.",
      );
    });

    it("sanitizes 'already registered' error", () => {
      expect(sanitizeAuthError("This email is already registered")).toBe(
        "An account with this email already exists. Please sign in instead.",
      );
    });

    it("sanitizes 'already exists' error", () => {
      expect(sanitizeAuthError("Account already exists")).toBe(
        "An account with this email already exists. Please sign in instead.",
      );
    });

    it("sanitizes 'email already' error", () => {
      expect(sanitizeAuthError("Email already in use")).toBe(
        "An account with this email already exists. Please sign in instead.",
      );
    });

    it("sanitizes 'duplicate' error", () => {
      expect(sanitizeAuthError("Duplicate entry for email")).toBe(
        "An account with this email already exists. Please sign in instead.",
      );
    });
  });

  describe("invalid credentials errors", () => {
    it("sanitizes 'invalid login credentials' error", () => {
      expect(sanitizeAuthError("Invalid login credentials")).toBe(
        "Invalid email or password. Please try again.",
      );
    });

    it("sanitizes 'invalid credentials' error", () => {
      expect(sanitizeAuthError("Invalid credentials provided")).toBe(
        "Invalid email or password. Please try again.",
      );
    });

    it("sanitizes 'wrong password' error", () => {
      expect(sanitizeAuthError("Wrong password")).toBe(
        "Invalid email or password. Please try again.",
      );
    });

    it("sanitizes 'incorrect password' error", () => {
      expect(sanitizeAuthError("Incorrect password")).toBe(
        "Invalid email or password. Please try again.",
      );
    });
  });

  describe("user-friendly errors (pass through)", () => {
    it("passes through 'invalid email' errors", () => {
      expect(sanitizeAuthError("Invalid email format")).toBe(
        "Invalid email format",
      );
    });

    it("passes through password-related errors", () => {
      expect(sanitizeAuthError("Password must be at least 8 characters")).toBe(
        "Password must be at least 8 characters",
      );
    });
  });

  describe("email format errors", () => {
    it("sanitizes pattern mismatch error", () => {
      expect(
        sanitizeAuthError("The string did not match the expected pattern."),
      ).toBe("Please check your email address format and try again.");
    });
  });

  describe("rate limiting errors", () => {
    it("sanitizes 'rate limit' error", () => {
      expect(sanitizeAuthError("Rate limit exceeded")).toBe(
        "Too many attempts. Please wait a moment and try again.",
      );
    });

    it("sanitizes 'too many requests' error", () => {
      expect(sanitizeAuthError("Too many requests")).toBe(
        "Too many attempts. Please wait a moment and try again.",
      );
    });

    it("sanitizes 'try again later' error", () => {
      expect(sanitizeAuthError("Please try again later")).toBe(
        "Too many attempts. Please wait a moment and try again.",
      );
    });
  });

  describe("internal/technical errors (hide details)", () => {
    it("hides hook errors", () => {
      expect(sanitizeAuthError("Hook execution failed")).toBe(
        "An error occurred. Please try again.",
      );
    });

    it("hides authorization errors", () => {
      expect(sanitizeAuthError("Authorization header missing")).toBe(
        "An error occurred. Please try again.",
      );
    });

    it("hides token errors", () => {
      expect(sanitizeAuthError("Token validation failed")).toBe(
        "An error occurred. Please try again.",
      );
    });

    it("hides internal errors", () => {
      expect(sanitizeAuthError("Internal server error")).toBe(
        "An error occurred. Please try again.",
      );
    });

    it("hides server errors", () => {
      expect(sanitizeAuthError("Server unavailable")).toBe(
        "An error occurred. Please try again.",
      );
    });

    it("hides database errors", () => {
      expect(sanitizeAuthError("Database connection failed")).toBe(
        "An error occurred. Please try again.",
      );
    });

    it("hides connection errors", () => {
      expect(sanitizeAuthError("Connection timeout")).toBe(
        "An error occurred. Please try again.",
      );
    });
  });

  describe("default fallback", () => {
    it("returns generic error for unrecognized messages", () => {
      expect(sanitizeAuthError("Some random error")).toBe(
        "An error occurred. Please try again.",
      );
    });
  });
});

describe("sanitizeSignupError", () => {
  it("uses sanitizeAuthError for known patterns", () => {
    expect(sanitizeSignupError("User already registered")).toBe(
      "An account with this email already exists. Please sign in instead.",
    );
  });

  it("returns signup-specific message for generic errors", () => {
    expect(sanitizeSignupError("Some unknown error")).toBe(
      "An error occurred during sign up. Please try again.",
    );
  });
});

describe("sanitizeSigninError", () => {
  it("uses sanitizeAuthError for known patterns", () => {
    expect(sanitizeSigninError("Invalid login credentials")).toBe(
      "Invalid email or password. Please try again.",
    );
  });

  it("returns signin-specific message for generic errors", () => {
    expect(sanitizeSigninError("Some unknown error")).toBe(
      "An error occurred during sign in. Please try again.",
    );
  });
});
