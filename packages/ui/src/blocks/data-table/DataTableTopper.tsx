"use client";

import * as React from "react";

import { cn } from "../../utils";

export interface DataTableTab {
  /** Unique identifier for the tab */
  id: string;
  /** Display label */
  label: string;
  /** Optional count badge */
  count?: number;
}

export interface DataTableTopperProps extends React.ComponentProps<"div"> {
  /** Tabs to display on the left side */
  tabs?: DataTableTab[];
  /** Currently active tab ID */
  activeTab?: string;
  /** Callback when tab changes */
  onTabChange?: (tabId: string) => void;
}

/**
 * The DataTable Topper - a full-width header bar that combines:
 * - Tabs on the left (for filtering views)
 * - Actions on the right (search, view options, etc.)
 *
 * This component is decoupled from table width - it always spans
 * the full container width while the table can scroll independently.
 *
 * @example
 * ```tsx
 * <DataTableTopper
 *   tabs={[
 *     { id: "all", label: "All", count: 100 },
 *     { id: "active", label: "Active", count: 45 },
 *   ]}
 *   activeTab="all"
 *   onTabChange={setActiveTab}
 * >
 *   <DataTableSearch ... />
 *   <DataTableViewOptions ... />
 * </DataTableTopper>
 * ```
 */
export function DataTableTopper({
  tabs,
  activeTab,
  onTabChange,
  className,
  children,
  ...props
}: DataTableTopperProps) {
  return (
    <div
      className={cn(
        // Full width, never shrink, fixed layout
        "flex w-full min-w-0 shrink-0 items-center justify-between",
        // Visual styling
        "border-b border-border/40 pb-1",
        className,
      )}
      {...props}
    >
      {/* Left side: Tabs */}
      <div className="flex min-w-0 shrink-0 items-center gap-0.5">
        {tabs?.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange?.(tab.id)}
            className={cn(
              "relative flex items-center gap-1.5 px-2 py-1 text-sm transition-colors rounded-md whitespace-nowrap",
              activeTab === tab.id
                ? "text-foreground font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={cn(
                  "text-xs tabular-nums",
                  activeTab === tab.id
                    ? "text-muted-foreground"
                    : "text-muted-foreground/60",
                )}
              >
                {tab.count}
              </span>
            )}
            {/* Active indicator line */}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-foreground rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Right side: Actions - flex shrink to fit, never wrap */}
      <div className="flex shrink-0 items-center gap-1">{children}</div>
    </div>
  );
}
