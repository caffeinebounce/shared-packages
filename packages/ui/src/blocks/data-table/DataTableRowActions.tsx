"use client";

import { MoreHorizontal } from "lucide-react";
import * as React from "react";

import { Button } from "../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { IconButton } from "../../components/ui/icon-button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../components/ui/tooltip";
import { cn } from "../../utils";
import type { DataTableDensity } from "./DataTable";
import { useDataTableContext } from "./DataTable";

export interface DataTableRowAction {
  /** Label for the action */
  label: string;
  /** Icon component to display */
  icon?: React.ReactNode;
  /** Callback when action is clicked */
  onClick: () => void;
  /** Whether the action is destructive (shows in red on hover) */
  destructive?: boolean;
  /** Whether the action is a success action (shows in green on hover) */
  success?: boolean;
  /** Whether to show separator before this action */
  separatorBefore?: boolean;
  /** Whether the action is disabled */
  disabled?: boolean;
}

export interface DataTableRowActionsProps {
  /** Array of actions to display */
  actions: DataTableRowAction[];
  /**
   * Display mode for actions:
   * - "dropdown": Always show as dropdown menu (default, original behavior)
   * - "inline": Always show as inline icon buttons
   * - "responsive": Show inline buttons on larger screens, dropdown on mobile
   */
  mode?: "dropdown" | "inline" | "responsive";
}

/**
 * Hook to detect if viewport is at least md (768px)
 * Returns undefined during SSR, then true/false after hydration
 */
function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    setIsDesktop(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return isDesktop;
}

/**
 * Dropdown menu for row actions.
 * Used internally and for dropdown-only mode.
 */
function ActionsDropdown({
  actions,
  fontSizeClass,
  density,
}: {
  actions: DataTableRowAction[];
  fontSizeClass: string;
  density: DataTableDensity;
}) {
  const isCompact = density === "compact";
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost-icon"
          size={isCompact ? "icon-xs" : "icon-sm"}
          className="data-[state=open]:bg-muted"
        >
          <MoreHorizontal className={isCompact ? "size-3.5" : "size-4"} />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {actions.map((action, index) => (
          <div key={action.label}>
            {action.separatorBefore && index > 0 && <DropdownMenuSeparator />}
            <DropdownMenuItem
              onClick={action.onClick}
              disabled={action.disabled}
              className={cn(
                fontSizeClass,
                action.destructive &&
                  "hover:text-destructive hover:bg-destructive/10",
                action.success && "hover:text-success hover:bg-success/10",
              )}
            >
              {action.icon && (
                <span
                  className={cn(
                    "mr-2",
                    action.destructive && "group-hover:text-destructive",
                    action.success && "group-hover:text-success",
                  )}
                >
                  {action.icon}
                </span>
              )}
              {action.label}
            </DropdownMenuItem>
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Inline icon buttons for row actions.
 * Used internally for inline and responsive modes.
 */
function ActionsInline({
  actions,
  fontSizeClass,
  density,
}: {
  actions: DataTableRowAction[];
  fontSizeClass: string;
  density: DataTableDensity;
}) {
  const isCompact = density === "compact";
  return (
    <div className={cn("flex items-center", isCompact ? "gap-0.5" : "gap-1")}>
      {actions.map((action) => {
        // Determine variant: destructive > success > ghost
        const variant = action.destructive
          ? "delete"
          : action.success
            ? "success"
            : "ghost";
        return (
          <Tooltip key={action.label}>
            <TooltipTrigger asChild>
              <IconButton
                variant={variant}
                size={isCompact ? "xs" : "default"}
                onClick={action.onClick}
                disabled={action.disabled}
              >
                {action.icon}
                <span className="sr-only">{action.label}</span>
              </IconButton>
            </TooltipTrigger>
            <TooltipContent className={fontSizeClass}>
              {action.label}
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}

/**
 * Row actions component with multiple display modes.
 *
 * Modes:
 * - "dropdown": Always shows as ellipsis dropdown menu (original behavior)
 * - "inline": Always shows icon buttons inline with tooltips
 * - "responsive": Shows inline on larger screens, collapses to dropdown on mobile
 *
 * @example Dropdown mode (default)
 * ```tsx
 * <DataTableRowActions actions={actions} />
 * ```
 *
 * @example Responsive mode
 * ```tsx
 * <DataTableRowActions actions={actions} mode="responsive" />
 * ```
 *
 * @example Inline mode
 * ```tsx
 * <DataTableRowActions actions={actions} mode="inline" />
 * ```
 */
export function DataTableRowActions({
  actions,
  mode = "dropdown",
}: DataTableRowActionsProps) {
  const context = useDataTableContext();
  const fontSizeClass = context?.fontSizeClass ?? "text-xs";
  const density = context?.density ?? "comfy";

  const isDesktop = useIsDesktop();

  if (actions.length === 0) return null;

  // Dropdown-only mode (original behavior)
  if (mode === "dropdown") {
    return (
      <ActionsDropdown
        actions={actions}
        fontSizeClass={fontSizeClass}
        density={density}
      />
    );
  }

  // Inline-only mode
  if (mode === "inline") {
    return (
      <ActionsInline
        actions={actions}
        fontSizeClass={fontSizeClass}
        density={density}
      />
    );
  }

  // Responsive mode: only render what's needed based on screen size
  // This ensures column width shrinks properly when showing dropdown
  if (isDesktop) {
    return (
      <ActionsInline
        actions={actions}
        fontSizeClass={fontSizeClass}
        density={density}
      />
    );
  }

  return (
    <ActionsDropdown
      actions={actions}
      fontSizeClass={fontSizeClass}
      density={density}
    />
  );
}
