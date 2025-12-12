"use client";

import type * as React from "react";

import { cn } from "../../utils";

interface ButtonGroupProps extends React.ComponentProps<"div"> {
  orientation?: "horizontal" | "vertical";
}

function ButtonGroup({
  className,
  orientation = "horizontal",
  ...props
}: ButtonGroupProps) {
  return (
    // biome-ignore lint/a11y/useSemanticElements: ButtonGroup is visual grouping, not a form fieldset
    <div
      role="group"
      data-orientation={orientation}
      className={cn(
        "flex",
        orientation === "horizontal"
          ? "flex-row items-center -space-x-px"
          : "flex-col -space-y-px",
        // Style direct button children to have connected appearance
        "[&>button]:rounded-none",
        "[&>button:first-child]:rounded-l-md",
        "[&>button:last-child]:rounded-r-md",
        orientation === "vertical" && [
          "[&>button:first-child]:rounded-t-md [&>button:first-child]:rounded-l-none",
          "[&>button:last-child]:rounded-b-md [&>button:last-child]:rounded-r-none",
        ],
        // Handle nested button groups
        "**:[role=group]:flex",
        "**:[role=group]>button:rounded-none",
        "[&>[role=group]:first-child>button:first-child]:rounded-l-md",
        "[&>[role=group]:last-child>button:last-child]:rounded-r-md",
        className,
      )}
      {...props}
    />
  );
}

function ButtonGroupSeparator({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<"hr"> & {
  orientation?: "horizontal" | "vertical";
}) {
  return (
    <hr
      aria-orientation={orientation}
      className={cn(
        "bg-border border-0",
        orientation === "vertical" ? "h-6 w-px" : "h-px w-6",
        className,
      )}
      {...props}
    />
  );
}

function ButtonGroupText({
  className,
  asChild = false,
  children,
  ...props
}: React.ComponentProps<"span"> & {
  asChild?: boolean;
}) {
  if (asChild) {
    return <>{children}</>;
  }
  return (
    <span
      className={cn(
        "flex items-center px-3 text-sm text-muted-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export { ButtonGroup, ButtonGroupSeparator, ButtonGroupText };
export type { ButtonGroupProps };
