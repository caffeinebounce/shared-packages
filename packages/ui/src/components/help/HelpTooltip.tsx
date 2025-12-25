"use client";

import { HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { useHelp } from "./HelpProvider";

export interface HelpTooltipProps {
  /** Content to display in the tooltip */
  content: string;
  /** Optional feature key to link to more help */
  featureKey?: string;
  /** Size of the help icon */
  size?: "sm" | "md";
  /** Additional class name */
  className?: string;
}

/**
 * Inline help tooltip that shows a small "?" icon with hover content.
 */
export function HelpTooltip({
  content,
  featureKey,
  size = "sm",
  className,
}: HelpTooltipProps) {
  const { openFeatureHelp } = useHelp();

  const iconSize = size === "sm" ? "size-3.5" : "size-4";

  const handleClick = (e: React.MouseEvent) => {
    if (featureKey) {
      e.preventDefault();
      e.stopPropagation();
      openFeatureHelp(featureKey);
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={handleClick}
          className={`inline-flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors ${className}`}
          aria-label="Help"
        >
          <HelpCircle className={iconSize} />
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <p className="text-sm">{content}</p>
        {featureKey && (
          <p className="text-xs text-muted-foreground mt-1">
            Click to learn more
          </p>
        )}
      </TooltipContent>
    </Tooltip>
  );
}
