import { describe, expect, it } from "vitest";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatNumber,
  formatPercentage,
  formatPhoneNumber,
} from "../formatters";

describe("formatDate", () => {
  it("formats a date string correctly", () => {
    // Use full ISO string to avoid timezone issues
    const result = formatDate("2024-01-15T12:00:00");
    expect(result).toBe("Jan 15, 2024");
  });

  it("formats a Date object correctly", () => {
    // Use explicit time to avoid UTC midnight rollback
    const result = formatDate(new Date("2024-06-20T12:00:00"));
    expect(result).toBe("Jun 20, 2024");
  });

  it("returns em dash for null", () => {
    expect(formatDate(null)).toBe("—");
  });

  it("returns em dash for undefined", () => {
    expect(formatDate(undefined)).toBe("—");
  });

  it("returns em dash for invalid date string", () => {
    expect(formatDate("not-a-date")).toBe("—");
  });

  it("accepts custom options", () => {
    const result = formatDate("2024-01-15", { month: "long", year: "numeric" });
    expect(result).toBe("January 2024");
  });
});

describe("formatDateTime", () => {
  it("formats date with time", () => {
    // Note: Time zone dependent, so we check for the basic structure
    const result = formatDateTime("2024-01-15T14:30:00Z");
    expect(result).toMatch(/Jan 15, 2024/);
  });

  it("returns em dash for null", () => {
    expect(formatDateTime(null)).toBe("—");
  });
});

describe("formatPhoneNumber", () => {
  it("formats a 10-digit phone number", () => {
    expect(formatPhoneNumber("1234567890")).toBe("(123) 456-7890");
  });

  it("formats a phone number with country code", () => {
    expect(formatPhoneNumber("11234567890")).toBe("+1 (123) 456-7890");
  });

  it("formats a phone number with +1 prefix", () => {
    expect(formatPhoneNumber("+11234567890")).toBe("+1 (123) 456-7890");
  });

  it("returns original for non-standard format", () => {
    expect(formatPhoneNumber("123")).toBe("123");
  });

  it("returns em dash for null", () => {
    expect(formatPhoneNumber(null)).toBe("—");
  });

  it("returns em dash for undefined", () => {
    expect(formatPhoneNumber(undefined)).toBe("—");
  });
});

describe("formatCurrency", () => {
  it("formats a number as USD currency", () => {
    expect(formatCurrency(1234.56)).toBe("$1,234.56");
  });

  it("formats a string number as currency", () => {
    expect(formatCurrency("1000")).toBe("$1,000.00");
  });

  it("formats with different currency", () => {
    const result = formatCurrency(1000, "EUR");
    expect(result).toMatch(/€|EUR/);
  });

  it("returns em dash for null", () => {
    expect(formatCurrency(null)).toBe("—");
  });

  it("returns em dash for empty string", () => {
    expect(formatCurrency("")).toBe("—");
  });

  it("returns em dash for NaN", () => {
    expect(formatCurrency("not-a-number")).toBe("—");
  });
});

describe("formatPercentage", () => {
  it("formats a number as percentage", () => {
    expect(formatPercentage(50)).toBe("50%");
  });

  it("formats with decimals", () => {
    expect(formatPercentage(33.333, 2)).toBe("33.33%");
  });

  it("formats a string number", () => {
    expect(formatPercentage("75")).toBe("75%");
  });

  it("returns em dash for null", () => {
    expect(formatPercentage(null)).toBe("—");
  });

  it("returns em dash for undefined", () => {
    expect(formatPercentage(undefined)).toBe("—");
  });
});

describe("formatNumber", () => {
  it("formats a number with separators", () => {
    expect(formatNumber(1234567)).toBe("1,234,567");
  });

  it("formats with custom options", () => {
    expect(formatNumber(1234.5678, { maximumFractionDigits: 2 })).toBe(
      "1,234.57",
    );
  });

  it("returns em dash for null", () => {
    expect(formatNumber(null)).toBe("—");
  });
});
