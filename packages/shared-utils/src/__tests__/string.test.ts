import { describe, expect, it } from "vitest";
import {
  capitalize,
  ensureAbsoluteUrl,
  getInitials,
  pluralize,
  slugify,
  truncate,
} from "../string";

describe("getInitials", () => {
  it("returns initials from two-word name", () => {
    expect(getInitials("John Doe")).toBe("JD");
  });

  it("returns single initial from one-word name", () => {
    expect(getInitials("Jane")).toBe("J");
  });

  it("returns first two initials from three-word name", () => {
    expect(getInitials("John Michael Doe")).toBe("JM");
  });

  it("returns ? for null", () => {
    expect(getInitials(null)).toBe("?");
  });

  it("returns ? for undefined", () => {
    expect(getInitials(undefined)).toBe("?");
  });

  it("returns ? for empty string", () => {
    expect(getInitials("")).toBe("?");
  });

  it("returns uppercase initials", () => {
    expect(getInitials("john doe")).toBe("JD");
  });
});

describe("ensureAbsoluteUrl", () => {
  it("adds https to URL without protocol", () => {
    expect(ensureAbsoluteUrl("example.com")).toBe("https://example.com");
  });

  it("preserves https URLs", () => {
    expect(ensureAbsoluteUrl("https://example.com")).toBe(
      "https://example.com",
    );
  });

  it("preserves http URLs", () => {
    expect(ensureAbsoluteUrl("http://example.com")).toBe("http://example.com");
  });

  it("returns empty string for null", () => {
    expect(ensureAbsoluteUrl(null)).toBe("");
  });

  it("returns empty string for undefined", () => {
    expect(ensureAbsoluteUrl(undefined)).toBe("");
  });
});

describe("truncate", () => {
  it("truncates long text with ellipsis", () => {
    expect(truncate("Hello World", 8)).toBe("Hello...");
  });

  it("returns short text unchanged", () => {
    expect(truncate("Hi", 8)).toBe("Hi");
  });

  it("returns text at exact length unchanged", () => {
    expect(truncate("12345678", 8)).toBe("12345678");
  });

  it("returns empty string for null", () => {
    expect(truncate(null, 10)).toBe("");
  });

  it("returns empty string for undefined", () => {
    expect(truncate(undefined, 10)).toBe("");
  });
});

describe("slugify", () => {
  it("converts text to lowercase hyphenated slug", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("removes special characters", () => {
    expect(slugify("My Example Title!")).toBe("my-example-title");
  });

  it("handles multiple spaces", () => {
    expect(slugify("Hello   World")).toBe("hello-world");
  });

  it("trims hyphens from start and end", () => {
    expect(slugify(" Hello World ")).toBe("hello-world");
  });

  it("returns empty string for null", () => {
    expect(slugify(null)).toBe("");
  });
});

describe("capitalize", () => {
  it("capitalizes first letter", () => {
    expect(capitalize("hello")).toBe("Hello");
  });

  it("preserves rest of string", () => {
    expect(capitalize("hELLO")).toBe("HELLO");
  });

  it("returns empty string for null", () => {
    expect(capitalize(null)).toBe("");
  });

  it("returns empty string for empty input", () => {
    expect(capitalize("")).toBe("");
  });
});

describe("pluralize", () => {
  it("returns singular for count of 1", () => {
    expect(pluralize(1, "item")).toBe("item");
  });

  it("returns plural for count of 0", () => {
    expect(pluralize(0, "item")).toBe("items");
  });

  it("returns plural for count > 1", () => {
    expect(pluralize(5, "item")).toBe("items");
  });

  it("uses custom plural form", () => {
    expect(pluralize(0, "child", "children")).toBe("children");
    expect(pluralize(1, "child", "children")).toBe("child");
    expect(pluralize(2, "child", "children")).toBe("children");
  });
});
