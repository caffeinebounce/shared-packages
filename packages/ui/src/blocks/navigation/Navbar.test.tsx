import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useReducedMotion } from "motion/react";

import { useScrollDirection } from "../../hooks/useScrollDirection";
import { Navbar } from "./Navbar";

vi.mock("motion/react", () => ({
  useReducedMotion: vi.fn(() => false),
}));

vi.mock("../../hooks/useScrollDirection", () => ({
  useScrollDirection: vi.fn(() => ({
    direction: "up",
    isAtTop: true,
  })),
}));

function TestLink({
  href,
  className,
  children,
  onClick,
}: {
  href: string;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <a href={href} className={className} onClick={onClick}>
      {children}
    </a>
  );
}

afterEach(() => {
  vi.mocked(useReducedMotion).mockReturnValue(false);
  vi.mocked(useScrollDirection).mockReturnValue({
    direction: "up",
    isAtTop: true,
  });
  document.body.style.overflow = "";
  document.documentElement.style.overflow = "";
});

describe("Navbar", () => {
  it("defaults to the default preset without keenan chrome", () => {
    render(
      <Navbar
        logo={<span>Logo</span>}
        links={[{ href: "/about", label: "About" }]}
        LinkComponent={TestLink}
      />,
    );

    const header = screen.getByRole("banner");
    expect(header).toHaveAttribute("data-preset", "default");
    expect(header).not.toHaveClass("bg-black/65");
    expect(header).not.toHaveClass("shadow-[0_18px_48px_rgba(0,0,0,0.45)]");
  });

  it("uses the animated default mobile toggle and updates its state on click", () => {
    const { container } = render(
      <Navbar
        logo={<span>Logo</span>}
        links={[{ href: "/about", label: "About" }]}
        LinkComponent={TestLink}
      />,
    );

    const menuButton = screen.getByRole("button", { name: "Open menu" });
    const toggleIcon = container.querySelector(
      '[data-slot="navbar-mobile-menu-icon"]',
    );

    expect(menuButton).toHaveAttribute("data-state", "closed");
    expect(toggleIcon).toHaveAttribute("data-state", "closed");

    fireEvent.click(menuButton);

    expect(screen.getByRole("button", { name: "Close menu" })).toHaveAttribute(
      "data-state",
      "open",
    );
    expect(toggleIcon).toHaveAttribute("data-state", "open");
  });

  it("uses custom mobile icons as an escape hatch", () => {
    const { container } = render(
      <Navbar
        logo={<span>Logo</span>}
        links={[{ href: "/about", label: "About" }]}
        LinkComponent={TestLink}
        mobileMenuClosedIcon={<span data-testid="custom-closed-icon">Open</span>}
        mobileMenuOpenIcon={<span data-testid="custom-open-icon">Close</span>}
      />,
    );

    expect(screen.getByTestId("custom-closed-icon")).toBeInTheDocument();
    expect(
      container.querySelector('[data-slot="navbar-mobile-menu-icon"]'),
    ).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));

    expect(screen.getByTestId("custom-open-icon")).toBeInTheDocument();
  });

  it("uses an opaque default mobile menu surface without scroll locking in content mode", () => {
    render(
      <Navbar
        logo={<span>Logo</span>}
        links={[{ href: "/about", label: "About" }]}
        LinkComponent={TestLink}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));

    const header = screen.getByRole("banner");
    const mobileMenu = document.querySelector('[data-slot="navbar-mobile-menu"]');

    expect(header).toHaveClass("bg-background");
    expect(header).not.toHaveClass("bg-transparent");
    expect(mobileMenu).toHaveAttribute("data-height", "content");
    expect(mobileMenu).toHaveClass("bg-background");
    expect(document.body.style.overflow).toBe("");
    expect(document.documentElement.style.overflow).toBe("");
  });

  it("applies keenan preset chrome to the header", () => {
    render(
      <Navbar
        preset="keenan"
        logo={<span>Logo</span>}
        links={[{ href: "/about", label: "About" }]}
        LinkComponent={TestLink}
      />,
    );

    const header = screen.getByRole("banner");
    expect(header).toHaveAttribute("data-preset", "keenan");
    expect(header).toHaveClass("bg-black/65");
    expect(header).toHaveClass("shadow-[0_18px_48px_rgba(0,0,0,0.45)]");
  });

  it("applies keenan preset styles to the opaque mobile menu chrome", () => {
    vi.mocked(useScrollDirection).mockReturnValue({
      direction: "up",
      isAtTop: true,
    });

    render(
      <Navbar
        preset="keenan"
        logo={<span>Logo</span>}
        links={[{ href: "/about", label: "About" }]}
        LinkComponent={TestLink}
      />,
    );

    const menuButton = screen.getByRole("button", { name: "Open menu" });
    expect(menuButton).toHaveClass("text-white");
    expect(menuButton).toHaveClass("hover:bg-white/5");

    fireEvent.click(menuButton);

    const header = screen.getByRole("banner");
    const mobileMenu = document.querySelector('[data-slot="navbar-mobile-menu"]');

    expect(header).toHaveClass("bg-black");
    expect(header).not.toHaveClass("bg-black/65");
    expect(mobileMenu).toHaveClass("bg-black");
    expect(mobileMenu).toHaveClass("border-white/10");
    expect(mobileMenu).not.toHaveClass("bg-black/95");
  });

  it("uses viewport-filling screen mode below the header and locks scroll", async () => {
    render(
      <Navbar
        logo={<span>Logo</span>}
        links={[{ href: "/about", label: "About" }]}
        LinkComponent={TestLink}
        mobileMenuHeight="screen"
      />,
    );

    const header = screen.getByRole("banner");
    Object.defineProperty(header, "getBoundingClientRect", {
      configurable: true,
      value: () => ({
        x: 0,
        y: 0,
        top: 0,
        left: 0,
        right: 390,
        bottom: 56,
        width: 390,
        height: 56,
        toJSON: () => ({}),
      }),
    });

    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));

    const mobileMenu = document.querySelector('[data-slot="navbar-mobile-menu"]');

    await waitFor(() => {
      expect(mobileMenu).toHaveStyle("top: 56px");
    });

    expect(mobileMenu).toHaveAttribute("data-height", "screen");
    expect(mobileMenu).toHaveClass("fixed");
    expect(mobileMenu).toHaveStyle("height: calc(100dvh - 56px)");
    expect(document.body.style.overflow).toBe("hidden");
    expect(document.documentElement.style.overflow).toBe("hidden");

    fireEvent.click(screen.getByRole("button", { name: "Close menu" }));

    await waitFor(() => {
      expect(document.body.style.overflow).toBe("");
      expect(document.documentElement.style.overflow).toBe("");
    });
  });
});
