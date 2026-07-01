import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HeroSection } from "./HeroSection";

describe("HeroSection", () => {
  it("keeps the default centered hero API working", () => {
    const { container } = render(
      <HeroSection
        heading="Build better systems"
        subheading="A shared hero with sensible defaults."
        cta={{ href: "/start", label: "Get Started" }}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Build better systems" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("A shared hero with sensible defaults."),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Get Started" })).toHaveAttribute(
      "href",
      "/start",
    );
    expect(
      container.querySelector('[data-slot="hero-section-container"]'),
    ).toHaveClass(
      "w-full",
      "max-w-screen-xl",
      "mx-auto",
      "px-4",
      "sm:px-6",
      "lg:px-8",
      "flex-1",
      "items-center",
    );
  });

  it("supports custom media layers and bottom anchored copy", () => {
    const { container } = render(
      <HeroSection
        heading={<h1>Culture becomes capital</h1>}
        subheading={<p>Factory-specific copy can stay fully composed.</p>}
        backgroundLayer={<div aria-label="Hero media" role="img" />}
        overlay={<div data-testid="hero-overlay-wash" />}
        actions={<div data-testid="hero-actions">Actions</div>}
        className="factory-dark-media"
        containerClassName="mx-auto max-w-screen-2xl pb-24"
        contentClassName="max-w-4xl"
        contentAlignment="start"
        contentPosition="end"
        padding="sm"
      />,
    );

    expect(screen.getByLabelText("Hero media")).toBeInTheDocument();
    expect(screen.getByTestId("hero-overlay-wash")).toBeInTheDocument();
    expect(screen.getByTestId("hero-actions")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Culture becomes capital" }),
    ).toBeInTheDocument();

    expect(
      container.querySelector('[data-slot="hero-background"]'),
    ).toHaveClass("z-0");
    expect(container.querySelector('[data-slot="hero-section"]')).toHaveClass(
      "factory-dark-media",
    );
    expect(
      container.querySelector('[data-slot="hero-section-container"]'),
    ).toHaveClass(
      "flex-1",
      "items-end",
      "max-w-screen-2xl",
      "mx-auto",
      "pb-24",
    );
    expect(
      container.querySelector('[data-slot="hero-section-content"]'),
    ).toHaveClass("text-left", "max-w-4xl");
  });

  it("applies custom classes to string heading and subheading copy", () => {
    render(
      <HeroSection
        heading="Custom headline"
        subheading="Custom subheading"
        headingClassName="text-white"
        subheadingClassName="text-white/70"
        contentAlignment="start"
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Custom headline" }),
    ).toHaveClass("text-white");
    expect(screen.getByText("Custom subheading")).toHaveClass(
      "text-white/70",
      "mx-0",
    );
  });
});
