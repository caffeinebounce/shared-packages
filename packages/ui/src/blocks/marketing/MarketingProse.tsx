"use client";

import type { ReactNode } from "react";

import { cn } from "../../utils";

export interface MarketingProseProps {
  children: ReactNode;
  className?: string;
}

export function MarketingProse({ children, className }: MarketingProseProps) {
  return (
    <div
      className={cn(
        "prose prose-neutral max-w-3xl text-foreground dark:prose-invert prose-headings:tracking-tight prose-p:text-muted-foreground",
        className,
      )}
      data-slot="marketing-prose"
    >
      {children}
    </div>
  );
}
