import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TextHighlight } from "./text-highlight";

describe("TextHighlight", () => {
  describe("rendering", () => {
    it("renders children correctly", () => {
      render(<TextHighlight>highlighted text</TextHighlight>);
      expect(screen.getByText("highlighted text")).toBeInTheDocument();
    });

    it("renders as a span element", () => {
      const { container } = render(
        <TextHighlight>highlighted text</TextHighlight>,
      );
      const span = container.querySelector("span");
      expect(span).toBeInTheDocument();
      expect(span).toHaveAttribute("data-slot", "text-highlight");
    });
  });

  describe("gradient customization", () => {
    it("applies default gradient classes", () => {
      const { container } = render(
        <TextHighlight>highlighted text</TextHighlight>,
      );
      const span = container.querySelector("span");
      expect(span).toHaveClass("from-indigo-300");
      expect(span).toHaveClass("to-purple-300");
    });

    it("applies custom gradient classes", () => {
      const { container } = render(
        <TextHighlight gradient="from-emerald-300 to-teal-300">
          highlighted text
        </TextHighlight>,
      );
      const span = container.querySelector("span");
      expect(span).toHaveClass("from-emerald-300");
      expect(span).toHaveClass("to-teal-300");
    });
  });

  describe("animation behavior", () => {
    it("applies animation class by default", () => {
      const { container } = render(
        <TextHighlight>highlighted text</TextHighlight>,
      );
      const span = container.querySelector("span");
      expect(span).toHaveClass("text-highlight-animated");
      expect(span).toHaveAttribute("data-animated", "true");
    });

    it("sets custom duration and delay via CSS custom properties", () => {
      const { container } = render(
        <TextHighlight duration={3} delay={1}>
          highlighted text
        </TextHighlight>,
      );
      const span = container.querySelector("span");
      expect(span).toHaveStyle({ "--highlight-duration": "3s" });
      expect(span).toHaveStyle({ "--highlight-delay": "1s" });
    });

    it("uses default duration and delay when not specified", () => {
      const { container } = render(
        <TextHighlight>highlighted text</TextHighlight>,
      );
      const span = container.querySelector("span");
      expect(span).toHaveStyle({ "--highlight-duration": "2s" });
      expect(span).toHaveStyle({ "--highlight-delay": "0.5s" });
    });
  });

  describe("disabled animation", () => {
    it("removes animation class when disableAnimation is true", () => {
      const { container } = render(
        <TextHighlight disableAnimation>highlighted text</TextHighlight>,
      );
      const span = container.querySelector("span");
      expect(span).not.toHaveClass("text-highlight-animated");
      expect(span).toHaveAttribute("data-animated", "false");
    });

    it("shows full highlight immediately when animation is disabled", () => {
      const { container } = render(
        <TextHighlight disableAnimation>highlighted text</TextHighlight>,
      );
      const span = container.querySelector("span");
      expect(span).toHaveStyle({ backgroundSize: "100% 100%" });
    });
  });

  describe("custom styling", () => {
    it("applies custom className", () => {
      const { container } = render(
        <TextHighlight className="custom-class">
          highlighted text
        </TextHighlight>,
      );
      const span = container.querySelector("span");
      expect(span).toHaveClass("custom-class");
    });

    it("maintains base classes when custom className is added", () => {
      const { container } = render(
        <TextHighlight className="custom-class">
          highlighted text
        </TextHighlight>,
      );
      const span = container.querySelector("span");
      expect(span).toHaveClass("inline-block");
      expect(span).toHaveClass("rounded-lg");
      expect(span).toHaveClass("bg-gradient-to-r");
      expect(span).toHaveClass("custom-class");
    });
  });

  describe("base styles", () => {
    it("applies required base classes", () => {
      const { container } = render(
        <TextHighlight>highlighted text</TextHighlight>,
      );
      const span = container.querySelector("span");
      expect(span).toHaveClass("relative");
      expect(span).toHaveClass("inline-block");
      expect(span).toHaveClass("rounded-lg");
      expect(span).toHaveClass("bg-gradient-to-r");
      expect(span).toHaveClass("bg-no-repeat");
      expect(span).toHaveClass("px-1");
      expect(span).toHaveClass("pb-1");
    });

    it("sets background position to left center", () => {
      const { container } = render(
        <TextHighlight>highlighted text</TextHighlight>,
      );
      const span = container.querySelector("span");
      expect(span).toHaveStyle({ backgroundPosition: "left center" });
    });
  });
});
