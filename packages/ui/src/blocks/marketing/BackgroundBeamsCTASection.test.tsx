import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BackgroundBeamsCTASection } from "./BackgroundBeamsCTASection";

describe("BackgroundBeamsCTASection", () => {
  beforeEach(() => {
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
    vi.unstubAllGlobals();
  });

  it("renders cta links", () => {
    render(
      <BackgroundBeamsCTASection
        heading="Launch now"
        primaryAction={{ href: "/start", label: "Get started" }}
        secondaryAction={{ href: "/docs", label: "Read docs" }}
      />,
    );

    expect(screen.getByRole("link", { name: "Get started" })).toHaveAttribute(
      "href",
      "/start",
    );
    expect(screen.getByRole("link", { name: "Read docs" })).toHaveAttribute(
      "href",
      "/docs",
    );
  });
});
