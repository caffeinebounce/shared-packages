import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FaqAccordion } from "./FaqAccordion";

describe("FaqAccordion", () => {
  it("reveals answers when an item is expanded", () => {
    render(
      <FaqAccordion
        items={[
          {
            id: "eligibility",
            question: "Who is this program for?",
            answer:
              "Established small businesses preparing for growth capital.",
          },
        ]}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Who is this program for?" }),
    );

    expect(
      screen.getByText(
        "Established small businesses preparing for growth capital.",
      ),
    ).toBeInTheDocument();
  });
});
