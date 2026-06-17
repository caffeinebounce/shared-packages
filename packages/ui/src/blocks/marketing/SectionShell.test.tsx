import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SectionShell } from "./SectionShell";

describe("SectionShell", () => {
  it("renders eyebrow, heading, intro, and content within the shared container", () => {
    const { container } = render(
      <SectionShell
        eyebrow="Programs"
        heading="Built for growth-stage founders"
        intro="Shared spacing and narrative scaffolding for marketing pages."
        tone="muted"
        padding="md"
      >
        <div>Inner content</div>
      </SectionShell>,
    );

    expect(screen.getByText("Programs")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Built for growth-stage founders" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Shared spacing and narrative scaffolding for marketing pages.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Inner content")).toBeInTheDocument();

    const shell = container.querySelector('[data-slot="section-shell"]');
    const header = container.querySelector(
      '[data-slot="section-shell-header"]',
    );
    const content = container.querySelector(
      '[data-slot="section-shell-content"]',
    );

    expect(shell).toHaveClass("bg-muted/30");
    expect(shell).toHaveClass("py-16");
    expect(header).toHaveClass("max-w-3xl");
    expect(content).toHaveClass("mt-10");
  });
});
