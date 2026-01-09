import { describe, expect, it } from "vitest";
import { getEmailDomain } from "../email";

describe("getEmailDomain", () => {
  it("extracts domain from valid email", () => {
    expect(getEmailDomain("user@example.com")).toBe("example.com");
  });

  it("returns lowercase domain", () => {
    expect(getEmailDomain("User@EXAMPLE.COM")).toBe("example.com");
    expect(getEmailDomain("John.Doe@Company.ORG")).toBe("company.org");
  });

  it("handles subdomains", () => {
    expect(getEmailDomain("user@mail.example.com")).toBe("mail.example.com");
  });

  it("returns null for invalid email without @", () => {
    expect(getEmailDomain("invalid-email")).toBe(null);
  });

  it("returns null for email ending with @", () => {
    expect(getEmailDomain("user@")).toBe(null);
  });

  it("handles empty string", () => {
    expect(getEmailDomain("")).toBe(null);
  });
});
