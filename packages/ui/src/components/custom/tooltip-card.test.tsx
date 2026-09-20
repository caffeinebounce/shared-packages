import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TooltipCard } from "./tooltip-card";

describe("TooltipCard", () => {
  it("renders an inline focusable trigger and rich tooltip content", () => {
    render(
      <TooltipCard
        containerClassName="custom-card"
        content={<strong>Rich tooltip content</strong>}
        open
        triggerClassName="custom-trigger"
      >
        Inline trigger
      </TooltipCard>,
    );

    const trigger = screen.getByRole("button", { name: "Inline trigger" });
    expect(trigger).toHaveAttribute("data-slot", "tooltip-card-trigger");
    expect(trigger).toHaveClass("custom-trigger");

    const tooltip = document.querySelector(
      '[data-slot="tooltip-card-content"]',
    );
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveAttribute("data-slot", "tooltip-card-content");
    expect(tooltip).toHaveClass("custom-card");
    expect(tooltip).toHaveTextContent("Rich tooltip content");
  });

  it("wraps string content in readable tooltip text", () => {
    render(
      <TooltipCard content="A reusable contextual definition." open>
        Defined term
      </TooltipCard>,
    );

    const tooltipText = document.querySelector(
      '[data-slot="tooltip-card-text"]',
    );
    expect(tooltipText).toHaveTextContent("A reusable contextual definition.");
    expect(tooltipText).toHaveAttribute("data-slot", "tooltip-card-text");
  });
});
