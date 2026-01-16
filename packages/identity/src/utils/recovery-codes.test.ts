import { describe, expect, it } from "vitest";
import { generateRecoveryCodes } from "./recovery-codes";

describe("generateRecoveryCodes", () => {
  it("generates 10 codes by default", () => {
    const codes = generateRecoveryCodes();
    expect(codes).toHaveLength(10);
  });

  it("generates specified number of codes", () => {
    const codes = generateRecoveryCodes(5);
    expect(codes).toHaveLength(5);
  });

  it("generates codes in XXXX-XXXX format", () => {
    const codes = generateRecoveryCodes();
    codes.forEach((code) => {
      expect(code).toMatch(/^[A-Z0-9]{4}-[A-Z0-9]{4}$/);
    });
  });

  it("generates uppercase codes", () => {
    const codes = generateRecoveryCodes();
    codes.forEach((code) => {
      expect(code).toBe(code.toUpperCase());
    });
  });

  it("generates unique codes within a batch", () => {
    const codes = generateRecoveryCodes(100);
    const uniqueCodes = new Set(codes);
    expect(uniqueCodes.size).toBe(codes.length);
  });

  it("generates different codes on each call", () => {
    const codes1 = generateRecoveryCodes();
    const codes2 = generateRecoveryCodes();
    // Very unlikely to have any overlap
    const overlap = codes1.filter((c) => codes2.includes(c));
    expect(overlap.length).toBe(0);
  });

  it("generates alphanumeric codes (base36 derived)", () => {
    const codes = generateRecoveryCodes(50);
    codes.forEach((code) => {
      // Should only contain alphanumeric characters and hyphen
      expect(code).toMatch(/^[A-Z0-9-]+$/);
    });
  });
});
