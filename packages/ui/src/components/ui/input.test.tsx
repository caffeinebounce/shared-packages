import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Input, inputVariants } from "./input";

describe("Input", () => {
  describe("rendering", () => {
    it("renders an input element", () => {
      render(<Input />);
      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    it("sets data-slot attribute", () => {
      render(<Input data-testid="input" />);
      expect(screen.getByTestId("input")).toHaveAttribute("data-slot", "input");
    });

    it("applies custom className", () => {
      render(<Input data-testid="input" className="custom-class" />);
      expect(screen.getByTestId("input")).toHaveClass("custom-class");
    });
  });

  describe("type prop", () => {
    it("renders without type attribute by default", () => {
      render(<Input data-testid="input" />);
      // When no type is specified, the input has no type attribute (defaults to "text" in browser)
      expect(screen.getByTestId("input")).not.toHaveAttribute("type");
    });

    it("renders email input", () => {
      render(<Input type="email" data-testid="input" />);
      expect(screen.getByTestId("input")).toHaveAttribute("type", "email");
    });

    it("renders password input", () => {
      render(<Input type="password" data-testid="input" />);
      expect(screen.getByTestId("input")).toHaveAttribute("type", "password");
    });

    it("renders number input", () => {
      render(<Input type="number" data-testid="input" />);
      expect(screen.getByTestId("input")).toHaveAttribute("type", "number");
    });
  });

  describe("variant prop", () => {
    it("applies default variant", () => {
      render(<Input data-testid="input" variant="default" />);
      const input = screen.getByTestId("input");
      expect(input).toHaveClass("border");
      expect(input).toHaveClass("rounded-box");
    });

    it("applies filled variant", () => {
      render(<Input data-testid="input" variant="filled" />);
      const input = screen.getByTestId("input");
      expect(input).toHaveClass("bg-muted/50");
      expect(input).toHaveClass("border-0");
    });

    it("applies underline variant", () => {
      render(<Input data-testid="input" variant="underline" />);
      const input = screen.getByTestId("input");
      expect(input).toHaveClass("border-b-2");
      expect(input).toHaveClass("rounded-none");
    });

    it("defaults to default variant", () => {
      render(<Input data-testid="input" />);
      const input = screen.getByTestId("input");
      expect(input).toHaveClass("rounded-box");
      expect(input).toHaveClass("shadow-xs");
    });
  });

  describe("accessibility", () => {
    it("supports aria-invalid", () => {
      render(<Input data-testid="input" aria-invalid="true" />);
      expect(screen.getByTestId("input")).toHaveAttribute(
        "aria-invalid",
        "true",
      );
    });

    it("supports disabled state", () => {
      render(<Input data-testid="input" disabled />);
      expect(screen.getByTestId("input")).toBeDisabled();
    });

    it("supports placeholder", () => {
      render(<Input placeholder="Enter text..." />);
      expect(screen.getByPlaceholderText("Enter text...")).toBeInTheDocument();
    });
  });

  describe("inputVariants function", () => {
    it("returns correct classes for default variant", () => {
      const classes = inputVariants({ variant: "default" });
      expect(classes).toContain("rounded-box");
      expect(classes).toContain("border");
    });

    it("returns correct classes for filled variant", () => {
      const classes = inputVariants({ variant: "filled" });
      expect(classes).toContain("bg-muted/50");
      expect(classes).toContain("border-0");
    });

    it("returns correct classes for underline variant", () => {
      const classes = inputVariants({ variant: "underline" });
      expect(classes).toContain("border-b-2");
      expect(classes).toContain("rounded-none");
    });

    it("applies custom className", () => {
      const classes = inputVariants({
        variant: "default",
        className: "my-custom-class",
      });
      expect(classes).toContain("my-custom-class");
    });
  });
});
