import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MarketingEmailFooter } from "./MarketingEmailFooter";

describe("MarketingEmailFooter", () => {
  it("renders social links, website CTA, and unsubscribe text", () => {
    render(
      <MarketingEmailFooter
        brand={{
          companyName: "The Capital Collective",
          baseUrl: "https://thecapitalcollective.org",
          socialLinks: {
            website: "https://thecapitalcollective.org",
            linkedin: "https://linkedin.com/company/tcc",
          },
        }}
        reasonText="You received this because you signed up for updates."
        unsubscribeLink="https://thecapitalcollective.org/unsubscribe"
      />,
    );

    expect(screen.getByText("Stay connected")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Visit website" })).toHaveAttribute(
      "href",
      "https://thecapitalcollective.org",
    );
    expect(
      screen.getByText("You received this because you signed up for updates."),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Unsubscribe" })).toHaveAttribute(
      "href",
      "https://thecapitalcollective.org/unsubscribe",
    );
  });
});
