import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FocusCards } from "./FocusCards";

describe("FocusCards", () => {
  const cards = [
    {
      title: "Forest Adventure",
      src: "https://images.unsplash.com/photo-1518710843675-2540dd79065c?q=80&w=400",
    },
    {
      title: "Valley of life",
      src: "https://images.unsplash.com/photo-1600271772470-bd22a42787b3?q=80&w=400",
    },
    {
      title: "Camping is for pros",
      src: "https://images.unsplash.com/photo-1486915309851-b0cc1f8a0084?q=80&w=400",
    },
  ];

  it("renders a focus cards grid with all card titles (revealed on interaction)", () => {
    const { container } = render(<FocusCards cards={cards} />);

    // Titles are in the DOM even if visually hidden until hover (opacity-0)
    expect(screen.getByText("Forest Adventure")).toBeInTheDocument();
    expect(screen.getByText("Valley of life")).toBeInTheDocument();
    expect(screen.getByText("Camping is for pros")).toBeInTheDocument();

    // Root container marker
    expect(
      container.querySelector('[data-slot="focus-cards"]'),
    ).toBeInTheDocument();

    // Individual cards
    const cardEls = container.querySelectorAll('[data-slot="focus-card"]');
    expect(cardEls.length).toBe(3);
  });

  it("applies custom className to the grid container", () => {
    const { container } = render(
      <FocusCards
        cards={cards}
        className="max-w-4xl mx-auto md:grid-cols-2 gap-6"
      />,
    );

    const root = container.querySelector('[data-slot="focus-cards"]');
    expect(root).toBeInTheDocument();
    expect(root?.className).toContain("max-w-4xl");
    expect(root?.className).toContain("md:grid-cols-2");
  });

  it("focuses a card and blurs sibling cards on hover and keyboard focus", () => {
    const { container } = render(<FocusCards cards={cards} />);

    const cardEls = container.querySelectorAll('[data-slot="focus-card"]');
    const [firstCard, secondCard] = cardEls;

    expect(screen.getByRole("button", { name: "Forest Adventure" })).toBe(
      firstCard,
    );

    fireEvent.mouseEnter(firstCard);

    expect(firstCard.className).toContain("ring-1");
    expect(secondCard.className).toContain("blur-sm");

    fireEvent.mouseLeave(firstCard);

    expect(firstCard.className).not.toContain("ring-1");
    expect(secondCard.className).not.toContain("blur-sm");

    fireEvent.focus(secondCard);

    expect(secondCard.className).toContain("ring-1");
    expect(firstCard.className).toContain("blur-sm");

    fireEvent.blur(secondCard);

    expect(secondCard.className).not.toContain("ring-1");
    expect(firstCard.className).not.toContain("blur-sm");
  });
});
