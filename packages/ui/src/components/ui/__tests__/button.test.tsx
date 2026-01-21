import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button, buttonVariants } from "../button";

describe("Button", () => {
  describe("rendering", () => {
    it("renders children correctly", () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole("button")).toHaveTextContent("Click me");
    });

    it("renders loading spinner when loading", () => {
      render(<Button loading>Submit</Button>);
      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
      expect(button.querySelector("svg")).toBeInTheDocument();
    });

    it("is disabled when disabled prop is true", () => {
      render(<Button disabled>Disabled</Button>);
      expect(screen.getByRole("button")).toBeDisabled();
    });
  });

  describe("data attributes", () => {
    it("sets data-slot attribute", () => {
      render(<Button>Test</Button>);
      expect(screen.getByRole("button")).toHaveAttribute("data-slot", "button");
    });

    it("sets data-variant to default when not specified", () => {
      render(<Button>Test</Button>);
      expect(screen.getByRole("button")).toHaveAttribute(
        "data-variant",
        "default",
      );
    });

    it("sets data-variant when variant prop is provided", () => {
      render(<Button variant="destructive">Delete</Button>);
      expect(screen.getByRole("button")).toHaveAttribute(
        "data-variant",
        "destructive",
      );
    });

    it("sets data-hover-effect to slide by default", () => {
      render(<Button>Test</Button>);
      expect(screen.getByRole("button")).toHaveAttribute(
        "data-hover-effect",
        "slide",
      );
    });

    it("sets data-hover-effect when hoverEffect prop is provided", () => {
      render(<Button hoverEffect="glow">Glow</Button>);
      expect(screen.getByRole("button")).toHaveAttribute(
        "data-hover-effect",
        "glow",
      );
    });
  });

  describe("variant prop", () => {
    it("applies default variant styles", () => {
      render(<Button variant="default">Default</Button>);
      expect(screen.getByRole("button")).toHaveClass("bg-primary");
    });

    it("applies destructive variant styles", () => {
      render(<Button variant="destructive">Delete</Button>);
      expect(screen.getByRole("button")).toHaveClass("bg-destructive");
    });

    it("applies outline variant styles", () => {
      render(<Button variant="outline">Outline</Button>);
      expect(screen.getByRole("button")).toHaveClass("border");
    });

    it("applies secondary variant styles", () => {
      render(<Button variant="secondary">Secondary</Button>);
      expect(screen.getByRole("button")).toHaveClass("bg-secondary");
    });

    it("applies ghost variant styles", () => {
      render(<Button variant="ghost">Ghost</Button>);
      expect(screen.getByRole("button")).toHaveClass("hover:bg-accent");
    });

    it("applies link variant styles", () => {
      render(<Button variant="link">Link</Button>);
      expect(screen.getByRole("button")).toHaveClass("underline-offset-4");
    });
  });

  describe("size prop", () => {
    it("applies default size", () => {
      render(<Button size="default">Default</Button>);
      expect(screen.getByRole("button")).toHaveClass("h-9");
    });

    it("applies small size", () => {
      render(<Button size="sm">Small</Button>);
      expect(screen.getByRole("button")).toHaveClass("h-8");
    });

    it("applies large size", () => {
      render(<Button size="lg">Large</Button>);
      expect(screen.getByRole("button")).toHaveClass("h-10");
    });

    it("applies icon size", () => {
      render(<Button size="icon">Icon</Button>);
      expect(screen.getByRole("button")).toHaveClass("size-9");
    });
  });

  describe("corners prop", () => {
    it("applies default corners (no extra class)", () => {
      render(<Button corners="default">Default</Button>);
      const button = screen.getByRole("button");
      expect(button).not.toHaveClass("rounded-full");
      expect(button).not.toHaveClass("rounded-none");
    });

    it("applies pill corners", () => {
      render(<Button corners="pill">Pill</Button>);
      expect(screen.getByRole("button")).toHaveClass("rounded-full");
    });

    it("applies sharp corners", () => {
      render(<Button corners="sharp">Sharp</Button>);
      expect(screen.getByRole("button")).toHaveClass("rounded-none");
    });
  });

  describe("hoverEffect prop", () => {
    it("applies slide effect (empty string, handled by CSS)", () => {
      render(<Button hoverEffect="slide">Slide</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("data-hover-effect", "slide");
    });

    it("applies glow effect classes", () => {
      render(<Button hoverEffect="glow">Glow</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("hover:shadow-lg");
      expect(button).toHaveClass("hover:shadow-primary/25");
    });

    it("applies scale effect classes", () => {
      render(<Button hoverEffect="scale">Scale</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("hover:scale-105");
      expect(button).toHaveClass("active:scale-95");
    });

    it("applies none effect (no extra hover classes)", () => {
      render(<Button hoverEffect="none">None</Button>);
      const button = screen.getByRole("button");
      // Should not have glow or scale classes
      expect(button).not.toHaveClass("hover:shadow-lg");
      expect(button).not.toHaveClass("hover:scale-105");
    });
  });

  describe("asChild prop", () => {
    it("renders as Slot when asChild is true", () => {
      render(
        <Button asChild>
          <a href="/test">Link Button</a>
        </Button>,
      );
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/test");
      expect(link).toHaveAttribute("data-slot", "button");
    });
  });

  describe("buttonVariants function", () => {
    it("returns correct classes for variant", () => {
      const classes = buttonVariants({ variant: "destructive" });
      expect(classes).toContain("bg-destructive");
    });

    it("returns correct classes for size", () => {
      const classes = buttonVariants({ size: "lg" });
      expect(classes).toContain("h-10");
    });

    it("returns correct classes for corners", () => {
      const classes = buttonVariants({ corners: "pill" });
      expect(classes).toContain("rounded-full");
    });

    it("combines multiple variants", () => {
      const classes = buttonVariants({
        variant: "secondary",
        size: "sm",
        corners: "sharp",
      });
      expect(classes).toContain("bg-secondary");
      expect(classes).toContain("h-8");
      expect(classes).toContain("rounded-none");
    });
  });
});
