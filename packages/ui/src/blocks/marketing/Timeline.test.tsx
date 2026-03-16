import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Timeline } from "./Timeline";

describe("Timeline", () => {
  it("renders provided periods and optional content", () => {
    render(
      <Timeline
        items={[
          {
            period: "2008-2012",
            logo: <span>Logo</span>,
            title: "West Point",
            subtitle: "United States Military Academy",
            description:
              "Foundation in discipline, leadership, and mission-led execution.",
          },
        ]}
      />,
    );

    expect(screen.getByText("2008-2012")).toBeInTheDocument();
    expect(screen.getByText("Logo")).toBeInTheDocument();
    expect(screen.getByText("West Point")).toBeInTheDocument();
    expect(
      screen.getByText("United States Military Academy"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Foundation in discipline, leadership, and mission-led execution.",
      ),
    ).toBeInTheDocument();
  });

  it("falls back to zero-padded sequence labels when period is absent", () => {
    render(
      <Timeline
        items={[
          { title: "West Point" },
          { title: "Procter & Gamble" },
          { title: "Factory" },
        ]}
      />,
    );

    expect(screen.getByText("01")).toBeInTheDocument();
    expect(screen.getByText("02")).toBeInTheDocument();
    expect(screen.getByText("03")).toBeInTheDocument();
  });

  it("preserves custom className and dotClassName overrides", () => {
    const { container } = render(
      <Timeline
        className="timeline-shell"
        dotClassName="bg-[#FF4628]"
        items={[{ title: "West Point" }, { title: "Factory" }]}
      />,
    );

    const timelineRoot = container.querySelector('[data-slot="timeline"]');
    const accentDot = container.querySelector(
      '[data-slot="timeline-accent-dot"]',
    );
    const accentRule = container.querySelector(
      '[data-slot="timeline-accent-rule"]',
    );

    expect(timelineRoot).toHaveClass("timeline-shell");
    expect(accentDot).toHaveClass("bg-[#FF4628]");
    expect(accentRule).toHaveClass("bg-[#FF4628]");
  });

  it("renders the correct connector count when descriptions are mixed", () => {
    const { container } = render(
      <Timeline
        items={[
          {
            title: "West Point",
            subtitle: "United States Military Academy",
          },
          {
            title: "Procter & Gamble",
            description: "Brand management foundation.",
          },
          {
            title: "Factory",
          },
        ]}
      />,
    );

    const cards = container.querySelectorAll('[data-slot="timeline-card"]');
    const connectors = container.querySelectorAll(
      '[data-slot="timeline-connector"]',
    );

    expect(cards).toHaveLength(3);
    expect(connectors).toHaveLength(2);
    expect(
      screen.getByText("Brand management foundation."),
    ).toBeInTheDocument();
  });
});
