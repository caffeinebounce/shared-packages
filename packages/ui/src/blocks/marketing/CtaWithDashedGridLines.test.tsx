import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  CTAWithDashedGridLines,
  CtaWithDashedGridLines,
} from "./CtaWithDashedGridLines";

describe("CTAWithDashedGridLines", () => {
  it("renders heading, actions, quote content, and the editorial shell", () => {
    const { container } = render(
      <CTAWithDashedGridLines
        eyebrow="Work with Factory"
        heading="Ship products"
        highlightedHeading="faster"
        primaryAction={{ label: "Buy now", href: "/buy" }}
        secondaryAction={{ label: "Talk to us", href: "/talk" }}
        quoteAuthor="Michael Scarn"
      />,
    );

    expect(screen.getByText("Work with Factory")).toBeInTheDocument();
    expect(screen.getByText("Ship products")).toBeInTheDocument();
    expect(screen.getByText("faster")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Buy now" })).toHaveAttribute(
      "href",
      "/buy",
    );
    expect(screen.getByRole("link", { name: "Talk to us" })).toHaveAttribute(
      "href",
      "/talk",
    );
    expect(screen.getByText("Michael Scarn")).toBeInTheDocument();
    expect(
      container.querySelector('[data-slot="cta-dashed-shell"]'),
    ).toHaveClass("rounded-box");
    expect(
      container.querySelector('[data-slot="cta-dashed-grid"]'),
    ).toHaveClass("rounded-box");
  });

  it("omits the secondary action when none is provided", () => {
    render(
      <CTAWithDashedGridLines
        heading="Ship products"
        primaryAction={{ label: "Get in touch", href: "/contact" }}
      />,
    );

    expect(
      screen.getByRole("link", { name: "Get in touch" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Talk to us" })).toBeNull();
  });

  it("keeps the deprecated export alias working", () => {
    render(<CtaWithDashedGridLines heading="Alias still works" />);
    expect(screen.getByText("Alias still works")).toBeInTheDocument();
  });
});
