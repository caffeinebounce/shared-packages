import { describe, expect, it } from "vitest";
import {
  getMicrosoftClarityScript,
  getMicrosoftClarityScriptUrl,
  normalizeMicrosoftClarityProjectId,
} from "../analytics";

describe("Microsoft Clarity utilities", () => {
  it("normalizes valid project IDs and rejects unsafe values", () => {
    expect(normalizeMicrosoftClarityProjectId(" abc_123-XYZ ")).toBe(
      "abc_123-XYZ",
    );
    expect(normalizeMicrosoftClarityProjectId("")).toBeNull();
    expect(normalizeMicrosoftClarityProjectId("abc/123")).toBeNull();
  });

  it("builds the Clarity script URL and inline script", () => {
    expect(getMicrosoftClarityScriptUrl("abc123")).toBe(
      "https://www.clarity.ms/tag/abc123",
    );
    expect(getMicrosoftClarityScript("abc123")).toContain(
      '"clarity", "script", "abc123"',
    );
  });

  it("throws for invalid project IDs", () => {
    expect(() => getMicrosoftClarityScriptUrl("abc/123")).toThrow(
      "Invalid Microsoft Clarity project ID.",
    );
    expect(() => getMicrosoftClarityScript("abc/123")).toThrow(
      "Invalid Microsoft Clarity project ID.",
    );
  });
});
