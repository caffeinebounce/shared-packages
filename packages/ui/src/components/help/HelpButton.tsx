"use client";

import { HelpCircle } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "../../utils/cn";
import { useHelp } from "./HelpProvider";

export interface HelpButtonProps {
  /** Optional feature key to show specific help */
  featureKey?: string;
  /** Button variant */
  variant?: "default" | "ghost" | "outline";
  /** Button size */
  size?: "default" | "sm" | "lg" | "icon";
  /** Additional class name */
  className?: string;
  /** Custom label */
  label?: string;
  /** Show label or just icon */
  showLabel?: boolean;
}

/**
 * Help button component that opens the help panel.
 *
 * Can be used standalone or with a specific feature key to show
 * contextual help for a specific feature.
 */
export function HelpButton({
  featureKey,
  variant = "ghost",
  size = "icon",
  className,
  label = "Help",
  showLabel = false,
}: HelpButtonProps) {
  const { openHelp, openFeatureHelp } = useHelp();

  const handleClick = () => {
    if (featureKey) {
      openFeatureHelp(featureKey);
    } else {
      openHelp();
    }
  };

  return (
    <Button
      variant={variant}
      size={showLabel ? size : "icon"}
      onClick={handleClick}
      className={cn(showLabel && "gap-2", className)}
      aria-label={label}
    >
      <HelpCircle className="size-4" />
      {showLabel && <span>{label}</span>}
    </Button>
  );
}
