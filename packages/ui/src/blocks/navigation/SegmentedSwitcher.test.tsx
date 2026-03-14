import { fireEvent, render, screen } from "@testing-library/react";
import { useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { RouteSegmentedSwitcher, SegmentedSwitcher } from "./SegmentedSwitcher";

vi.mock("motion/react", async () => {
  const actual =
    await vi.importActual<typeof import("motion/react")>("motion/react");

  return {
    ...actual,
    useReducedMotion: vi.fn(() => false),
  };
});

const mockedUseReducedMotion = vi.mocked(useReducedMotion);

function TestLink({
  href,
  className,
  children,
  onClick,
  ...props
}: {
  href: string;
  className?: string;
  children: ReactNode;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  "aria-current"?: "page";
  "aria-disabled"?: boolean;
  tabIndex?: number;
  "data-slot"?: string;
  "data-active"?: "true";
  "data-disabled"?: "true";
}) {
  return (
    <a href={href} className={className} onClick={onClick} {...props}>
      {children}
    </a>
  );
}

describe("SegmentedSwitcher", () => {
  it("supports controlled mode and emits value changes", () => {
    const onValueChange = vi.fn();

    render(
      <SegmentedSwitcher
        items={[
          { id: "dashboard", label: "Dashboard" },
          { id: "deals", label: "Deals" },
        ]}
        value="dashboard"
        onValueChange={onValueChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Deals" }));

    expect(onValueChange).toHaveBeenCalledWith("deals");
    expect(screen.getByRole("button", { name: "Dashboard" })).toHaveAttribute(
      "data-active",
      "true",
    );
  });

  it("does not fire changes for disabled items", () => {
    const onValueChange = vi.fn();

    render(
      <SegmentedSwitcher
        items={[
          { id: "dashboard", label: "Dashboard" },
          { id: "deals", label: "Deals", disabled: true },
        ]}
        value="dashboard"
        onValueChange={onValueChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Deals" }));

    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("renders requested variant contract", () => {
    render(
      <SegmentedSwitcher
        variant="admin"
        items={[
          { id: "dashboard", label: "Dashboard" },
          { id: "deals", label: "Deals" },
        ]}
      />,
    );

    expect(screen.getByLabelText("Section switcher")).toHaveAttribute(
      "data-variant",
      "admin",
    );
  });

  it("supports disabling outer track border and background", () => {
    render(
      <SegmentedSwitcher
        items={[
          { id: "dashboard", label: "Dashboard" },
          { id: "deals", label: "Deals" },
        ]}
        showTrackBorder={false}
        showTrackBackground={false}
      />,
    );

    expect(screen.getByLabelText("Section switcher")).toHaveAttribute(
      "data-track-border",
      "false",
    );
    expect(screen.getByLabelText("Section switcher")).toHaveAttribute(
      "data-track-background",
      "false",
    );
  });

  it("sets reduced motion flag for motion-safe indicator behavior", () => {
    mockedUseReducedMotion.mockReturnValue(true);

    render(
      <SegmentedSwitcher
        items={[
          { id: "dashboard", label: "Dashboard" },
          { id: "deals", label: "Deals" },
        ]}
        value="dashboard"
      />,
    );

    expect(screen.getByLabelText("Section switcher")).toHaveAttribute(
      "data-reduced-motion",
      "true",
    );

    mockedUseReducedMotion.mockReturnValue(false);
  });
});

describe("RouteSegmentedSwitcher", () => {
  const routeItems = [
    {
      id: "overview",
      label: "Overview",
      href: "/admin",
      match: "exact" as const,
    },
    {
      id: "users",
      label: "Users",
      href: "/admin/users",
      match: "prefix" as const,
    },
    {
      id: "interests",
      label: "Interests",
      href: "/admin/interests",
      match: "prefix" as const,
    },
  ];

  it("uses longest matching href for active route", () => {
    render(
      <RouteSegmentedSwitcher
        items={routeItems}
        pathname="/admin/users/123"
        LinkComponent={TestLink}
      />,
    );

    expect(screen.getByRole("link", { name: "Users" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Overview" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("honors exact route matching for parent routes", () => {
    render(
      <RouteSegmentedSwitcher
        items={routeItems}
        pathname="/admin"
        LinkComponent={TestLink}
      />,
    );

    expect(screen.getByRole("link", { name: "Overview" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("falls back to first enabled item when no route matches", () => {
    render(
      <RouteSegmentedSwitcher
        items={routeItems}
        pathname="/unknown"
        LinkComponent={TestLink}
      />,
    );

    expect(screen.getByRole("link", { name: "Overview" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("uses controlled value over pathname-derived active state", () => {
    render(
      <RouteSegmentedSwitcher
        items={routeItems}
        pathname="/admin/users"
        value="interests"
        LinkComponent={TestLink}
      />,
    );

    expect(screen.getByRole("link", { name: "Interests" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("applies disabled semantics for non-interactive links", () => {
    render(
      <RouteSegmentedSwitcher
        items={[
          ...routeItems,
          {
            id: "audit",
            label: "Audit",
            href: "/admin/audit",
            disabled: true,
          },
        ]}
        pathname="/admin"
        LinkComponent={TestLink}
      />,
    );

    expect(screen.getByRole("link", { name: "Audit" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    expect(screen.getByRole("link", { name: "Audit" })).toHaveAttribute(
      "tabindex",
      "-1",
    );
  });

  it("supports chrome toggles in route mode", () => {
    render(
      <RouteSegmentedSwitcher
        items={routeItems}
        pathname="/admin"
        LinkComponent={TestLink}
        showTrackBorder={false}
        showTrackBackground={false}
      />,
    );

    expect(screen.getByLabelText("Section switcher")).toHaveAttribute(
      "data-track-border",
      "false",
    );
    expect(screen.getByLabelText("Section switcher")).toHaveAttribute(
      "data-track-background",
      "false",
    );
  });
});
