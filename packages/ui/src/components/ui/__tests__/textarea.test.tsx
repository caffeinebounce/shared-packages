import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Textarea } from "../textarea";

describe("Textarea", () => {
  it("renders a textarea element", () => {
    render(<Textarea />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("sets data-slot attribute", () => {
    render(<Textarea data-testid="textarea" />);
    expect(screen.getByTestId("textarea")).toHaveAttribute(
      "data-slot",
      "textarea",
    );
  });

  it("applies wrapping + sizing guard classes to prevent layout overflow", () => {
    render(<Textarea data-testid="textarea" />);
    const textarea = screen.getByTestId("textarea");
    const className = textarea.getAttribute("class") ?? "";

    expect(className).toContain("min-w-0");
    expect(className).toContain("max-w-full");
    expect(className).toContain("[overflow-wrap:anywhere]");
    expect(className).toContain("rounded-box");
  });

  it("applies custom className", () => {
    render(<Textarea data-testid="textarea" className="custom-class" />);
    expect(screen.getByTestId("textarea")).toHaveClass("custom-class");
  });
});
