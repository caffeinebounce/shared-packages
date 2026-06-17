import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { NonprofitFooterPreset } from "./NonprofitFooterPreset";

describe("NonprofitFooterPreset", () => {
  it("renders support and legal link groups plus newsletter CTA", () => {
    render(
      <NonprofitFooterPreset
        logo={<span>The Capital Collective</span>}
        tagline="Breaking through the missing middle."
        supportLinks={[
          { href: "/partners", label: "Partners" },
          { href: "/funders", label: "Funders" },
        ]}
        legalLinks={[
          { href: "/privacy", label: "Privacy" },
          { href: "/terms", label: "Terms" },
        ]}
        newsletter={{
          buttonText: "Join the newsletter",
          placeholder: "Email address",
        }}
        copyright="© 2026 The Capital Collective"
      />,
    );

    expect(screen.getByText("Support")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Partners" })).toHaveAttribute(
      "href",
      "/partners",
    );
    expect(screen.getByRole("link", { name: "Funders" })).toHaveAttribute(
      "href",
      "/funders",
    );
    expect(screen.getByText("Legal")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Privacy" })).toHaveAttribute(
      "href",
      "/privacy",
    );
    expect(screen.getByRole("link", { name: "Terms" })).toHaveAttribute(
      "href",
      "/terms",
    );
    expect(screen.getByPlaceholderText("Email address")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Join the newsletter" }),
    ).toBeInTheDocument();
  });
});
