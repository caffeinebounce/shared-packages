"use client";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import type * as React from "react";

import { cn } from "../../utils";

function TooltipProvider({
  delayDuration = 1000,
  skipDelayDuration = 300,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      skipDelayDuration={skipDelayDuration}
      {...props}
    />
  );
}

function Tooltip({
  delayDuration = 1000,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root> & {
  delayDuration?: number;
}) {
  return (
    <TooltipProvider delayDuration={delayDuration}>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  );
}

function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipContent({
  className,
  sideOffset = 8,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          // Base styles
          "z-50 max-w-xs overflow-hidden",
          // Colors - subtle dark background with good contrast
          "bg-popover text-popover-foreground",
          // Shadow for depth (no border)
          "shadow-lg shadow-black/10 dark:shadow-black/25",
          // Typography - smaller text
          "text-xs leading-relaxed",
          // Spacing and shape
          "rounded-lg px-2.5 py-1.5",
          // Animations - smooth fade and scale
          "animate-in fade-in-0 zoom-in-95 duration-200",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:duration-150",
          // Slide in from direction
          "data-[side=bottom]:slide-in-from-top-1",
          "data-[side=left]:slide-in-from-right-1",
          "data-[side=right]:slide-in-from-left-1",
          "data-[side=top]:slide-in-from-bottom-1",
          // Transform origin for natural scaling
          "origin-[--radix-tooltip-content-transform-origin]",
          className,
        )}
        {...props}
      >
        {children}
        {/* Arrow for polish */}
        <TooltipPrimitive.Arrow
          className="fill-popover drop-shadow-sm"
          width={12}
          height={6}
        />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
