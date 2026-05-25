import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AlternatingTimeline } from "./AlternatingTimeline";

describe("AlternatingTimeline", () => {
  it("renders timeline content, badges, meta, icons, and media", () => {
    const { container } = render(
      <AlternatingTimeline
        items={[
          {
            badge: "Capital",
            description: "Private dinner for aligned members.",
            eyebrow: "June 2026",
            icon: (
              <span aria-label="Dinner icon" role="img">
                D
              </span>
            ),
            media: <img alt="Dinner table" src="/dinner.jpg" />,
            meta: "Los Angeles",
            period: "Q2",
            title: "Private Investment Dinner",
          },
        ]}
      />,
    );

    expect(screen.getByText("Q2")).toBeInTheDocument();
    expect(screen.getByText("June 2026")).toBeInTheDocument();
    expect(screen.getByText("Capital")).toBeInTheDocument();
    expect(screen.getByText("Private Investment Dinner")).toBeInTheDocument();
    expect(
      screen.getByText("Private dinner for aligned members."),
    ).toBeInTheDocument();
    expect(screen.getByText("Los Angeles")).toBeInTheDocument();
    expect(screen.getByLabelText("Dinner icon")).toBeInTheDocument();
    expect(screen.getByAltText("Dinner table")).toBeInTheDocument();
    expect(
      container.querySelector('[data-slot="alternating-timeline"]'),
    ).toBeInTheDocument();
  });

  it("alternates item orientation by default", () => {
    const { container } = render(
      <AlternatingTimeline
        items={[
          { title: "First event" },
          { title: "Second event" },
          { title: "Third event" },
        ]}
      />,
    );

    const items = container.querySelectorAll(
      '[data-slot="alternating-timeline-item"]',
    );

    expect(items[0]).toHaveAttribute("data-orientation", "normal");
    expect(items[1]).toHaveAttribute("data-orientation", "reverse");
    expect(items[2]).toHaveAttribute("data-orientation", "normal");
  });

  it("can disable alternating orientation and accepts class overrides", () => {
    const { container } = render(
      <AlternatingTimeline
        alternate={false}
        className="timeline-shell"
        contentClassName="timeline-content"
        mediaClassName="timeline-media"
        nodeClassName="timeline-node"
        railClassName="timeline-rail"
        items={[
          {
            media: <span>Media</span>,
            title: "First event",
          },
          {
            media: <span>More media</span>,
            title: "Second event",
          },
        ]}
      />,
    );

    const root = container.querySelector('[data-slot="alternating-timeline"]');
    const items = container.querySelectorAll(
      '[data-slot="alternating-timeline-item"]',
    );

    expect(root).toHaveClass("timeline-shell");
    expect(items[0]).toHaveAttribute("data-orientation", "normal");
    expect(items[1]).toHaveAttribute("data-orientation", "normal");
    expect(
      container.querySelector('[data-slot="alternating-timeline-content"]'),
    ).toHaveClass("timeline-content");
    expect(
      container.querySelector('[data-slot="alternating-timeline-media"]'),
    ).toHaveClass("timeline-media");
    expect(
      container.querySelector('[data-slot="alternating-timeline-node"]'),
    ).toHaveClass("timeline-node");
    expect(
      container.querySelector('[data-slot="alternating-timeline-rail"]'),
    ).toHaveClass("timeline-rail");
  });
});
