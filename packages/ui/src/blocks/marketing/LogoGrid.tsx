"use client";

import { cn } from "../../utils";

export interface LogoGridItem {
  name: string;
  logo?: string;
}

export interface LogoGridProps {
  items: LogoGridItem[];
  columns?: 2 | 3 | 4 | 5 | 6;
  className?: string;
}

const columnClassMap: Record<NonNullable<LogoGridProps["columns"]>, string> = {
  2: "grid-cols-2",
  3: "grid-cols-2 md:grid-cols-3",
  4: "grid-cols-2 md:grid-cols-4",
  5: "grid-cols-2 md:grid-cols-5",
  6: "grid-cols-2 md:grid-cols-6",
};

export function LogoGrid({ items, columns = 4, className }: LogoGridProps) {
  return (
    <div className={cn("grid gap-3", columnClassMap[columns], className)}>
      {items.map((item, index) => (
        <div
          key={`${item.name}-${index}`}
          className="flex min-h-20 items-center justify-center rounded-xl border border-white/10 bg-white/5 p-4"
        >
          {item.logo ? (
            <img
              src={item.logo}
              alt={item.name}
              className="max-h-10 w-auto object-contain opacity-90"
            />
          ) : (
            <span className="text-sm font-medium text-white/80">
              {item.name}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
