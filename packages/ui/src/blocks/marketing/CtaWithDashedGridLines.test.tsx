import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CtaWithDashedGridLines } from "./CtaWithDashedGridLines";

describe("CtaWithDashedGridLines", () => {
  it("renders heading, actions, and quote content", () => {
    render(
      <CtaWithDashedGridLines
        heading="Ship products"
        highlightedHeading="faster"
        primaryAction={{ label: "Buy now", href: "/buy" }}
        secondaryAction={{ label: "Talk to us", href: "/talk" }}
        quoteAuthor="Michael Scarn"
      />,
    );

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
  });
});
