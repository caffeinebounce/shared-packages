import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PartnerLogoGrid } from "./PartnerLogoGrid";

describe("PartnerLogoGrid", () => {
  it("renders categorized partner groups", () => {
    render(
      <PartnerLogoGrid
        groups={[
          {
            title: "Funders",
            items: [{ name: "Goldman Sachs" }, { name: "JPMC" }],
          },
          {
            title: "Community",
            items: [{ name: "Birmingham Hub" }],
          },
        ]}
      />,
    );

    expect(screen.getByText("Funders")).toBeInTheDocument();
    expect(screen.getByText("Goldman Sachs")).toBeInTheDocument();
    expect(screen.getByText("JPMC")).toBeInTheDocument();
    expect(screen.getByText("Community")).toBeInTheDocument();
    expect(screen.getByText("Birmingham Hub")).toBeInTheDocument();
  });
});
