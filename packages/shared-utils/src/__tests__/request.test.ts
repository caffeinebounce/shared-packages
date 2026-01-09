import { describe, expect, it } from "vitest";
import {
  generateSecureToken,
  getClientIP,
  getGeolocationFromIP,
  hashString,
} from "../request";

describe("getClientIP", () => {
  it("extracts IP from x-forwarded-for header", () => {
    const headers = new Headers({
      "x-forwarded-for": "203.0.113.42, 198.51.100.178",
    });
    expect(getClientIP(headers)).toBe("203.0.113.42");
  });

  it("extracts IP from x-real-ip header", () => {
    const headers = new Headers({
      "x-real-ip": "203.0.113.42",
    });
    expect(getClientIP(headers)).toBe("203.0.113.42");
  });

  it("extracts IP from cf-connecting-ip header (Cloudflare)", () => {
    const headers = new Headers({
      "cf-connecting-ip": "203.0.113.42",
    });
    expect(getClientIP(headers)).toBe("203.0.113.42");
  });

  it("prefers x-forwarded-for over other headers", () => {
    const headers = new Headers({
      "x-forwarded-for": "1.1.1.1",
      "x-real-ip": "2.2.2.2",
      "cf-connecting-ip": "3.3.3.3",
    });
    expect(getClientIP(headers)).toBe("1.1.1.1");
  });

  it("returns null when no IP headers present", () => {
    const headers = new Headers({
      "content-type": "application/json",
    });
    expect(getClientIP(headers)).toBe(null);
  });

  it("trims whitespace from x-forwarded-for", () => {
    const headers = new Headers({
      "x-forwarded-for": "  203.0.113.42  , 198.51.100.178",
    });
    expect(getClientIP(headers)).toBe("203.0.113.42");
  });
});

describe("getGeolocationFromIP", () => {
  it("returns null (placeholder implementation)", async () => {
    const result = await getGeolocationFromIP("203.0.113.42");
    expect(result).toBe(null);
  });
});

describe("hashString", () => {
  it("produces consistent hash for same input", async () => {
    const hash1 = await hashString("test-string");
    const hash2 = await hashString("test-string");
    expect(hash1).toBe(hash2);
  });

  it("produces different hashes for different inputs", async () => {
    const hash1 = await hashString("string-a");
    const hash2 = await hashString("string-b");
    expect(hash1).not.toBe(hash2);
  });

  it("produces 64-character hex string (SHA-256)", async () => {
    const hash = await hashString("test");
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[a-f0-9]+$/);
  });

  it("handles empty string", async () => {
    const hash = await hashString("");
    expect(hash).toHaveLength(64);
  });
});

describe("generateSecureToken", () => {
  it("generates token of correct length", () => {
    const token = generateSecureToken(32);
    // 32 bytes = 64 hex characters
    expect(token).toHaveLength(64);
  });

  it("generates unique tokens", () => {
    const tokens = new Set<string>();
    for (let i = 0; i < 100; i++) {
      tokens.add(generateSecureToken(16));
    }
    expect(tokens.size).toBe(100);
  });

  it("produces lowercase hex string", () => {
    const token = generateSecureToken(16);
    expect(token).toMatch(/^[a-f0-9]+$/);
  });

  it("defaults to 32 bytes (64 characters)", () => {
    const token = generateSecureToken();
    expect(token).toHaveLength(64);
  });

  it("handles custom length", () => {
    const token8 = generateSecureToken(8);
    expect(token8).toHaveLength(16);

    const token64 = generateSecureToken(64);
    expect(token64).toHaveLength(128);
  });
});
