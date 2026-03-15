import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DisclosureFootnotes } from "./DisclosureFootnotes";

const disclosures = [
  { id: "one", text: "First disclosure copy." },
  { id: "two", text: "Second disclosure copy." },
  { id: "three", text: "Third disclosure copy." },
  { id: "four", text: "Fourth disclosure copy." },
];

describe("DisclosureFootnotes", () => {
  it("shows compact inline disclosures with a show-all action", () => {
    render(<DisclosureFootnotes disclosures={disclosures} variant="compact" />);

    expect(screen.getByText("First disclosure copy.")).toBeInTheDocument();
    expect(screen.getByText("Second disclosure copy.")).toBeInTheDocument();
    expect(screen.getByText("Third disclosure copy.")).toBeInTheDocument();
    expect(
      screen.queryByText("Fourth disclosure copy."),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Show all disclosures (4)" }),
    ).toBeInTheDocument();
  });

  it("expands the mobile tray when requested", () => {
    const { container } = render(
      <DisclosureFootnotes
        disclosures={disclosures}
        variant="compact"
        mobileBehavior="tray"
      />,
    );

    const trigger = screen.getByRole("button", {
      name: /Important Disclosures/i,
    });

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(
      container.querySelector('[data-slot="disclosure-inline-panel"]'),
    ).toBeInTheDocument();

    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Fourth disclosure copy.")).toBeInTheDocument();
  });
});
