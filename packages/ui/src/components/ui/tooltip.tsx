"use client";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import type * as React from "react";

import { cn } from "../../utils";

/**
 * TooltipProvider - Context provider for tooltip configuration
 */
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

/**
 * Tooltip - Contextual information popup on hover
 *
 * @example
 * <Tooltip>
 *   <TooltipTrigger asChild>
 *     <Button variant="outline">Hover me</Button>
 *   </TooltipTrigger>
 *   <TooltipContent>
 *     <p>Helpful information</p>
 *   </TooltipContent>
 * </Tooltip>
 */
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

/**
 * TooltipTrigger - Element that triggers the tooltip on hover
 */
function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

/**
 * TooltipContent - Content displayed in the tooltip
 */
function TooltipContent({
  className,
  sideOffset = 6,
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
          // Colors - subtle grey distinct from main bg, respects light/dark mode
          "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100",
          // Subtle shadow for depth
          "shadow-md",
          // Typography - clean small text, light weight
          "text-xs leading-normal font-light",
          // Spacing and shape - tight rounded corners
          "rounded-box px-3 py-1.5",
          // Animations - smooth fade and scale
          "animate-in fade-in-0 zoom-in-95 duration-150",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:duration-100",
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
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
