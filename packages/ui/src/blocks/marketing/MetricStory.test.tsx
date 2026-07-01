import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MetricStory } from "./MetricStory";

describe("MetricStory", () => {
  it("renders the metric, narrative, and source note", () => {
    render(
      <MetricStory
        metric="84%"
        label="founders completed the program"
        description="A concise proof block for impact storytelling."
        sourceNote="Source: FY2025 annual report"
      />,
    );

    expect(screen.getByText("84%")).toBeInTheDocument();
    expect(
      screen.getByText("founders completed the program"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("A concise proof block for impact storytelling."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Source: FY2025 annual report"),
    ).toBeInTheDocument();
  });
});
