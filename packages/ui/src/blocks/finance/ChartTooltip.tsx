"use client";

import type * as React from "react";
import { cn } from "../../utils/cn";

// ── Shared chart tooltip primitives ───────────────────────────────────────────
//
// Consistent tooltip styling for recharts chart tooltips and stat card hovers.
// Matches the popover aesthetic: rounded-lg, border, shadow, bg-popover.

export interface ChartTooltipShellProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Container shell for chart tooltips. Use as a wrapper for both recharts
 * custom tooltip content and Radix tooltip content.
 */
export function ChartTooltipShell({
  children,
  className,
}: ChartTooltipShellProps) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-popover px-3 py-2 text-popover-foreground shadow-md",
        className,
      )}
    >
      {children}
    </div>
  );
}

export interface ChartTooltipTitleProps {
  children: React.ReactNode;
}

/** Muted title line at the top of a tooltip. */
export function ChartTooltipTitle({ children }: ChartTooltipTitleProps) {
  return (
    <p className="mb-1.5 text-xs font-medium text-muted-foreground">
      {children}
    </p>
  );
}

export interface ChartTooltipRowProps {
  /** Dot color */
  color: string;
  /** Label text */
  label: string;
  /** Formatted value */
  value: string;
  /** Whether the value is negative (applies destructive color) */
  isNegative?: boolean;
}

/** Single metric row: colored dot + label + right-aligned value. */
export function ChartTooltipRow({
  color,
  label,
  value,
  isNegative,
}: ChartTooltipRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 text-xs">
      <div className="flex items-center gap-1.5">
        <div
          className="size-2 rounded-full shrink-0"
          style={{ backgroundColor: color }}
        />
        <span>{label}</span>
      </div>
      <span
        className={cn(
          "font-mono font-medium",
          isNegative && "text-destructive",
        )}
      >
        {value}
      </span>
    </div>
  );
}
