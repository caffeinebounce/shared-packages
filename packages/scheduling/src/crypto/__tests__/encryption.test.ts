import { describe, expect, it } from "vitest";
import { decrypt, encrypt } from "../encryption";

const SECRET = "test-secret-please-ignore-0123456789";

describe("encrypt / decrypt", () => {
  it("round-trips plaintext", () => {
    const token = "ya29.a0AfH6SMByExampleRefreshToken==";
    expect(decrypt(encrypt(token, SECRET), SECRET)).toBe(token);
  });

  it("round-trips unicode", () => {
    const value = "café ☕ — naïve façade";
    expect(decrypt(encrypt(value, SECRET), SECRET)).toBe(value);
  });

  it("produces a distinct ciphertext each call (random IV)", () => {
    const a = encrypt("same", SECRET);
    const b = encrypt("same", SECRET);
    expect(a).not.toBe(b);
    expect(decrypt(a, SECRET)).toBe("same");
    expect(decrypt(b, SECRET)).toBe("same");
  });

  it("returns null for the wrong secret (auth-tag mismatch)", () => {
    expect(
      decrypt(encrypt("secret-data", SECRET), "a-different-secret"),
    ).toBeNull();
  });

  it("returns null for tampered ciphertext", () => {
    const enc = encrypt("secret-data", SECRET);
    const tampered = `${enc.slice(0, -4)}AAAA`;
    expect(decrypt(tampered, SECRET)).toBeNull();
  });

  it("returns null for malformed/too-short input", () => {
    expect(decrypt("Zm9v", SECRET)).toBeNull(); // "foo" base64, shorter than IV+tag
    expect(decrypt("", SECRET)).toBeNull();
  });
});
