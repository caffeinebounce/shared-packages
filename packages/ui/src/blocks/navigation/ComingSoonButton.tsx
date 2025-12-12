"use client";

import type { ReactNode } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../components/ui/tooltip";
import { cn } from "../../utils";
import { KeyboardShortcut } from "../keyboard/KeyboardShortcut";

export interface ComingSoonButtonProps {
  /** Button label */
  label: string;
  /** Icon to display before the label */
  icon?: ReactNode;
  /** Keyboard shortcut key to display (e.g., "F") */
  shortcutKey?: string;
  /** Whether keyboard shortcuts are visible */
  shortcutsVisible?: boolean;
  /** Tooltip message */
  tooltip?: string;
  /** Additional className */
  className?: string;
}

/**
 * A disabled button that shows a "Coming Soon" tooltip.
 * Useful for placeholder features in navigation or sidebars.
 */
export function ComingSoonButton({
  label,
  icon,
  shortcutKey,
  shortcutsVisible = true,
  tooltip = "Coming Soon",
  className,
}: ComingSoonButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          disabled
          className={cn(
            "group inline-flex h-7 cursor-not-allowed items-center justify-center gap-1 rounded-lg border border-border bg-muted/50 px-2 pr-1.5 text-xs font-normal text-muted-foreground opacity-60 transition-colors",
            className,
          )}
          aria-label={`${label} (${tooltip})`}
        >
          {icon && (
            <span className="h-3.5 w-3.5 transition-transform duration-200 group-hover:scale-110 [&>svg]:h-full [&>svg]:w-full">
              {icon}
            </span>
          )}
          <span>{label}</span>
          {shortcutKey && (
            <KeyboardShortcut
              visible={shortcutsVisible}
              className="ml-0.5 hidden uppercase md:inline-flex"
            >
              {shortcutKey}
            </KeyboardShortcut>
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom">{tooltip}</TooltipContent>
    </Tooltip>
  );
}
