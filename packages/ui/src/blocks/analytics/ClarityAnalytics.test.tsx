import { render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ClarityAnalytics } from "./ClarityAnalytics";
import {
  getMicrosoftClarityScript,
  getMicrosoftClarityScriptUrl,
  normalizeMicrosoftClarityProjectId,
} from "./microsoftClarity";

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

describe("ClarityAnalytics", () => {
  afterEach(() => {
    document.head.innerHTML = "";
    document.body.innerHTML = "";
    delete window.clarity;
    vi.restoreAllMocks();
  });

  it("does not load Clarity without a project ID", () => {
    render(<ClarityAnalytics />);

    expect(document.querySelector('script[src*="clarity.ms"]')).toBeNull();
    expect(window.clarity).toBeUndefined();
  });

  it("does not load Clarity when disabled", () => {
    render(<ClarityAnalytics enabled={false} projectId="abc123" />);

    expect(document.querySelector('script[src*="clarity.ms"]')).toBeNull();
    expect(window.clarity).toBeUndefined();
  });

  it("loads the Clarity script with a normalized project ID", async () => {
    render(<ClarityAnalytics projectId=" abc123 " />);

    await waitFor(() => {
      expect(
        document.querySelector('script[src*="clarity.ms"]'),
      ).toHaveAttribute("src", "https://www.clarity.ms/tag/abc123");
    });
    expect(window.clarity).toBeTypeOf("function");
  });

  it("does not load duplicate scripts", async () => {
    const { rerender } = render(<ClarityAnalytics projectId="abc123" />);

    await waitFor(() => {
      expect(
        document.querySelectorAll('script[src*="clarity.ms"]'),
      ).toHaveLength(1);
    });

    rerender(<ClarityAnalytics projectId="abc123" />);

    expect(document.querySelectorAll('script[src*="clarity.ms"]')).toHaveLength(
      1,
    );
  });

  it("warns and skips unsafe project IDs", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    render(<ClarityAnalytics projectId="abc/123" />);

    expect(warn).toHaveBeenCalledWith(
      "Invalid Microsoft Clarity project ID: abc/123. Expected letters, numbers, underscores, or dashes.",
    );
    expect(document.querySelector('script[src*="clarity.ms"]')).toBeNull();
  });
});
