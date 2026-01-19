import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearStalePKCEState,
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

describe("clearStalePKCEState", () => {
  let mockLocalStorage: { [key: string]: string };
  let originalWindow: typeof globalThis.window;

  beforeEach(() => {
    mockLocalStorage = {};
    originalWindow = globalThis.window;

    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn((key: string) => mockLocalStorage[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        mockLocalStorage[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete mockLocalStorage[key];
      }),
      clear: vi.fn(() => {
        mockLocalStorage = {};
      }),
      key: vi.fn(
        (index: number) => Object.keys(mockLocalStorage)[index] || null,
      ),
      get length() {
        return Object.keys(mockLocalStorage).length;
      },
    };

    // @ts-expect-error - mocking window for tests
    globalThis.window = { localStorage: localStorageMock };
    // @ts-expect-error - mocking localStorage for tests
    globalThis.localStorage = localStorageMock;
  });

  afterEach(() => {
    globalThis.window = originalWindow;
    vi.restoreAllMocks();
  });

  it("removes keys containing '-code-verifier'", () => {
    mockLocalStorage = {
      "sb-abc-auth-token-code-verifier": "verifier123",
      "sb-xyz-auth-token-code-verifier": "verifier456",
      "other-key": "value",
      "user-preferences": "dark-mode",
    };

    clearStalePKCEState();

    expect(localStorage.removeItem).toHaveBeenCalledWith(
      "sb-abc-auth-token-code-verifier",
    );
    expect(localStorage.removeItem).toHaveBeenCalledWith(
      "sb-xyz-auth-token-code-verifier",
    );
    expect(localStorage.removeItem).toHaveBeenCalledTimes(2);
  });

  it("does nothing when no PKCE keys exist", () => {
    mockLocalStorage = {
      "other-key": "value",
      "user-preferences": "dark-mode",
    };

    clearStalePKCEState();

    expect(localStorage.removeItem).not.toHaveBeenCalled();
  });

  it("handles empty localStorage gracefully", () => {
    mockLocalStorage = {};

    expect(() => clearStalePKCEState()).not.toThrow();
    expect(localStorage.removeItem).not.toHaveBeenCalled();
  });

  it("handles storage access errors gracefully", () => {
    // Create a mock that throws on length access but has all required methods
    const errorMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      key: vi.fn(),
      get length(): number {
        throw new Error("Storage access denied");
      },
    };

    // @ts-expect-error - mocking localStorage for tests
    globalThis.localStorage = errorMock;
    // @ts-expect-error - mocking window.localStorage for tests
    globalThis.window = { localStorage: errorMock };

    expect(() => clearStalePKCEState()).not.toThrow();
  });
});
