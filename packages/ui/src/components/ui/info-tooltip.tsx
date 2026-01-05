"use client";

import { Info } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../../utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

export interface InfoTooltipProps {
  /** Content to display in the tooltip */
  content: ReactNode;
  /** Size of the icon */
  size?: "sm" | "md";
  /** Additional class name for the button */
  className?: string;
  /** Side of the trigger to show the tooltip */
  side?: "top" | "right" | "bottom" | "left";
  /** Alignment of the tooltip content */
  align?: "start" | "center" | "end";
}

/**
 * Simple info tooltip with an icon trigger.
 * Use this for inline help text next to labels.
 *
 * @example
 * ```tsx
 * <FieldLabel>
 *   Cohort Name *
 *   <InfoTooltip content="A descriptive name for this cohort" />
 * </FieldLabel>
 * ```
 */
export function InfoTooltip({
  content,
  size = "sm",
  className,
  side = "top",
  align = "center",
}: InfoTooltipProps) {
  const iconSize = size === "sm" ? "size-3.5" : "size-4";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors ml-1",
            className,
          )}
          aria-label="More information"
        >
          <Info className={iconSize} />
        </button>
      </TooltipTrigger>
      <TooltipContent side={side} align={align} className="max-w-xs">
        {typeof content === "string" ? (
          <p className="text-sm">{content}</p>
        ) : (
          content
        )}
      </TooltipContent>
    </Tooltip>
  );
}
