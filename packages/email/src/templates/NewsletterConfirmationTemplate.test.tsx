import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { NewsletterConfirmationTemplate } from "./NewsletterConfirmationTemplate";

describe("NewsletterConfirmationTemplate", () => {
  it("renders confirmation copy, CTA, and fallback link", () => {
    render(
      <NewsletterConfirmationTemplate
        confirmationLink="https://thecapitalcollective.org/newsletter/confirm?token=abc"
        unsubscribeLink="https://thecapitalcollective.org/unsubscribe"
        brand={{
          name: "Capital Collective",
          companyName: "The Capital Collective",
        }}
      />,
    );

    expect(
      screen.getByText("Confirm your newsletter subscription"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Confirm subscription" }),
    ).toHaveAttribute(
      "href",
      "https://thecapitalcollective.org/newsletter/confirm?token=abc",
    );
    expect(
      screen.getByText(/If the button doesn't work, copy and paste this link:/),
    ).toBeInTheDocument();
  });
});
