"use client";

import type * as React from "react";

import { cn } from "../../utils";

interface ButtonGroupProps extends React.ComponentProps<"div"> {
  orientation?: "horizontal" | "vertical";
}

/**
 * ButtonGroup - Group of related buttons with connected appearance
 *
 * @example
 * <ButtonGroup>
 *   <Button>Left</Button>
 *   <Button>Middle</Button>
 *   <Button>Right</Button>
 * </ButtonGroup>
 *
 * @example
 * // Vertical orientation
 * <ButtonGroup orientation="vertical">
 *   <Button>Top</Button>
 *   <Button>Bottom</Button>
 * </ButtonGroup>
 */
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
        // Style direct children to have connected appearance
        // Use !important to override Button's own shared box radius classes
        "[&>*]:!rounded-none",
        "[&>*:first-child]:!rounded-l-box",
        "[&>*:last-child]:!rounded-r-box",
        orientation === "vertical" && [
          "[&>*:first-child]:!rounded-t-box [&>*:first-child]:!rounded-l-none",
          "[&>*:last-child]:!rounded-b-box [&>*:last-child]:!rounded-r-none",
        ],
        // Handle nested button groups
        "**:[role=group]:flex",
        "**:[role=group]>*:!rounded-none",
        "[&>[role=group]:first-child>*:first-child]:!rounded-l-box",
        "[&>[role=group]:last-child>*:last-child]:!rounded-r-box",
        className,
      )}
      {...props}
    />
  );
}

/**
 * ButtonGroupSeparator - Visual divider between button groups
 */
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

/**
 * ButtonGroupText - Text label within a button group
 */
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

export type { ButtonGroupProps };
export { ButtonGroup, ButtonGroupSeparator, ButtonGroupText };
