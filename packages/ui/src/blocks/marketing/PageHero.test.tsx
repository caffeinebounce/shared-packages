import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PageHero } from "./PageHero";

describe("PageHero", () => {
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

  it("renders the same normalized config as editorial and spotlight variants", () => {
    const config = {
      eyebrow: "Capital Collective",
      title: "Bridge the missing middle",
      description:
        "A single content model should drive both the homepage hero and interior page heroes.",
      actions: [
        { href: "/apply", label: "Apply" },
        { href: "/contact", label: "Contact", variant: "outline" as const },
      ],
      media: {
        src: "/images/tcc-hero.jpg",
        alt: "Capital Collective founders",
        width: 1600,
        height: 900,
      },
    };

    const { rerender } = render(<PageHero variant="editorial" {...config} />);

    expect(
      screen.getByRole("heading", { name: "Bridge the missing middle" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Apply" })).toHaveAttribute(
      "href",
      "/apply",
    );

    rerender(<PageHero variant="spotlight" {...config} />);

    expect(
      screen.getByRole("heading", { name: "Bridge the missing middle" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Contact" })).toHaveAttribute(
      "href",
      "/contact",
    );
    expect(
      screen.queryByText("Capital Collective founders"),
    ).not.toBeInTheDocument();
  });
});
