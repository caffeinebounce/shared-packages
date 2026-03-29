import { describe, expect, it, vi } from "vitest";

import { themeScript } from "./RootLayout";

function mockMatchMedia(matches: boolean) {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      addListener: vi.fn(),
      dispatchEvent: vi.fn(),
      removeEventListener: vi.fn(),
      removeListener: vi.fn(),
    })),
  });
}

function runThemeScript() {
  new Function(themeScript)();
}

describe("themeScript", () => {
  it("adds the dark class for an explicit dark theme", () => {
    mockMatchMedia(false);
    localStorage.setItem("theme", "dark");

    runThemeScript();

    expect(document.documentElement).toHaveClass("dark");
  });

  it("removes the dark class for an explicit light theme", () => {
    mockMatchMedia(true);
    document.documentElement.classList.add("dark");
    localStorage.setItem("theme", "light");

    runThemeScript();

    expect(document.documentElement).not.toHaveClass("dark");
  });

  it("follows system dark mode when the stored theme is system", () => {
    mockMatchMedia(true);
    localStorage.setItem("theme", "system");

    runThemeScript();

    expect(document.documentElement).toHaveClass("dark");
  });

  it("follows system light mode when the stored theme is system", () => {
    mockMatchMedia(false);
    document.documentElement.classList.add("dark");
    localStorage.setItem("theme", "system");

    runThemeScript();

    expect(document.documentElement).not.toHaveClass("dark");
  });
});
