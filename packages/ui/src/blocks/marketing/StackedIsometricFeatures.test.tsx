import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { StackedIsometricFeatures } from "./StackedIsometricFeatures";

const items = [
  {
    title: "Culture",
    description:
      "Identify the signals, communities, and stories shaping demand before the market fully prices them in.",
    visualCaption: "Culture creates the signal.",
  },
  {
    title: "Attention",
    description:
      "Build distribution systems that turn resonance into reach, trust, and recurring influence.",
    visualCaption: "Media expands the attention.",
  },
  {
    title: "Capital",
    description:
      "Use strategy, partnerships, and financial structure to capture value instead of renting it.",
    visualCaption: "Capital captures the upside.",
  },
];

afterEach(() => {
  vi.useRealTimers();
});

describe("StackedIsometricFeatures", () => {
  it("renders the section header, list items, and visual structure", () => {
    const { container } = render(
      <StackedIsometricFeatures
        description="Each stage expands the next into durable ownership."
        eyebrow="Ownership Flywheel"
        heading="A repeatable system for turning influence into assets."
        items={items}
      />,
    );

    expect(
      screen.getByRole("heading", {
        name: "A repeatable system for turning influence into assets.",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Each stage expands the next into durable ownership."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /culture/i }),
    ).toBeInTheDocument();
    expect(
      container.querySelector(
        '[data-slot="stacked-isometric-features-content"]',
      ),
    ).toHaveClass("lg:grid-cols-2");
    expect(
      container.querySelector('[data-slot="stacked-isometric-features-list"]'),
    ).toHaveClass("grid");
    expect(
      container.querySelector('[data-slot="stacked-isometric-visual"]'),
    ).toHaveClass("min-h-[28rem]", "overflow-visible");
    expect(
      container.querySelectorAll('[data-slot="stacked-isometric-box"]'),
    ).toHaveLength(items.length);
    expect(
      container.querySelectorAll(
        '[data-slot="stacked-isometric-box"][data-state="active"]',
      ),
    ).toHaveLength(1);
    expect(screen.getByText("Culture creates the signal.")).toBeInTheDocument();
  });

  it("updates the active feature when an item is clicked", () => {
    render(<StackedIsometricFeatures autoplay={false} items={items} />);

    const cultureButton = screen.getByRole("button", { name: /culture/i });
    const attentionButton = screen.getByRole("button", { name: /attention/i });

    expect(cultureButton).toHaveAttribute("aria-pressed", "true");
    expect(attentionButton).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(attentionButton);

    expect(cultureButton).toHaveAttribute("aria-pressed", "false");
    expect(attentionButton).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.queryByText("Culture creates the signal."),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText("Media expands the attention."),
    ).toBeInTheDocument();
  });

  it("updates the active feature when an item is hovered", () => {
    render(<StackedIsometricFeatures autoplay={false} items={items} />);

    const cultureButton = screen.getByRole("button", { name: /culture/i });
    const attentionButton = screen.getByRole("button", { name: /attention/i });

    expect(cultureButton).toHaveAttribute("aria-pressed", "true");
    expect(attentionButton).toHaveAttribute("aria-pressed", "false");

    fireEvent.mouseEnter(attentionButton);

    expect(cultureButton).toHaveAttribute("aria-pressed", "false");
    expect(attentionButton).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByText("Media expands the attention."),
    ).toBeInTheDocument();
  });

  it("supports up and down arrow key navigation across feature cards", () => {
    render(<StackedIsometricFeatures autoplay={false} items={items} />);

    const cultureButton = screen.getByRole("button", { name: /culture/i });
    const attentionButton = screen.getByRole("button", { name: /attention/i });
    const capitalButton = screen.getByRole("button", { name: /capital/i });

    cultureButton.focus();
    fireEvent.keyDown(cultureButton, { key: "ArrowDown" });

    expect(attentionButton).toHaveFocus();
    expect(attentionButton).toHaveAttribute("aria-pressed", "true");

    fireEvent.keyDown(attentionButton, { key: "ArrowUp" });

    expect(cultureButton).toHaveFocus();
    expect(cultureButton).toHaveAttribute("aria-pressed", "true");

    fireEvent.keyDown(cultureButton, { key: "ArrowUp" });

    expect(capitalButton).toHaveFocus();
    expect(capitalButton).toHaveAttribute("aria-pressed", "true");
  });

  it("cycles the active feature on the autoplay interval", () => {
    vi.useFakeTimers();

    render(
      <StackedIsometricFeatures
        autoplay
        autoplayIntervalMs={3000}
        items={items}
      />,
    );

    const buttons = screen.getAllByRole("button");

    expect(buttons[0]).toHaveAttribute("aria-pressed", "true");
    expect(buttons[1]).toHaveAttribute("aria-pressed", "false");

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(buttons[0]).toHaveAttribute("aria-pressed", "false");
    expect(buttons[1]).toHaveAttribute("aria-pressed", "true");
  });

  it("keeps the visual uncluttered and respects defaultActiveIndex", () => {
    const { container } = render(
      <StackedIsometricFeatures
        autoplay={false}
        defaultActiveIndex={1}
        items={items}
      />,
    );

    const visual = container.querySelector(
      '[data-slot="stacked-isometric-visual"]',
    );
    const buttons = screen.getAllByRole("button");

    expect(buttons[0]).toHaveAttribute("aria-pressed", "false");
    expect(buttons[1]).toHaveAttribute("aria-pressed", "true");
    expect(
      container.querySelector(
        '[data-slot="stacked-isometric-box"][data-state="active"]',
      ),
    ).toHaveAttribute("data-peel-direction", "right");
    expect(
      container.querySelectorAll(
        '[data-slot="stacked-isometric-box-top-face-detail"]',
      ),
    ).toHaveLength(1);
    expect(
      container.querySelectorAll(
        '[data-slot="stacked-isometric-box-detached-face"]',
      ),
    ).toHaveLength(1);
    expect(
      within(visual as HTMLElement).queryByText("Culture"),
    ).not.toBeInTheDocument();
    expect(
      within(visual as HTMLElement).queryByText("Attention"),
    ).not.toBeInTheDocument();
    expect(
      within(visual as HTMLElement).queryByText("Capital"),
    ).not.toBeInTheDocument();
    expect(
      within(visual as HTMLElement).getByText("Media expands the attention."),
    ).toBeInTheDocument();
    expect(
      within(visual as HTMLElement).queryByText("Culture creates the signal."),
    ).not.toBeInTheDocument();
  });

  it("resets the autoplay interval after a manual selection", () => {
    vi.useFakeTimers();

    render(
      <StackedIsometricFeatures
        autoplay
        autoplayIntervalMs={3000}
        items={items}
      />,
    );

    const attentionButton = screen.getByRole("button", { name: /attention/i });
    const capitalButton = screen.getByRole("button", { name: /capital/i });

    fireEvent.click(attentionButton);

    act(() => {
      vi.advanceTimersByTime(2999);
    });

    expect(attentionButton).toHaveAttribute("aria-pressed", "true");
    expect(capitalButton).toHaveAttribute("aria-pressed", "false");

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(attentionButton).toHaveAttribute("aria-pressed", "false");
    expect(capitalButton).toHaveAttribute("aria-pressed", "true");
  });

  it("alternates the detached face direction by stack order", () => {
    const { container } = render(
      <StackedIsometricFeatures autoplay={false} items={items} />,
    );

    const boxes = container.querySelectorAll(
      '[data-slot="stacked-isometric-box"]',
    );

    expect(boxes[0]).toHaveAttribute("data-peel-direction", "left");
    expect(boxes[1]).toHaveAttribute("data-peel-direction", "right");
    expect(boxes[2]).toHaveAttribute("data-peel-direction", "left");
  });
});
