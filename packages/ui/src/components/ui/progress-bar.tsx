"use client";

import type * as React from "react";

import { cn } from "../../utils";

export interface ProgressBarProps extends React.ComponentProps<"div"> {
  value: number;
  max?: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

function ProgressBar({
  value,
  max = 100,
  showLabel = true,
  size = "md",
  className,
  ...props
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizeClasses = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  };

  return (
    <div className={cn("w-full", className)} {...props}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-muted-foreground">
            Application Progress
          </span>
          <span className="text-sm font-medium text-foreground">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      <div
        className={cn(
          "w-full bg-muted rounded-full overflow-hidden",
          sizeClasses[size],
        )}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={`Application ${Math.round(percentage)}% complete`}
      >
        <div
          className={cn(
            "h-full bg-primary rounded-full transition-all duration-300 ease-out",
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export { ProgressBar };
