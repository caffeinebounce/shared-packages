"use client";

import { Clock } from "lucide-react";
import type * as React from "react";

import { cn } from "../../utils";

export interface TimeEstimateProps extends React.ComponentProps<"div"> {
  minutes: number;
}

function TimeEstimate({ minutes, className, ...props }: TimeEstimateProps) {
  const displayText =
    minutes < 1
      ? "Less than a minute"
      : minutes === 1
        ? "~1 minute"
        : `~${Math.round(minutes)} minutes`;

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 text-sm text-muted-foreground",
        className,
      )}
      {...props}
    >
      <Clock className="w-4 h-4" />
      <span>Estimated time remaining: {displayText}</span>
    </div>
  );
}

export { TimeEstimate };
