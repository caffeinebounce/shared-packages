import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Carousel } from "./Carousel";

const slides = [
  {
    id: "media-dinner",
    title: "Media & IP Dinner",
    description: "Private Member Convening.",
    image: { src: "/calendar/media-dinner.jpg", alt: "House blueprint" },
    badge: "July 2026",
    footer: "House Of Culture",
    ctaLabel: "Explore Component",
  },
  {
    id: "family-mixer",
    title: "Martha's Vineyard Family Mixer",
    description: "Private Member Convening.",
    image: { src: "/calendar/vineyard.jpg", alt: "Island map" },
    badge: "Aug 2026",
    footer: "Martha's Vineyard, MA",
    ctaLabel: "Explore Component",
  },
  {
    id: "mexico-salon",
    title: "Mexico City Salon",
    description: "Private Member Convening.",
    image: { src: "/calendar/mexico.jpg", alt: "City map" },
    badge: "Aug 2026",
    footer: "CDMX",
    ctaLabel: "Explore Component",
  },
];

describe("Carousel", () => {
  it("renders default slide cards with image, badge, copy, and action", () => {
    render(<Carousel ariaLabel="Event calendar" items={slides} />);

    expect(
      screen.getByRole("region", { name: "Event calendar" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "House blueprint" }),
    ).toHaveAttribute("src", "/calendar/media-dinner.jpg");
    expect(screen.getByText("July 2026")).toBeInTheDocument();
    expect(screen.getByText("Media & IP Dinner")).toBeInTheDocument();
    expect(screen.getByText("House Of Culture")).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: "Explore Component" }),
    ).toHaveLength(3);
  });

  it("supports custom item rendering with active and positional state", () => {
    render(
      <Carousel
        ariaLabel="Custom calendar"
        initialIndex={1}
        items={slides}
        renderItem={(item, { isActive, index, currentIndex }) => (
          <article data-active={isActive} data-testid={`custom-${item.id}`}>
            {item.title} {index - currentIndex}
          </article>
        )}
      />,
    );

    expect(screen.getByTestId("custom-media-dinner")).toHaveTextContent("-1");
    expect(screen.getByTestId("custom-family-mixer")).toHaveAttribute(
      "data-active",
      "true",
    );
  });

  it("moves between slides with controls and reports index changes", async () => {
    const user = userEvent.setup();
    const onIndexChange = vi.fn();

    render(
      <Carousel
        ariaLabel="Event calendar"
        items={slides}
        onIndexChange={onIndexChange}
      />,
    );

    expect(onIndexChange).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Next slide" }));
    expect(screen.getByRole("button", { name: "Slide 2" })).toHaveAttribute(
      "aria-current",
      "true",
    );
    expect(onIndexChange).toHaveBeenLastCalledWith(1, slides[1]);

    await user.click(screen.getByRole("button", { name: "Previous slide" }));
    expect(screen.getByRole("button", { name: "Slide 1" })).toHaveAttribute(
      "aria-current",
      "true",
    );
    expect(onIndexChange).toHaveBeenLastCalledWith(0, slides[0]);
  });

  it("can wrap control navigation at both ends", async () => {
    const user = userEvent.setup();

    render(<Carousel items={slides} navigationMode="wrap" />);

    await user.click(screen.getByRole("button", { name: "Previous slide" }));

    expect(screen.getByRole("button", { name: "Slide 3" })).toHaveAttribute(
      "aria-current",
      "true",
    );
  });

  it("normalizes the initial index with wrap navigation", () => {
    render(<Carousel initialIndex={-1} items={slides} navigationMode="wrap" />);

    expect(screen.getByRole("button", { name: "Slide 3" })).toHaveAttribute(
      "aria-current",
      "true",
    );
  });

  it("keeps wrap-mode index normalization after items update", () => {
    const { rerender } = render(
      <Carousel initialIndex={2} items={slides} navigationMode="wrap" />,
    );

    rerender(
      <Carousel
        initialIndex={2}
        items={slides.slice(0, 2)}
        navigationMode="wrap"
      />,
    );

    expect(screen.getByRole("button", { name: "Slide 1" })).toHaveAttribute(
      "aria-current",
      "true",
    );
  });

  it("supports keyboard navigation when the carousel is focused", async () => {
    const user = userEvent.setup();

    render(<Carousel ariaLabel="Keyboard calendar" items={slides} />);

    const carousel = screen.getByRole("region", { name: "Keyboard calendar" });
    carousel.focus();
    await user.keyboard("{ArrowRight}{End}");

    expect(screen.getByRole("button", { name: "Slide 3" })).toHaveAttribute(
      "aria-current",
      "true",
    );
  });

  it("does not handle navigation keys from editable slide content", async () => {
    const user = userEvent.setup();

    render(
      <Carousel
        items={slides}
        renderItem={() => <input aria-label="Slide field" defaultValue="A" />}
      />,
    );

    await user.click(screen.getAllByLabelText("Slide field")[0]);
    await user.keyboard("{ArrowRight}");

    expect(screen.getByRole("button", { name: "Slide 1" })).toHaveAttribute(
      "aria-current",
      "true",
    );
  });

  it("reports previous and next render context across wrap boundaries", () => {
    render(
      <Carousel
        items={slides}
        navigationMode="wrap"
        renderItem={(item, { isPrevious, isNext }) => (
          <article
            data-next={isNext}
            data-previous={isPrevious}
            data-testid={`context-${item.id}`}
          >
            {item.title}
          </article>
        )}
      />,
    );

    expect(screen.getByTestId("context-mexico-salon")).toHaveAttribute(
      "data-previous",
      "true",
    );
    expect(screen.getByTestId("context-family-mixer")).toHaveAttribute(
      "data-next",
      "true",
    );
  });

  it("exposes layout class hooks for custom visual treatments", () => {
    render(
      <Carousel
        className="calendar-shell"
        controlsClassName="calendar-controls"
        itemClassName="calendar-slide"
        items={slides}
        progressClassName="calendar-progress"
        trackClassName="calendar-track"
        viewportClassName="calendar-viewport"
      />,
    );

    expect(screen.getByRole("region", { name: "Carousel" })).toHaveClass(
      "calendar-shell",
    );
    expect(
      document.querySelector('[data-slot="carousel-controls"]'),
    ).toHaveClass("calendar-controls");
    expect(document.querySelector('[data-slot="carousel-item"]')).toHaveClass(
      "calendar-slide",
    );
    expect(
      document.querySelector('[data-slot="carousel-progress"]'),
    ).toHaveClass("calendar-progress");
    expect(document.querySelector('[data-slot="carousel-track"]')).toHaveClass(
      "calendar-track",
    );
    expect(
      document.querySelector('[data-slot="carousel-viewport"]'),
    ).toHaveClass("calendar-viewport");
  });

  it("renders a configurable empty state", () => {
    render(<Carousel emptyState={<p>No upcoming events.</p>} items={[]} />);

    expect(screen.getByText("No upcoming events.")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Next slide" }),
    ).not.toBeInTheDocument();
  });
});
