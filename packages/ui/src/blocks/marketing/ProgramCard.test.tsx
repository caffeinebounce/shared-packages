import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProgramCard } from "./ProgramCard";

describe("ProgramCard", () => {
  it("renders program summary, outcomes, and CTA", () => {
    render(
      <ProgramCard
        name="Beyond the Middle"
        audience="Growth-stage founders"
        commitment="12 weeks"
        outcomes={["Capital readiness", "Strategic network access"]}
        cta={{ href: "/programs/beyond-the-middle", label: "Explore program" }}
        badge="Flagship"
      />,
    );

    expect(screen.getByText("Flagship")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Beyond the Middle" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Growth-stage founders")).toBeInTheDocument();
    expect(screen.getByText("12 weeks")).toBeInTheDocument();
    expect(screen.getByText("Capital readiness")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Explore program" }),
    ).toHaveAttribute("href", "/programs/beyond-the-middle");
  });
});
