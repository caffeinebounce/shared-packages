"use client";

import type * as React from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
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
  /** Gutter width for left offset (aligns with DataTable gutter) */
  gutterWidth?: number;
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
  gutterWidth = 0,
  className,
  children,
  ...props
}: DataTableTopperProps) {
  return (
    <div
      className={cn(
        // Container context for responsive layout based on available width
        "@container w-full min-w-0 shrink-0",
        // Visual styling
        "border-b border-border/40 pb-1",
        className,
      )}
      {...props}
    >
      <div className="flex w-full flex-row items-center justify-between gap-3">
        {/* Left side: Gutter spacer + Tabs */}
        <div className="flex min-w-0 shrink-0 items-center gap-0.5">
          {/* Gutter spacer to align with DataTable gutter */}
          {gutterWidth > 0 && (
            <div className="shrink-0" style={{ width: gutterWidth }} />
          )}

          {/* Mobile Tabs (Dropdown) */}
          {tabs && tabs.length > 0 && (
            <div className="block @min-[450px]:hidden">
              <Select value={activeTab} onValueChange={onTabChange}>
                <SelectTrigger className="h-7 w-[100px] text-xs">
                  <SelectValue placeholder="Select tab" />
                </SelectTrigger>
                <SelectContent>
                  {tabs.map((tab) => (
                    <SelectItem key={tab.id} value={tab.id}>
                      <span className="flex items-center gap-2">
                        {tab.label}
                        {tab.count !== undefined && (
                          <span className="text-muted-foreground text-xs">
                            {tab.count}
                          </span>
                        )}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Desktop Tabs (List) */}
          <div
            className={cn(
              "items-center gap-0.5 overflow-x-auto no-scrollbar",
              tabs && tabs.length > 0 ? "hidden @min-[450px]:flex" : "flex",
            )}
          >
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
        </div>

        {/* Right side: Actions */}
        <div className="flex items-center gap-2">{children}</div>
      </div>
    </div>
  );
}
