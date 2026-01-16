import { describe, expect, it } from "vitest";
import {
  generateSecureToken,
  getClientIP,
  getGeolocationFromIP,
  hashString,
} from "./device-fingerprint";

describe("getClientIP", () => {
  it("extracts IP from x-forwarded-for header (single IP)", () => {
    const headers = new Headers({
      "x-forwarded-for": "192.168.1.1",
    });
    expect(getClientIP(headers)).toBe("192.168.1.1");
  });

  it("extracts first IP from x-forwarded-for header (multiple IPs)", () => {
    const headers = new Headers({
      "x-forwarded-for": "192.168.1.1, 10.0.0.1, 172.16.0.1",
    });
    expect(getClientIP(headers)).toBe("192.168.1.1");
  });

  it("trims whitespace from x-forwarded-for IP", () => {
    const headers = new Headers({
      "x-forwarded-for": "  192.168.1.1  , 10.0.0.1",
    });
    expect(getClientIP(headers)).toBe("192.168.1.1");
  });

  it("falls back to x-real-ip header", () => {
    const headers = new Headers({
      "x-real-ip": "10.0.0.5",
    });
    expect(getClientIP(headers)).toBe("10.0.0.5");
  });

  it("falls back to cf-connecting-ip header (Cloudflare)", () => {
    const headers = new Headers({
      "cf-connecting-ip": "172.16.0.10",
    });
    expect(getClientIP(headers)).toBe("172.16.0.10");
  });

  it("prefers x-forwarded-for over x-real-ip", () => {
    const headers = new Headers({
      "x-forwarded-for": "192.168.1.1",
      "x-real-ip": "10.0.0.5",
    });
    expect(getClientIP(headers)).toBe("192.168.1.1");
  });

  it("prefers x-real-ip over cf-connecting-ip", () => {
    const headers = new Headers({
      "x-real-ip": "10.0.0.5",
      "cf-connecting-ip": "172.16.0.10",
    });
    expect(getClientIP(headers)).toBe("10.0.0.5");
  });

  it("returns null when no IP headers present", () => {
    const headers = new Headers({
      "content-type": "application/json",
    });
    expect(getClientIP(headers)).toBeNull();
  });
});

describe("generateSecureToken", () => {
  it("generates a token of default length (32 bytes = 64 hex chars)", () => {
    const token = generateSecureToken();
    expect(token).toHaveLength(64);
  });

  it("generates a token of custom length", () => {
    const token = generateSecureToken(16);
    expect(token).toHaveLength(32); // 16 bytes = 32 hex chars
  });

  it("generates only hex characters", () => {
    const token = generateSecureToken();
    expect(token).toMatch(/^[0-9a-f]+$/);
  });

  it("generates unique tokens", () => {
    const token1 = generateSecureToken();
    const token2 = generateSecureToken();
    expect(token1).not.toBe(token2);
  });
});

describe("hashString", () => {
  it("hashes a string using SHA-256", async () => {
    const hash = await hashString("hello");
    // SHA-256 produces 64 hex characters
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[0-9a-f]+$/);
  });

  it("produces consistent hashes for the same input", async () => {
    const hash1 = await hashString("test");
    const hash2 = await hashString("test");
    expect(hash1).toBe(hash2);
  });

  it("produces different hashes for different inputs", async () => {
    const hash1 = await hashString("test1");
    const hash2 = await hashString("test2");
    expect(hash1).not.toBe(hash2);
  });

  it("produces known hash for known input", async () => {
    // SHA-256 of "hello" is well-known
    const hash = await hashString("hello");
    expect(hash).toBe(
      "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824", // pragma: allowlist secret
    );
  });
});

describe("getGeolocationFromIP", () => {
  it("returns null (placeholder implementation)", async () => {
    const result = await getGeolocationFromIP("192.168.1.1");
    expect(result).toBeNull();
  });
});
