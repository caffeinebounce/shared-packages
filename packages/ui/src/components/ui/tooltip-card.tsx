"use client";

import type { ComponentProps, ReactNode } from "react";

import { cn } from "../../utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

type TooltipRootProps = Omit<ComponentProps<typeof Tooltip>, "children">;
type TooltipContentProps = ComponentProps<typeof TooltipContent>;

export interface TooltipCardProps extends TooltipRootProps {
  /** The inline trigger content. */
  children: ReactNode;
  /** Rich tooltip card content. Strings are rendered with default readable text styles. */
  content: ReactNode;
  /** Additional classes for the inline trigger. */
  className?: string;
  /** Additional classes for the inline trigger. Prefer this when mirroring registry examples. */
  triggerClassName?: string;
  /** Additional classes for the tooltip card panel. */
  containerClassName?: string;
  /** Tooltip side relative to the trigger. */
  side?: TooltipContentProps["side"];
  /** Tooltip alignment relative to the trigger. */
  align?: TooltipContentProps["align"];
  /** Distance between the trigger and card. */
  sideOffset?: TooltipContentProps["sideOffset"];
}

/**
 * Inline rich tooltip card for contextual copy, definitions, and lightweight previews.
 */
export function TooltipCard({
  children,
  className,
  containerClassName,
  content,
  triggerClassName,
  delayDuration = 150,
  side = "top",
  align = "center",
  sideOffset = 10,
  ...tooltipProps
}: TooltipCardProps) {
  return (
    <Tooltip delayDuration={delayDuration} {...tooltipProps}>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline cursor-help appearance-none border-0 bg-transparent p-0 align-baseline font-medium text-inherit underline decoration-current/35 underline-offset-4 transition-colors",
            "hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            className,
            triggerClassName,
          )}
          data-slot="tooltip-card-trigger"
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent
        align={align}
        className={cn(
          "max-w-sm rounded-box border border-border bg-popover px-4 py-3 text-popover-foreground shadow-xl",
          "text-sm leading-6 font-normal",
          containerClassName,
        )}
        data-slot="tooltip-card-content"
        side={side}
        sideOffset={sideOffset}
      >
        {typeof content === "string" ? (
          <p data-slot="tooltip-card-text">{content}</p>
        ) : (
          content
        )}
      </TooltipContent>
    </Tooltip>
  );
}
