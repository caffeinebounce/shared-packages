import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Badge, badgeVariants } from "./badge";

describe("Badge", () => {
  describe("rendering", () => {
    it("renders children correctly", () => {
      render(<Badge>New</Badge>);
      expect(screen.getByText("New")).toBeInTheDocument();
    });

    it("sets data-slot attribute", () => {
      render(<Badge data-testid="badge">Test</Badge>);
      expect(screen.getByTestId("badge")).toHaveAttribute("data-slot", "badge");
    });
  });

  describe("variant prop", () => {
    it("applies default variant", () => {
      render(
        <Badge data-testid="badge" variant="default">
          Default
        </Badge>,
      );
      expect(screen.getByTestId("badge")).toHaveClass("bg-primary");
    });

    it("applies secondary variant", () => {
      render(
        <Badge data-testid="badge" variant="secondary">
          Secondary
        </Badge>,
      );
      expect(screen.getByTestId("badge")).toHaveClass("bg-secondary");
    });

    it("applies destructive variant", () => {
      render(
        <Badge data-testid="badge" variant="destructive">
          Error
        </Badge>,
      );
      expect(screen.getByTestId("badge")).toHaveClass("bg-destructive");
    });

    it("applies outline variant", () => {
      render(
        <Badge data-testid="badge" variant="outline">
          Outline
        </Badge>,
      );
      expect(screen.getByTestId("badge")).toHaveClass("text-foreground");
    });

    it("applies success variant", () => {
      render(
        <Badge data-testid="badge" variant="success">
          Success
        </Badge>,
      );
      expect(screen.getByTestId("badge")).toHaveClass("bg-green-100");
    });

    it("applies warning variant", () => {
      render(
        <Badge data-testid="badge" variant="warning">
          Warning
        </Badge>,
      );
      expect(screen.getByTestId("badge")).toHaveClass("bg-amber-100");
    });

    it("applies muted variant", () => {
      render(
        <Badge data-testid="badge" variant="muted">
          Muted
        </Badge>,
      );
      expect(screen.getByTestId("badge")).toHaveClass("bg-muted");
    });
  });

  describe("shape prop", () => {
    it("applies pill shape (default)", () => {
      render(
        <Badge data-testid="badge" shape="pill">
          Pill
        </Badge>,
      );
      expect(screen.getByTestId("badge")).toHaveClass("rounded-full");
    });

    it("applies rounded shape", () => {
      render(
        <Badge data-testid="badge" shape="rounded">
          Rounded
        </Badge>,
      );
      expect(screen.getByTestId("badge")).toHaveClass("rounded-md");
    });

    it("applies square shape", () => {
      render(
        <Badge data-testid="badge" shape="square">
          Square
        </Badge>,
      );
      expect(screen.getByTestId("badge")).toHaveClass("rounded-none");
    });

    it("defaults to pill shape", () => {
      render(<Badge data-testid="badge">Default</Badge>);
      expect(screen.getByTestId("badge")).toHaveClass("rounded-full");
    });
  });

  describe("size prop", () => {
    it("applies small size", () => {
      render(
        <Badge data-testid="badge" size="sm">
          Small
        </Badge>,
      );
      expect(screen.getByTestId("badge")).toHaveClass("px-1");
    });

    it("applies default size", () => {
      render(
        <Badge data-testid="badge" size="default">
          Default
        </Badge>,
      );
      expect(screen.getByTestId("badge")).toHaveClass("px-1.5");
    });

    it("applies large size", () => {
      render(
        <Badge data-testid="badge" size="lg">
          Large
        </Badge>,
      );
      expect(screen.getByTestId("badge")).toHaveClass("px-2");
      expect(screen.getByTestId("badge")).toHaveClass("py-0.5");
    });
  });

  describe("combined variants", () => {
    it("applies variant, shape, and size together", () => {
      render(
        <Badge data-testid="badge" variant="success" shape="rounded" size="lg">
          Active
        </Badge>,
      );
      const badge = screen.getByTestId("badge");
      expect(badge).toHaveClass("bg-green-100");
      expect(badge).toHaveClass("rounded-md");
      expect(badge).toHaveClass("px-2");
    });

    it("applies destructive + square + small", () => {
      render(
        <Badge
          data-testid="badge"
          variant="destructive"
          shape="square"
          size="sm"
        >
          Error
        </Badge>,
      );
      const badge = screen.getByTestId("badge");
      expect(badge).toHaveClass("bg-destructive");
      expect(badge).toHaveClass("rounded-none");
      expect(badge).toHaveClass("px-1");
    });
  });

  describe("badgeVariants function", () => {
    it("returns correct classes for variant", () => {
      const classes = badgeVariants({ variant: "success" });
      expect(classes).toContain("bg-green-100");
    });

    it("returns correct classes for shape", () => {
      const classes = badgeVariants({ shape: "square" });
      expect(classes).toContain("rounded-none");
    });

    it("returns correct classes for size", () => {
      const classes = badgeVariants({ size: "lg" });
      expect(classes).toContain("px-2");
    });

    it("combines all variants", () => {
      const classes = badgeVariants({
        variant: "warning",
        shape: "rounded",
        size: "sm",
      });
      expect(classes).toContain("bg-amber-100");
      expect(classes).toContain("rounded-md");
      expect(classes).toContain("px-1");
    });
  });
});
