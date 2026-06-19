import { describe, expect, it } from "vitest";
import { SENSITIVE_KEYS } from "./types";

// Test file for sanitization - uses fake/test values, not real credentials

/**
 * Test the sanitization logic directly
 * We test the algorithm rather than the private method by replicating it
 */
function sanitizeContext(obj: unknown): unknown {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj !== "object") {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeContext(item));
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    // Never log sensitive fields (case-insensitive substring match)
    if (
      SENSITIVE_KEYS.some((k) => key.toLowerCase().includes(k.toLowerCase()))
    ) {
      continue;
    }

    sanitized[key] =
      value && typeof value === "object" ? sanitizeContext(value) : value;
  }

  return sanitized;
}

describe("sanitizeContext", () => {
  describe("basic types", () => {
    it("returns null unchanged", () => {
      expect(sanitizeContext(null)).toBe(null);
    });

    it("returns undefined unchanged", () => {
      expect(sanitizeContext(undefined)).toBe(undefined);
    });

    it("returns primitives unchanged", () => {
      expect(sanitizeContext("hello")).toBe("hello");
      expect(sanitizeContext(123)).toBe(123);
      expect(sanitizeContext(true)).toBe(true);
    });
  });

  describe("sensitive field removal", () => {
    it("removes password and email fields", () => {
      const input = { email: "test@example.com", password: "test123" }; // pragma: allowlist secret
      const output = sanitizeContext(input);
      expect(output).toEqual({});
    });

    it("removes token field", () => {
      const input = { userId: "123", token: "abc123" };
      const output = sanitizeContext(input);
      expect(output).toEqual({ userId: "123" });
    });

    it("removes accessToken field", () => {
      const input = { userId: "123", accessToken: "xyz" };
      const output = sanitizeContext(input);
      expect(output).toEqual({ userId: "123" });
    });

    it("removes refreshToken field", () => {
      const input = { userId: "123", refreshToken: "xyz" };
      const output = sanitizeContext(input);
      expect(output).toEqual({ userId: "123" });
    });

    it("removes secret field", () => {
      // pragma: allowlist secret
      const input = { config: "ok", secret: "hidden" }; // pragma: allowlist secret
      const output = sanitizeContext(input);
      expect(output).toEqual({ config: "ok" });
    });

    it("removes apiKey field", () => {
      const input = { service: "api", apiKey: "key123" }; // pragma: allowlist secret
      const output = sanitizeContext(input);
      expect(output).toEqual({ service: "api" });
    });

    it("removes authorization field", () => {
      const input = { request: "data", authorization: "Bearer xyz" };
      const output = sanitizeContext(input);
      expect(output).toEqual({ request: "data" });
    });

    it("removes cookie field", () => {
      const input = { path: "/", cookie: "session=abc" };
      const output = sanitizeContext(input);
      expect(output).toEqual({ path: "/" });
    });

    it("removes sessionId field", () => {
      const input = { userId: "123", sessionId: "sess_abc" };
      const output = sanitizeContext(input);
      expect(output).toEqual({ userId: "123" });
    });

    it("removes email field", () => {
      const input = { userId: "123", email: "test@example.com" };
      const output = sanitizeContext(input);
      expect(output).toEqual({ userId: "123" });
    });

    it("is case-insensitive", () => {
      const input = {
        PASSWORD: "test123", // pragma: allowlist secret
        Password: "test123", // pragma: allowlist secret
        pAsSwOrD: "test123", // pragma: allowlist secret
      };
      const output = sanitizeContext(input);
      expect(output).toEqual({});
    });
  });

  describe("substring matching (intentional behavior)", () => {
    it("removes fields containing password and email substrings", () => {
      const input = { userPasswordHint: "hint", email: "test@example.com" }; // pragma: allowlist secret
      const output = sanitizeContext(input);
      expect(output).toEqual({});
    });

    it("removes fields containing token substring", () => {
      const input = { tokenExpiry: 3600, userId: "123" };
      const output = sanitizeContext(input);
      expect(output).toEqual({ userId: "123" });
    });

    it("removes fields containing secret substring", () => {
      // pragma: allowlist secret
      const input = { mySecretSanta: "Bob", name: "Alice" }; // pragma: allowlist secret
      const output = sanitizeContext(input);
      expect(output).toEqual({ name: "Alice" });
    });

    it("removes fields containing email substring", () => {
      const input = {
        accountEmail: "test@example.com",
        targetEmail: "user@example.com",
        accountDomain: "example.com",
        targetAccountDomain: "example.com",
      };
      const output = sanitizeContext(input);
      expect(output).toEqual({
        accountDomain: "example.com",
        targetAccountDomain: "example.com",
      });
    });
  });

  describe("nested objects", () => {
    it("sanitizes nested objects", () => {
      const input = {
        user: {
          email: "test@example.com",
          password: "test123", // pragma: allowlist secret
        },
        event: "login",
      };
      const output = sanitizeContext(input);
      expect(output).toEqual({
        user: {},
        event: "login",
      });
    });

    it("sanitizes deeply nested objects", () => {
      const input = {
        level1: {
          level2: {
            level3: {
              safe: "value",
              apiKey: "test-key", // pragma: allowlist secret
            },
          },
        },
      };
      const output = sanitizeContext(input);
      expect(output).toEqual({
        level1: {
          level2: {
            level3: {
              safe: "value",
            },
          },
        },
      });
    });
  });

  describe("arrays", () => {
    it("sanitizes arrays of objects", () => {
      const input = [
        { email: "a@a.com", password: "p1" }, // pragma: allowlist secret
        { email: "b@b.com", password: "p2" }, // pragma: allowlist secret
      ];
      const output = sanitizeContext(input);
      expect(output).toEqual([{}, {}]);
    });

    it("handles arrays of primitives", () => {
      const input = [1, 2, 3, "hello"];
      const output = sanitizeContext(input);
      expect(output).toEqual([1, 2, 3, "hello"]);
    });

    it("handles mixed arrays", () => {
      const input = [{ safe: "value", secret: "hidden" }, "string", 123, null]; // pragma: allowlist secret
      const output = sanitizeContext(input);
      expect(output).toEqual([{ safe: "value" }, "string", 123, null]);
    });
  });
});

describe("SENSITIVE_KEYS", () => {
  it("contains expected sensitive field patterns", () => {
    expect(SENSITIVE_KEYS).toContain("password");
    expect(SENSITIVE_KEYS).toContain("token");
    expect(SENSITIVE_KEYS).toContain("secret"); // pragma: allowlist secret
    expect(SENSITIVE_KEYS).toContain("apiKey");
    expect(SENSITIVE_KEYS).toContain("authorization");
    expect(SENSITIVE_KEYS).toContain("email");
  });
});
