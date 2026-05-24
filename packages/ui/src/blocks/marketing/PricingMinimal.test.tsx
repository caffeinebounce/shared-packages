import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PricingMinimal } from "./PricingMinimal";

describe("PricingMinimal", () => {
  const tiers = [
    {
      id: "starter",
      eyebrow: "01",
      name: "Starter",
      price: "Fixed retainer",
      priceDetail: "For a defined monthly scope.",
      description: "A focused package for essential support.",
      features: ["Feature one", "Feature two"],
      action: <a href="/start">Start</a>,
    },
    {
      id: "complete",
      eyebrow: "02",
      name: "Complete",
      price: "Custom retainer",
      description: "The full operating layer.",
      features: ["Everything in starter", "Advisor coordination"],
      featured: true,
    },
  ];

  it("renders a theme-safe minimal pricing section", () => {
    const { container } = render(
      <PricingMinimal
        description="Transparent options for different levels of support."
        eyebrow="Pricing"
        heading="Choose the right operating level."
        tiers={tiers}
      />,
    );

    expect(screen.getByText("Pricing")).toBeInTheDocument();
    expect(
      screen.getByText("Choose the right operating level."),
    ).toBeInTheDocument();
    expect(screen.getByText("Starter")).toBeInTheDocument();
    expect(screen.getByText("Complete")).toBeInTheDocument();
    expect(screen.getByText("Feature one")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Start" })).toHaveAttribute(
      "href",
      "/start",
    );
    expect(
      container.querySelectorAll('[data-slot="pricing-minimal-card"]'),
    ).toHaveLength(2);
  });

  it("marks the featured tier without changing the public API", () => {
    const { container } = render(<PricingMinimal tiers={tiers} />);
    const cards = container.querySelectorAll(
      '[data-slot="pricing-minimal-card"]',
    );

    expect(cards[0]).not.toHaveAttribute("data-featured");
    expect(cards[1]).toHaveAttribute("data-featured", "true");
    expect(cards[1]).toHaveClass("border-primary/50");
  });

  it("uses shared desktop grid rows to align card sections", () => {
    const { container } = render(<PricingMinimal tiers={tiers} />);
    const grid = container.querySelector('[data-slot="pricing-minimal-grid"]');
    const card = container.querySelector('[data-slot="pricing-minimal-card"]');
    const action = container.querySelector(
      '[data-slot="pricing-minimal-action"]',
    );
    const notes = container.querySelectorAll(
      '[data-slot="pricing-minimal-note"]',
    );

    expect(grid).toHaveClass("md:[grid-template-rows:auto_auto_1fr_auto_auto]");
    expect(card).toHaveClass("md:grid-rows-subgrid");
    expect(card).toHaveClass("md:row-span-5");
    expect(action).toHaveClass("justify-start");
    expect(notes).toHaveLength(2);
  });
});
