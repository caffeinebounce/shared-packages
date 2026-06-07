import { describe, expect, it } from "vitest";
import {
  capitalize,
  ensureAbsoluteUrl,
  getInitials,
  pluralize,
  preventWidows,
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

describe("preventWidows", () => {
  it("locks the last 2 words by default", () => {
    expect(preventWidows("A purpose-built platform for the culture.")).toBe(
      "A purpose-built platform for the\u00A0culture.",
    );
  });

  it("locks four-word strings into balanced 2-word pairs", () => {
    expect(preventWidows("One coordinated advisory view")).toBe(
      "One\u00A0coordinated advisory\u00A0view",
    );
  });

  it("locks the configured number of trailing words", () => {
    expect(
      preventWidows(
        "We turn culture and influence into capital and ownership.",
        {
          wordCount: 3,
        },
      ),
    ).toBe(
      "We turn culture and influence into capital\u00A0and\u00A0ownership.",
    );
  });

  it("returns short strings unchanged by default", () => {
    expect(preventWidows("Factory")).toBe("Factory");
    expect(preventWidows("Get Started")).toBe("Get Started");
  });

  it("respects custom minimum word counts", () => {
    expect(preventWidows("One two three", { minWords: 4 })).toBe(
      "One two three",
    );
    expect(preventWidows("One two three four", { minWords: 4 })).toBe(
      "One\u00A0two three\u00A0four",
    );
  });

  it("preserves leading and trailing whitespace", () => {
    expect(preventWidows("  durable wealth-building plan  ")).toBe(
      "  durable wealth-building\u00A0plan  ",
    );
  });

  it("preserves existing non-breaking spaces by default", () => {
    expect(preventWidows("capital and\u00A0ownership", { wordCount: 3 })).toBe(
      "capital\u00A0and\u00A0ownership",
    );
  });

  it("can normalize existing non-breaking spaces", () => {
    expect(
      preventWidows("capital and\u00A0ownership", {
        preserveExistingNbsp: false,
        wordCount: 3,
      }),
    ).toBe("capital\u00A0and\u00A0ownership");
  });

  it("keeps earlier multiline whitespace unchanged while locking final words", () => {
    expect(preventWidows("Factory helps\nclients build durable wealth")).toBe(
      "Factory helps\nclients build durable\u00A0wealth",
    );
  });

  it("returns empty strings for empty, null, and undefined inputs", () => {
    expect(preventWidows("")).toBe("");
    expect(preventWidows(null)).toBe("");
    expect(preventWidows(undefined)).toBe("");
  });
});
