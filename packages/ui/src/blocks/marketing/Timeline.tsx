"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { useCallback, useRef, useState } from "react";

import { cn } from "../../utils";

export interface TimelineItem {
  period?: string;
  logo?: ReactNode;
  title: string;
  subtitle?: string;
  description?: string;
}

export interface TimelineProps {
  items: TimelineItem[];
  /** Accent hook applied to the node and editorial rule */
  dotClassName?: string;
  className?: string;
  /** Enable the sliding hover highlight between cards */
  hoverEffect?: boolean;
}

function getTimelinePeriod(item: TimelineItem, index: number) {
  if (item.period) {
    return item.period;
  }

  return String(index + 1).padStart(2, "0");
}

export function Timeline({
  items,
  dotClassName = "bg-primary",
  className,
  hoverEffect = false,
}: TimelineProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const leaveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleEnter = useCallback((idx: number) => {
    if (leaveTimeout.current) {
      clearTimeout(leaveTimeout.current);
      leaveTimeout.current = null;
    }
    setHoveredIndex(idx);
  }, []);

  const handleLeave = useCallback(() => {
    leaveTimeout.current = setTimeout(() => {
      setHoveredIndex(null);
    }, 50);
  }, []);

  return (
    <ol className={cn("space-y-0", className)} data-slot="timeline">
      {items.map((item, index) => {
        const period = getTimelinePeriod(item, index);
        const isLast = index === items.length - 1;

        return (
          <li
            key={`${item.title}-${index}`}
            className={cn(
              "group relative pl-11 md:pl-14",
              hoverEffect ? "pb-2 md:pb-2" : "pb-6 md:pb-8",
            )}
            onMouseEnter={hoverEffect ? () => handleEnter(index) : undefined}
            onMouseLeave={hoverEffect ? handleLeave : undefined}
          >
            {!isLast ? (
              <span
                className="pointer-events-none absolute left-[0.95rem] top-[2.25rem] bottom-0 w-px bg-border md:left-[1.125rem] md:top-[2.625rem]"
                data-slot="timeline-connector"
              />
            ) : null}

            <span
              className="pointer-events-none absolute left-0 top-1 flex h-8 w-8 items-center justify-center md:top-1.5 md:h-9 md:w-9"
              data-slot="timeline-node"
            >
              <span className="absolute inset-0 rounded-full border border-border bg-muted/30 shadow-sm" />
              <span className="absolute inset-[0.52rem] rounded-full bg-muted/50 md:inset-[0.62rem]" />
              <span
                className={cn(
                  "absolute inset-[0.74rem] rounded-full opacity-90 md:inset-[0.84rem]",
                  dotClassName,
                )}
                data-slot="timeline-accent-dot"
              />
            </span>

            {/* Hover wrapper — padding creates the visible highlight area around the card */}
            <div className={cn("relative", hoverEffect && "p-2")}>
              {hoverEffect && hoveredIndex === index && (
                <motion.span
                  className="absolute inset-0 block h-full w-full rounded-2xl bg-neutral-200 dark:bg-slate-800/[0.8]"
                  layoutId="timelineHoverBackground"
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                />
              )}

              <div
                className={cn(
                  "relative z-20 rounded-xl border bg-card px-5 py-5 shadow-sm md:px-6 md:py-6",
                  hoverEffect
                    ? "border-transparent dark:border-white/[0.2] transition-colors duration-300 group-hover:border-slate-300 dark:group-hover:border-slate-700"
                    : "border-border transition-[transform,background-color,border-color,box-shadow] duration-300 group-hover:-translate-y-0.5 group-hover:border-border/80 group-hover:shadow-md",
                )}
                data-slot="timeline-card"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "h-px w-8 shrink-0 rounded-full opacity-80",
                        dotClassName,
                      )}
                      data-slot="timeline-accent-rule"
                    />
                    <p
                      className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-muted-foreground"
                      data-slot="timeline-period"
                    >
                      {period}
                    </p>
                  </div>

                  {item.logo ? (
                    <div className="shrink-0" data-slot="timeline-logo">
                      {item.logo}
                    </div>
                  ) : null}
                </div>

                <h3 className="mt-4 font-serif text-[1.65rem] leading-[0.95] tracking-[-0.04em] text-foreground md:text-[1.85rem]">
                  {item.title}
                </h3>

                {item.subtitle ? (
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {item.subtitle}
                  </p>
                ) : null}

                {item.description ? (
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground/90 md:text-[0.95rem]">
                    {item.description}
                  </p>
                ) : null}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
