import { describe, expect, it } from "vitest";
import {
  CENTS_PER_DOLLAR,
  calculateNetAmount,
  calculatePlatformFee,
  centsToDollars,
  dollarsToCents,
  PLATFORM_FEE_PERCENT,
} from "../fees";

describe("Fee Calculations", () => {
  describe("calculatePlatformFee", () => {
    it("calculates 10% fee by default", () => {
      expect(calculatePlatformFee(1000)).toBe(100); // 10% of $10.00
      expect(calculatePlatformFee(5000)).toBe(500); // 10% of $50.00
      expect(calculatePlatformFee(12345)).toBe(1235); // 10% of $123.45, rounded
    });

    it("calculates custom fee percentage", () => {
      expect(calculatePlatformFee(1000, 5)).toBe(50); // 5% of $10.00
      expect(calculatePlatformFee(1000, 15)).toBe(150); // 15% of $10.00
      expect(calculatePlatformFee(1000, 20)).toBe(200); // 20% of $10.00
    });

    it("rounds to nearest cent", () => {
      expect(calculatePlatformFee(1234, 10)).toBe(123); // $12.34 -> $1.23
      expect(calculatePlatformFee(1235, 10)).toBe(124); // $12.35 -> $1.24 (rounded up)
    });

    it("handles zero amount", () => {
      expect(calculatePlatformFee(0)).toBe(0);
    });

    it("handles edge cases", () => {
      expect(calculatePlatformFee(1, 10)).toBe(0); // $0.01 -> $0.00 (rounded down)
      expect(calculatePlatformFee(5, 10)).toBe(1); // $0.05 -> $0.01 (rounded up)
    });
  });

  describe("calculateNetAmount", () => {
    it("calculates net amount after platform fee", () => {
      expect(calculateNetAmount(1000)).toBe(900); // $10.00 - $1.00 = $9.00
      expect(calculateNetAmount(5000)).toBe(4500); // $50.00 - $5.00 = $45.00
    });

    it("calculates net amount with custom fee", () => {
      expect(calculateNetAmount(1000, 5)).toBe(950); // $10.00 - $0.50 = $9.50
      expect(calculateNetAmount(1000, 20)).toBe(800); // $10.00 - $2.00 = $8.00
    });

    it("handles zero amount", () => {
      expect(calculateNetAmount(0)).toBe(0);
    });
  });

  describe("dollarsToCents", () => {
    it("converts dollars to cents", () => {
      expect(dollarsToCents(10)).toBe(1000);
      expect(dollarsToCents(50.5)).toBe(5050);
      expect(dollarsToCents(123.45)).toBe(12345);
    });

    it("converts string dollars to cents", () => {
      expect(dollarsToCents("10")).toBe(1000);
      expect(dollarsToCents("50.5")).toBe(5050);
      expect(dollarsToCents("123.45")).toBe(12345);
    });

    it("rounds to nearest cent", () => {
      expect(dollarsToCents(10.999)).toBe(1100); // Rounds up
      expect(dollarsToCents(10.001)).toBe(1000); // Rounds down
    });

    it("handles zero", () => {
      expect(dollarsToCents(0)).toBe(0);
      expect(dollarsToCents("0")).toBe(0);
    });
  });

  describe("centsToDollars", () => {
    it("converts cents to dollars", () => {
      expect(centsToDollars(1000)).toBe(10);
      expect(centsToDollars(5050)).toBe(50.5);
      expect(centsToDollars(12345)).toBe(123.45);
    });

    it("handles zero", () => {
      expect(centsToDollars(0)).toBe(0);
    });

    it("handles fractional cents", () => {
      expect(centsToDollars(1)).toBe(0.01);
      expect(centsToDollars(99)).toBe(0.99);
    });
  });

  describe("Constants", () => {
    it("has correct CENTS_PER_DOLLAR", () => {
      expect(CENTS_PER_DOLLAR).toBe(100);
    });

    it("has correct PLATFORM_FEE_PERCENT", () => {
      expect(PLATFORM_FEE_PERCENT).toBe(10);
    });
  });
});
