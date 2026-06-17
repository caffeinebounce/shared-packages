import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TeamCard } from "./TeamCard";

describe("TeamCard", () => {
  it("renders team identity, bio, and profile links", () => {
    render(
      <TeamCard
        name="Jill Ford"
        title="Executive Director"
        bio="Leads program strategy and nonprofit growth."
        links={[{ href: "https://linkedin.com/in/jill", label: "LinkedIn" }]}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Jill Ford" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Executive Director")).toBeInTheDocument();
    expect(
      screen.getByText("Leads program strategy and nonprofit growth."),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "LinkedIn" })).toHaveAttribute(
      "href",
      "https://linkedin.com/in/jill",
    );
  });
});
