"use client";

import { Check, Loader2, X } from "lucide-react";
import type * as React from "react";

import { cn } from "../../utils";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export interface AutoSaveIndicatorProps extends React.ComponentProps<"span"> {
  status: SaveStatus;
}

function AutoSaveIndicator({
  status,
  className,
  ...props
}: AutoSaveIndicatorProps) {
  if (status === "idle") return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs transition-opacity",
        className,
      )}
      aria-live="polite"
      {...props}
    >
      {status === "saving" && (
        <>
          <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
          <span className="text-muted-foreground">Saving...</span>
        </>
      )}
      {status === "saved" && (
        <>
          <Check className="w-3 h-3 text-green-600" />
          <span className="text-green-600">Saved</span>
        </>
      )}
      {status === "error" && (
        <>
          <X className="w-3 h-3 text-destructive" />
          <span className="text-destructive">Save failed</span>
        </>
      )}
    </span>
  );
}

export { AutoSaveIndicator };
