import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ContactConfirmationTemplate } from "./ContactConfirmationTemplate";

describe("ContactConfirmationTemplate", () => {
  it("renders response expectations and next-step links", () => {
    render(
      <ContactConfirmationTemplate
        brand={{
          name: "Capital Collective",
          companyName: "The Capital Collective",
        }}
        responseWindowText="A member of our team will follow up within 2 business days."
        nextSteps={[
          {
            href: "https://thecapitalcollective.org/programs",
            label: "Explore programs",
          },
        ]}
      />,
    );

    expect(screen.getByText("We received your message")).toBeInTheDocument();
    expect(
      screen.getByText(
        "A member of our team will follow up within 2 business days.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Explore programs" }),
    ).toHaveAttribute("href", "https://thecapitalcollective.org/programs");
  });
});
