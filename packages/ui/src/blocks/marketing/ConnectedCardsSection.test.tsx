import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ConnectedCardsSection } from "./ConnectedCardsSection";

describe("ConnectedCardsSection", () => {
  const items = [
    {
      id: "wealth",
      title: "Wealth Management",
      description: "Core advisory",
      href: "/wealth",
      icon: <span aria-hidden="true">$</span>,
    },
    {
      id: "family-office",
      title: "Family Office",
      description: "Private administration",
      href: "/family-office",
    },
  ];

  it("renders a connected cards marketing block", () => {
    const { container } = render(
      <ConnectedCardsSection
        action={<a href="/learn">Learn More</a>}
        description="A reusable section for showing connected tools or services."
        eyebrow="Connected Platform"
        heading="Everything works better together."
        items={items}
      />,
    );

    expect(screen.getByText("Connected Platform")).toBeInTheDocument();
    expect(
      screen.getByText("Everything works better together."),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "A reusable section for showing connected tools or services.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Learn More/i })).toHaveAttribute(
      "href",
      "/learn",
    );
    expect(
      container.querySelector('[data-slot="connected-cards-section"]'),
    ).toBeInTheDocument();
    expect(
      container.querySelector('[data-slot="connected-cards-visual"]'),
    ).toBeInTheDocument();
    expect(
      container.querySelector('[data-slot="connected-cards-oval"]'),
    ).toHaveStyle({ transform: "translate(-50%, -50%)" });
    expect(
      container.querySelector('[data-slot="connected-cards-action"]'),
    ).toBeInTheDocument();
  });

  it("renders linked cards with semantic colors and sharp theme radius", () => {
    const { container } = render(
      <ConnectedCardsSection heading="Connected services" items={items} />,
    );

    const cards = container.querySelectorAll(
      '[data-slot="connected-cards-card"]',
    );

    expect(cards).toHaveLength(2);
    expect(
      screen.getByRole("link", { name: /Wealth Management/i }),
    ).toHaveAttribute("href", "/wealth");
    expect(
      screen.getByRole("link", { name: /Family Office/i }),
    ).toHaveAttribute("href", "/family-office");
    expect(
      screen.getByRole("link", {
        name: "Family Office Private administration",
      }),
    ).toBeInTheDocument();
    expect(cards[0]).toHaveClass("border-border");
    expect(cards[0]).toHaveClass("bg-card");
    expect(cards[0]).toHaveClass("rounded-box");
    expect(cards[0]).toHaveClass("sm:h-48");
    expect(cards[0]).not.toHaveClass("rounded-lg");
    expect(cards[0].querySelector("h3")).toHaveClass("font-sans");
    expect(cards[0].querySelector("h3")).toHaveClass("tracking-normal");
  });

  it("uses a symmetric visual layout for five cards", () => {
    const fiveItems = [
      ...items,
      { id: "club", title: "Club" },
      { id: "investments", title: "Investments" },
      { id: "philanthropy", title: "Philanthropy" },
    ];
    const { container } = render(
      <ConnectedCardsSection heading="Connected services" items={fiveItems} />,
    );

    const cards = container.querySelectorAll(
      '[data-slot="connected-cards-card"]',
    );

    expect(cards).toHaveLength(5);
    expect(cards[0]).toHaveClass("sm:left-[32%]");
    expect(cards[0]).toHaveClass("sm:top-0");
    expect(cards[1]).toHaveClass("sm:left-0");
    expect(cards[1]).toHaveClass("sm:top-[28%]");
    expect(cards[2]).toHaveClass("sm:right-0");
    expect(cards[2]).toHaveClass("sm:top-[28%]");
    expect(cards[3]).toHaveClass("sm:left-[14%]");
    expect(cards[3]).toHaveClass("sm:bottom-0");
    expect(cards[4]).toHaveClass("sm:right-[14%]");
    expect(cards[4]).toHaveClass("sm:bottom-0");
  });
});
