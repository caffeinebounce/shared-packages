"use client";

import { cn } from "../../utils";

export interface TimelineItem {
  title: string;
  subtitle?: string;
  description?: string;
}

export interface TimelineProps {
  items: TimelineItem[];
  /** Dot color — CSS class or color string */
  dotClassName?: string;
  className?: string;
}

export function Timeline({
  items,
  dotClassName = "bg-primary",
  className,
}: TimelineProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {items.map((item, index) => (
        <div key={`${item.title}-${index}`} className="relative pl-8">
          <span className="pointer-events-none absolute left-3 top-0 bottom-0 w-px bg-white/10" />
          <span
            className={cn(
              "absolute left-0 top-1.5 h-3 w-3 rounded-full border border-white/20",
              dotClassName,
            )}
          />

          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <h3 className="text-base font-semibold text-white">{item.title}</h3>
            {item.subtitle ? (
              <p className="mt-1 text-sm text-white/70">{item.subtitle}</p>
            ) : null}
            {item.description ? (
              <p className="mt-2 text-sm leading-relaxed text-white/80">
                {item.description}
              </p>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
