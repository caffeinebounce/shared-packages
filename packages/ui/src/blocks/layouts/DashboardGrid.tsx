"use client";

import { cn } from "../../utils";

export interface DashboardGridProps {
  children: React.ReactNode;
  className?: string;
}

export function DashboardGrid({ children, className }: DashboardGridProps) {
  return <div className={cn("flex flex-col gap-8", className)}>{children}</div>;
}
