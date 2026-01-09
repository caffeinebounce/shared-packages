import { describe, expect, it } from "vitest";
import {
  generateRecoveryCodes,
  getDisplayName,
  parseUserMetadata,
} from "../auth";

describe("parseUserMetadata", () => {
  it("parses Google OAuth metadata", () => {
    const metadata = {
      name: "John Doe",
      picture: "https://example.com/avatar.jpg",
      given_name: "John",
      family_name: "Doe",
      email: "john@example.com",
    };
    const result = parseUserMetadata(metadata);
    expect(result.fullName).toBe("John Doe");
    expect(result.firstName).toBe("John");
    expect(result.lastName).toBe("Doe");
    expect(result.avatarUrl).toBe("https://example.com/avatar.jpg");
    expect(result.email).toBe("john@example.com");
  });

  it("parses Azure AD metadata", () => {
    const metadata = {
      full_name: "Jane Smith",
      avatar_url: "https://example.com/jane.jpg",
    };
    const result = parseUserMetadata(metadata);
    expect(result.fullName).toBe("Jane Smith");
    expect(result.firstName).toBe("Jane");
    expect(result.lastName).toBe("Smith");
    expect(result.avatarUrl).toBe("https://example.com/jane.jpg");
  });

  it("handles email/password signup metadata", () => {
    const metadata = {
      first_name: "Bob",
      last_name: "Wilson",
    };
    const result = parseUserMetadata(metadata);
    expect(result.firstName).toBe("Bob");
    expect(result.lastName).toBe("Wilson");
    expect(result.fullName).toBe("");
  });

  it("splits full name when no explicit first/last name", () => {
    const metadata = {
      name: "Alice Marie Johnson",
    };
    const result = parseUserMetadata(metadata);
    expect(result.firstName).toBe("Alice");
    expect(result.lastName).toBe("Marie Johnson");
  });

  it("handles null metadata", () => {
    const result = parseUserMetadata(null);
    expect(result.fullName).toBe("");
    expect(result.firstName).toBe("");
    expect(result.lastName).toBe("");
    expect(result.avatarUrl).toBe("");
    expect(result.email).toBeUndefined();
  });

  it("handles undefined metadata", () => {
    const result = parseUserMetadata(undefined);
    expect(result.fullName).toBe("");
    expect(result.firstName).toBe("");
  });

  it("handles empty object", () => {
    const result = parseUserMetadata({});
    expect(result.fullName).toBe("");
    expect(result.firstName).toBe("");
  });
});

describe("getDisplayName", () => {
  it("returns full name when available", () => {
    expect(getDisplayName({ name: "John Doe" })).toBe("John Doe");
  });

  it("returns first name when no full name", () => {
    expect(getDisplayName({ first_name: "Jane" })).toBe("Jane");
  });

  it("falls back to email prefix", () => {
    expect(getDisplayName({}, "jane.doe@example.com")).toBe("jane.doe");
  });

  it("returns 'User' as final fallback", () => {
    expect(getDisplayName({})).toBe("User");
    expect(getDisplayName(null)).toBe("User");
  });
});

describe("generateRecoveryCodes", () => {
  it("generates the specified number of codes", () => {
    const codes = generateRecoveryCodes(10);
    expect(codes).toHaveLength(10);

    const codes5 = generateRecoveryCodes(5);
    expect(codes5).toHaveLength(5);
  });

  it("generates codes in XXXX-XXXX format", () => {
    const codes = generateRecoveryCodes(5);
    for (const code of codes) {
      expect(code).toMatch(/^[A-Z0-9]{4}-[A-Z0-9]{4}$/);
    }
  });

  it("generates unique codes", () => {
    const codes = generateRecoveryCodes(100);
    const uniqueCodes = new Set(codes);
    // With cryptographic randomness, all 100 should be unique
    expect(uniqueCodes.size).toBe(100);
  });

  it("defaults to 10 codes when no count specified", () => {
    const codes = generateRecoveryCodes();
    expect(codes).toHaveLength(10);
  });
});
