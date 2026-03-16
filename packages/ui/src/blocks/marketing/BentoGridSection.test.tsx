import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BentoGridSection } from "./BentoGridSection";

describe("BentoGridSection", () => {
  it("renders all items", () => {
    render(
      <BentoGridSection
        heading="Feature grid"
        items={[
          { id: "a", title: "Fast", description: "Quick setup" },
          { id: "b", title: "Safe", description: "Typed API" },
        ]}
      />,
    );

    expect(screen.getByText("Feature grid")).toBeInTheDocument();
    expect(screen.getByText("Fast")).toBeInTheDocument();
    expect(screen.getByText("Safe")).toBeInTheDocument();
  });
});
