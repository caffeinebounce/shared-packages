import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  cardVariants,
} from "./card";

describe("Card", () => {
  describe("rendering", () => {
    it("renders children correctly", () => {
      render(<Card>Card content</Card>);
      expect(screen.getByText("Card content")).toBeInTheDocument();
    });

    it("sets data-slot attribute", () => {
      render(<Card data-testid="card">Content</Card>);
      expect(screen.getByTestId("card")).toHaveAttribute("data-slot", "card");
    });

    it("uses the shared box radius by default", () => {
      render(<Card data-testid="card">Content</Card>);
      expect(screen.getByTestId("card")).toHaveClass("rounded-box");
    });
  });

  describe("elevation prop", () => {
    it("applies flat elevation (no shadow)", () => {
      render(
        <Card data-testid="card" elevation="flat">
          Flat
        </Card>,
      );
      expect(screen.getByTestId("card")).toHaveClass("shadow-none");
    });

    it("applies raised elevation (default)", () => {
      render(
        <Card data-testid="card" elevation="raised">
          Raised
        </Card>,
      );
      expect(screen.getByTestId("card")).toHaveClass("shadow-sm");
    });

    it("applies floating elevation", () => {
      render(
        <Card data-testid="card" elevation="floating">
          Floating
        </Card>,
      );
      expect(screen.getByTestId("card")).toHaveClass("shadow-lg");
    });

    it("defaults to raised elevation", () => {
      render(<Card data-testid="card">Default</Card>);
      expect(screen.getByTestId("card")).toHaveClass("shadow-sm");
    });
  });

  describe("border prop", () => {
    it("applies default border", () => {
      render(
        <Card data-testid="card" border="default">
          Default border
        </Card>,
      );
      expect(screen.getByTestId("card")).toHaveClass("border");
    });

    it("applies subtle border", () => {
      render(
        <Card data-testid="card" border="subtle">
          Subtle border
        </Card>,
      );
      expect(screen.getByTestId("card")).toHaveClass("border-border/50");
    });

    it("applies no border", () => {
      render(
        <Card data-testid="card" border="none">
          No border
        </Card>,
      );
      expect(screen.getByTestId("card")).toHaveClass("border-0");
    });
  });

  describe("combined variants", () => {
    it("applies floating elevation with no border", () => {
      render(
        <Card data-testid="card" elevation="floating" border="none">
          Floating borderless
        </Card>,
      );
      const card = screen.getByTestId("card");
      expect(card).toHaveClass("shadow-lg");
      expect(card).toHaveClass("border-0");
    });

    it("applies flat elevation with subtle border", () => {
      render(
        <Card data-testid="card" elevation="flat" border="subtle">
          Flat subtle
        </Card>,
      );
      const card = screen.getByTestId("card");
      expect(card).toHaveClass("shadow-none");
      expect(card).toHaveClass("border-border/50");
    });
  });

  describe("cardVariants function", () => {
    it("returns correct classes for elevation", () => {
      const classes = cardVariants({ elevation: "floating" });
      expect(classes).toContain("shadow-lg");
    });

    it("returns correct classes for border", () => {
      const classes = cardVariants({ border: "none" });
      expect(classes).toContain("border-0");
    });

    it("combines elevation and border", () => {
      const classes = cardVariants({
        elevation: "flat",
        border: "subtle",
      });
      expect(classes).toContain("shadow-none");
      expect(classes).toContain("border-border/50");
    });
  });
});

describe("CardHeader", () => {
  it("renders children correctly", () => {
    render(<CardHeader>Header content</CardHeader>);
    expect(screen.getByText("Header content")).toBeInTheDocument();
  });

  it("sets data-slot attribute", () => {
    render(<CardHeader data-testid="header">Header</CardHeader>);
    expect(screen.getByTestId("header")).toHaveAttribute(
      "data-slot",
      "card-header",
    );
  });
});

describe("CardTitle", () => {
  it("renders children correctly", () => {
    render(<CardTitle>My Title</CardTitle>);
    expect(screen.getByText("My Title")).toBeInTheDocument();
  });

  it("sets data-slot attribute", () => {
    render(<CardTitle data-testid="title">Title</CardTitle>);
    expect(screen.getByTestId("title")).toHaveAttribute(
      "data-slot",
      "card-title",
    );
  });

  it("applies font styling", () => {
    render(<CardTitle data-testid="title">Title</CardTitle>);
    expect(screen.getByTestId("title")).toHaveClass("font-semibold");
  });
});

describe("CardDescription", () => {
  it("renders children correctly", () => {
    render(<CardDescription>Description text</CardDescription>);
    expect(screen.getByText("Description text")).toBeInTheDocument();
  });

  it("sets data-slot attribute", () => {
    render(<CardDescription data-testid="desc">Desc</CardDescription>);
    expect(screen.getByTestId("desc")).toHaveAttribute(
      "data-slot",
      "card-description",
    );
  });

  it("applies muted styling", () => {
    render(<CardDescription data-testid="desc">Desc</CardDescription>);
    expect(screen.getByTestId("desc")).toHaveClass("text-muted-foreground");
  });
});

describe("CardAction", () => {
  it("renders children correctly", () => {
    render(<CardAction>Action</CardAction>);
    expect(screen.getByText("Action")).toBeInTheDocument();
  });

  it("sets data-slot attribute", () => {
    render(<CardAction data-testid="action">Action</CardAction>);
    expect(screen.getByTestId("action")).toHaveAttribute(
      "data-slot",
      "card-action",
    );
  });
});

describe("CardContent", () => {
  it("renders children correctly", () => {
    render(<CardContent>Content here</CardContent>);
    expect(screen.getByText("Content here")).toBeInTheDocument();
  });

  it("sets data-slot attribute", () => {
    render(<CardContent data-testid="content">Content</CardContent>);
    expect(screen.getByTestId("content")).toHaveAttribute(
      "data-slot",
      "card-content",
    );
  });

  it("applies padding", () => {
    render(<CardContent data-testid="content">Content</CardContent>);
    expect(screen.getByTestId("content")).toHaveClass("px-6");
  });
});

describe("CardFooter", () => {
  it("renders children correctly", () => {
    render(<CardFooter>Footer content</CardFooter>);
    expect(screen.getByText("Footer content")).toBeInTheDocument();
  });

  it("sets data-slot attribute", () => {
    render(<CardFooter data-testid="footer">Footer</CardFooter>);
    expect(screen.getByTestId("footer")).toHaveAttribute(
      "data-slot",
      "card-footer",
    );
  });

  it("applies flex styling", () => {
    render(<CardFooter data-testid="footer">Footer</CardFooter>);
    expect(screen.getByTestId("footer")).toHaveClass("flex");
  });
});
