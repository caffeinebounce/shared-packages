import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TextGenerateHeroCopy } from "./TextGenerateHeroCopy";

describe("TextGenerateHeroCopy", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockImplementation(() => ({
        matches: false,
        media: "",
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("eventually reveals full copy", () => {
    render(<TextGenerateHeroCopy text="Build beautiful interfaces" />);

    act(() => {
      vi.advanceTimersByTime(4000);
    });

    expect(screen.getByRole("heading", { level: 1 }).textContent).toContain(
      "Build beautiful interfaces",
    );
  });
});
