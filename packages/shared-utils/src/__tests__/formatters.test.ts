import { describe, expect, it } from "vitest";
import {
  formatCompactCurrency,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatNumber,
  formatPercentage,
  formatPhoneInput,
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

describe("formatCompactCurrency", () => {
  it("formats millions with M suffix", () => {
    expect(formatCompactCurrency(1500000)).toBe("$1.5M");
    expect(formatCompactCurrency(2000000)).toBe("$2.0M");
  });

  it("formats thousands with K suffix", () => {
    expect(formatCompactCurrency(500000)).toBe("$500K");
    expect(formatCompactCurrency(1000)).toBe("$1K");
    expect(formatCompactCurrency(250000)).toBe("$250K");
  });

  it("formats small values without suffix", () => {
    expect(formatCompactCurrency(750)).toBe("$750");
    expect(formatCompactCurrency(0)).toBe("$0");
    expect(formatCompactCurrency(999)).toBe("$999");
  });

  it("handles negative values", () => {
    expect(formatCompactCurrency(-1200000)).toBe("-$1.2M");
    expect(formatCompactCurrency(-50000)).toBe("-$50K");
    expect(formatCompactCurrency(-500)).toBe("-$500");
  });

  it("handles edge cases at boundaries", () => {
    expect(formatCompactCurrency(1000000)).toBe("$1.0M");
    expect(formatCompactCurrency(999999)).toBe("$1000K");
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

describe("formatPhoneInput", () => {
  it("returns empty string for empty input", () => {
    expect(formatPhoneInput("")).toBe("");
  });

  it("returns just digits for 1-3 characters", () => {
    expect(formatPhoneInput("1")).toBe("1");
    expect(formatPhoneInput("12")).toBe("12");
    expect(formatPhoneInput("123")).toBe("123");
  });

  it("formats 4-6 digits with area code parentheses", () => {
    expect(formatPhoneInput("1234")).toBe("(123) 4");
    expect(formatPhoneInput("12345")).toBe("(123) 45");
    expect(formatPhoneInput("123456")).toBe("(123) 456");
  });

  it("formats 7-10 digits with full format", () => {
    expect(formatPhoneInput("1234567")).toBe("(123) 456-7");
    expect(formatPhoneInput("12345678")).toBe("(123) 456-78");
    expect(formatPhoneInput("123456789")).toBe("(123) 456-789");
    expect(formatPhoneInput("1234567890")).toBe("(123) 456-7890");
  });

  it("truncates input longer than 10 digits", () => {
    expect(formatPhoneInput("12345678901")).toBe("(123) 456-7890");
    expect(formatPhoneInput("123456789012345")).toBe("(123) 456-7890");
  });

  it("strips non-numeric characters", () => {
    expect(formatPhoneInput("(123) 456-7890")).toBe("(123) 456-7890");
    expect(formatPhoneInput("123-456-7890")).toBe("(123) 456-7890");
    expect(formatPhoneInput("123.456.7890")).toBe("(123) 456-7890");
    expect(formatPhoneInput("abc-123-xyz-456")).toBe("(123) 456");
  });

  it("handles mixed input with letters and numbers", () => {
    expect(formatPhoneInput("1a2b3c")).toBe("123");
    expect(formatPhoneInput("phone: 555-1234")).toBe("(555) 123-4");
  });
});
