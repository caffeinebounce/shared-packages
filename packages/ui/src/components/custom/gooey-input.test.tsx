import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";

import { GooeyInput } from "./gooey-input";

function ControlledGooeyInput({
  onValueChange,
}: {
  onValueChange: (value: string) => void;
}) {
  const [value, setValue] = React.useState("");

  return (
    <GooeyInput
      aria-label="Search team"
      onValueChange={(nextValue) => {
        setValue(nextValue);
        onValueChange(nextValue);
      }}
      value={value}
    />
  );
}

describe("GooeyInput", () => {
  it("renders an accessible search input with the default placeholder", () => {
    render(<GooeyInput aria-label="Search" />);

    const input = screen.getByLabelText("Search");

    expect(input).toHaveAttribute("type", "search");
    expect(input).toHaveAttribute("placeholder", "Type to search...");
  });

  it("supports controlled value changes", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(<ControlledGooeyInput onValueChange={onValueChange} />);

    await user.type(screen.getByLabelText("Search team"), "keenan");

    expect(onValueChange).toHaveBeenLastCalledWith("keenan");
  });

  it("announces open state changes when focused", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(<GooeyInput aria-label="Search" onOpenChange={onOpenChange} />);

    await user.click(screen.getByLabelText("Search"));

    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it("keeps one crisp bordered surface instead of boxing the trigger", () => {
    const { container } = render(<GooeyInput aria-label="Search" />);

    expect(
      container.querySelector('[data-slot="gooey-input-surface"]'),
    ).toHaveClass("border", "border-input");
    expect(screen.getByRole("button", { name: "Open search" })).not.toHaveClass(
      "border",
    );
  });

  it("shows a persistent clear button when the field has text", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(<ControlledGooeyInput onValueChange={onValueChange} />);

    await user.type(screen.getByLabelText("Search team"), "wealth");
    await user.tab();

    const clearButton = screen.getByRole("button", { name: "Clear search" });

    expect(clearButton).toBeInTheDocument();

    await user.click(clearButton);

    expect(onValueChange).toHaveBeenLastCalledWith("");
  });
});
