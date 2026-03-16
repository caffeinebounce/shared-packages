import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SpotlightHeroSection } from "./SpotlightHeroSection";

describe("SpotlightHeroSection", () => {
  it("renders heading and actions", () => {
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

    render(
      <SpotlightHeroSection
        eyebrow="New"
        heading="Ship products faster"
        subheading="Reusable motion blocks"
        actions={[{ href: "/start", label: "Start" }]}
      />,
    );

    expect(screen.getByText("Ship products faster")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Start" })).toHaveAttribute(
      "href",
      "/start",
    );

    vi.unstubAllGlobals();
  });
});
