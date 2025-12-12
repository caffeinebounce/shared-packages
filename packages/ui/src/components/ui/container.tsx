"use client";

import * as React from "react";
import { cn } from "../../utils";

/**
 * Container component that provides consistent max-width and padding.
 * Uses the theme's layout configuration for consistent sizing across the app.
 */

type ContainerSize = "narrow" | "default" | "wide" | "full";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Maximum width variant
   * - narrow: 640px (forms, auth pages)
   * - default: 1280px (most pages)
   * - wide: 1536px (dashboards, tables)
   * - full: 100% (full-bleed content)
   */
  size?: ContainerSize;
  /** Center the container horizontally */
  centered?: boolean;
  /** Add horizontal padding */
  padded?: boolean;
  /** HTML element to render */
  as?: "div" | "main" | "section" | "article";
}

const sizeClasses: Record<ContainerSize, string> = {
  narrow: "max-w-screen-sm", // 640px
  default: "max-w-screen-xl", // 1280px
  wide: "max-w-screen-2xl", // 1536px
  full: "max-w-full",
};

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  (
    {
      className,
      size = "default",
      centered = true,
      padded = true,
      as: Component = "div",
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <Component
        ref={ref}
        className={cn(
          "w-full",
          sizeClasses[size],
          centered && "mx-auto",
          padded && "px-4 sm:px-6 lg:px-8",
          className,
        )}
        {...props}
      >
        {children}
      </Component>
    );
  },
);
Container.displayName = "Container";

export { Container, type ContainerProps, type ContainerSize };
