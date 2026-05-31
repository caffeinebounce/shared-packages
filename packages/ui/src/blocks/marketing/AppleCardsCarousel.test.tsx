import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  AppleCard,
  AppleCardsCarousel,
  type AppleCardsCarouselCard,
} from "./AppleCardsCarousel";

const cards: AppleCardsCarouselCard[] = [
  {
    id: "ai",
    category: "Artificial Intelligence",
    title: "You can do more with AI.",
    src: "/cards/ai.jpg",
    imageAlt: "AI headset",
    content: <p>AI detail content</p>,
  },
  {
    id: "productivity",
    category: "Productivity",
    title: "Enhance your productivity.",
    src: "/cards/productivity.jpg",
    content: <p>Productivity detail content</p>,
  },
];

describe("AppleCardsCarousel", () => {
  it("renders a horizontal carousel of provided items with controls", () => {
    render(
      <AppleCardsCarousel
        ariaLabel="Product stories"
        items={cards.map((card, index) => (
          <AppleCard card={card} index={index} key={card.id} />
        ))}
      />,
    );

    expect(
      screen.getByRole("region", { name: "Product stories" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Artificial Intelligence")).toBeInTheDocument();
    expect(screen.getByText("You can do more with AI.")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "AI headset" })).toHaveAttribute(
      "src",
      "/cards/ai.jpg",
    );
    expect(
      screen.getByRole("button", { name: "Scroll carousel left" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Scroll carousel right" }),
    ).toBeInTheDocument();
  });

  it("scrolls by the configured distance when controls are used", async () => {
    const user = userEvent.setup();
    const scrollBy = vi.fn();

    render(
      <AppleCardsCarousel
        items={[
          <AppleCard card={cards[0]} index={0} key="ai" />,
          <AppleCard card={cards[1]} index={1} key="productivity" />,
        ]}
        scrollAmount={320}
      />,
    );

    const viewport = document.querySelector(
      '[data-slot="apple-cards-viewport"]',
    );
    Object.defineProperty(viewport, "scrollBy", {
      configurable: true,
      value: scrollBy,
    });

    await user.click(
      screen.getByRole("button", { name: "Scroll carousel right" }),
    );
    expect(scrollBy).toHaveBeenLastCalledWith({
      behavior: "smooth",
      left: 320,
    });

    await user.click(
      screen.getByRole("button", { name: "Scroll carousel left" }),
    );
    expect(scrollBy).toHaveBeenLastCalledWith({
      behavior: "smooth",
      left: -320,
    });
  });

  it("applies the initial scroll position to the viewport", async () => {
    render(
      <AppleCardsCarousel
        initialScroll={240}
        items={[<AppleCard card={cards[0]} index={0} key="ai" />]}
      />,
    );

    const viewport = document.querySelector(
      '[data-slot="apple-cards-viewport"]',
    );

    await waitFor(() => expect(viewport).toHaveProperty("scrollLeft", 240));
  });

  it("opens card content in an accessible modal and closes from the close button", async () => {
    const user = userEvent.setup();

    render(<AppleCard card={cards[0]} index={0} />);

    await user.click(
      screen.getByRole("button", { name: "Open You can do more with AI." }),
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("AI detail content")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Close card" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes card content with Escape", async () => {
    const user = userEvent.setup();

    render(<AppleCard card={cards[0]} index={0} />);

    await user.click(
      screen.getByRole("button", { name: "Open You can do more with AI." }),
    );
    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("supports custom rendering hooks for trigger and modal content", async () => {
    const user = userEvent.setup();

    render(
      <AppleCard
        card={cards[0]}
        index={0}
        renderContent={(card) => <p>Custom {card.category}</p>}
        renderTriggerOverlay={(card) => <span>Read {card.category}</span>}
      />,
    );

    expect(
      screen.getByText("Read Artificial Intelligence"),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Open You can do more with AI." }),
    );

    expect(
      screen.getByText("Custom Artificial Intelligence"),
    ).toBeInTheDocument();
  });
});
