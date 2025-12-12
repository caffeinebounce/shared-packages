"use client";

import * as React from "react";
import { cn } from "../../utils";

/**
 * Section component for consistent vertical spacing between page sections.
 */

type SectionSpacing = "sm" | "md" | "lg" | "xl";

interface SectionProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Vertical spacing size */
  spacing?: SectionSpacing;
  /** HTML element to render */
  as?: "section" | "div" | "article";
}

const spacingClasses: Record<SectionSpacing, string> = {
  sm: "py-8", // 32px
  md: "py-16", // 64px
  lg: "py-24", // 96px
  xl: "py-32", // 128px
};

const Section = React.forwardRef<HTMLDivElement, SectionProps>(
  (
    {
      className,
      spacing = "md",
      as: Component = "section",
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <Component
        ref={ref as React.RefObject<HTMLDivElement>}
        className={cn(spacingClasses[spacing], className)}
        {...props}
      >
        {children}
      </Component>
    );
  },
);
Section.displayName = "Section";

export { Section, type SectionProps, type SectionSpacing };
