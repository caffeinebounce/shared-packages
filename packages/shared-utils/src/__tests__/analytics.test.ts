import { describe, expect, it } from "vitest";
import {
  getGoogleTagManagerNoScriptUrl,
  getGoogleTagManagerScript,
  getGoogleTagManagerScriptUrl,
  getMicrosoftClarityScript,
  getMicrosoftClarityScriptUrl,
  normalizeGoogleTagManagerContainerId,
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

describe("Google Tag Manager utilities", () => {
  it("normalizes valid container IDs and rejects unsafe values", () => {
    expect(normalizeGoogleTagManagerContainerId(" gtm-abc123 ")).toBe(
      "GTM-ABC123",
    );
    expect(normalizeGoogleTagManagerContainerId("")).toBeNull();
    expect(normalizeGoogleTagManagerContainerId("G-ABC123")).toBeNull();
    expect(normalizeGoogleTagManagerContainerId("GTM-ABC/123")).toBeNull();
  });

  it("builds the GTM script and noscript URLs", () => {
    expect(getGoogleTagManagerScriptUrl("GTM-ABC123")).toBe(
      "https://www.googletagmanager.com/gtm.js?id=GTM-ABC123",
    );
    expect(getGoogleTagManagerNoScriptUrl("GTM-ABC123")).toBe(
      "https://www.googletagmanager.com/ns.html?id=GTM-ABC123",
    );
  });

  it("supports custom data layer names", () => {
    expect(getGoogleTagManagerScriptUrl("GTM-ABC123", "customLayer")).toBe(
      "https://www.googletagmanager.com/gtm.js?id=GTM-ABC123&l=customLayer",
    );
    expect(getGoogleTagManagerNoScriptUrl("GTM-ABC123", "customLayer")).toBe(
      "https://www.googletagmanager.com/ns.html?id=GTM-ABC123&l=customLayer",
    );
    expect(getGoogleTagManagerScript("GTM-ABC123", "customLayer")).toContain(
      '"customLayer", "GTM-ABC123"',
    );
  });

  it("throws for invalid GTM container IDs", () => {
    expect(() => getGoogleTagManagerScriptUrl("G-ABC123")).toThrow(
      "Invalid Google Tag Manager container ID.",
    );
    expect(() => getGoogleTagManagerNoScriptUrl("GTM-ABC/123")).toThrow(
      "Invalid Google Tag Manager container ID.",
    );
    expect(() => getGoogleTagManagerScript("GTM-ABC/123")).toThrow(
      "Invalid Google Tag Manager container ID.",
    );
  });
});
