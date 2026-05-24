import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  FeaturePatternCard,
  FeaturePatternGrid,
  FeaturesSectionPattern,
} from "./FeaturesSectionPattern";

describe("FeaturesSectionPattern", () => {
  const items = [
    {
      id: "accounting",
      eyebrow: "01",
      title: "Personal accounting",
      description: "Track money coming in and going out.",
    },
    {
      id: "payables",
      eyebrow: "02",
      title: "Bill pay",
      description: "Keep obligations moving on time.",
    },
  ];

  it("renders an Aceternity-inspired pattern feature section", () => {
    const { container } = render(
      <FeaturesSectionPattern
        description="A reusable theme-safe feature section."
        eyebrow="Features"
        items={items}
        title="Organized around the work."
      />,
    );

    expect(screen.getByText("Features")).toBeInTheDocument();
    expect(screen.getByText("Organized around the work.")).toBeInTheDocument();
    expect(
      screen.getByText("A reusable theme-safe feature section."),
    ).toBeInTheDocument();
    expect(screen.getByText("Personal accounting")).toBeInTheDocument();
    expect(screen.getByText("Bill pay")).toBeInTheDocument();
    expect(
      container.querySelectorAll('[data-slot="feature-pattern-card"]'),
    ).toHaveLength(2);
  });

  it("uses the shared box radius token and semantic colors", () => {
    const { container } = render(<FeaturePatternGrid items={items} />);
    const card = container.querySelector('[data-slot="feature-pattern-card"]');

    expect(card).toHaveClass("rounded-box");
    expect(card).toHaveClass("border-border");
    expect(card).toHaveClass("from-muted/55");
    expect(card).toHaveClass("to-background");
  });

  it("supports custom pattern data and card classes", () => {
    const { container } = render(
      <FeaturePatternCard
        className="custom-card"
        pattern={[[1, 2]]}
        title="Custom visual"
      />,
    );

    expect(screen.getByText("Custom visual")).toBeInTheDocument();
    expect(container.querySelector(".custom-card")).toBeInTheDocument();
    expect(
      container.querySelector('[data-slot="feature-pattern-background"] svg'),
    ).toBeInTheDocument();
  });
});
