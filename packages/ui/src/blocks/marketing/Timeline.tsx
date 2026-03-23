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
  /** Small pill badge (e.g. industry label) shown above the description */
  badge?: string;
  /** Location shown next to badge (e.g. "New York, NY") */
  location?: string;
  description?: string;
  /** Second paragraph describing your personal role/contribution — rendered with slightly higher emphasis */
  role?: string;
  /** Education-specific: list of degrees rendered as individual lines */
  degrees?: Array<{ name: string; honors?: string }>;
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

/**
 * Inline style helpers — Tailwind v4 can't scan compiled npm packages
 * for semantic token classes like bg-border, bg-card, border-border, etc.
 * We use CSS variables directly via inline styles to guarantee rendering.
 */
const borderColor = "var(--color-border, hsl(var(--border)))";
const cardBg = "var(--color-card, hsl(var(--card)))";
const mutedBg30 =
  "color-mix(in srgb, var(--color-muted, hsl(var(--muted))) 30%, transparent)";
const mutedBg50 =
  "color-mix(in srgb, var(--color-muted, hsl(var(--muted))) 50%, transparent)";

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
                className="pointer-events-none absolute left-[0.9375rem] top-[3.125rem] bottom-0 z-10 w-px md:left-[1.09375rem] md:top-[3.5rem]"
                style={{ backgroundColor: borderColor }}
                data-slot="timeline-connector"
              />
            ) : null}

            <span
              className="pointer-events-none absolute left-0 top-[1.125rem] flex h-8 w-8 items-center justify-center md:top-[1.25rem] md:h-9 md:w-9"
              data-slot="timeline-node"
            >
              <span
                className="absolute inset-0 rounded-full shadow-sm"
                style={{
                  border: `1px solid ${borderColor}`,
                  backgroundColor: mutedBg30,
                }}
              />
              <span
                className="absolute inset-[0.52rem] rounded-full md:inset-[0.62rem]"
                style={{ backgroundColor: mutedBg50 }}
              />
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
                  className="absolute inset-0 block h-full w-full rounded-2xl"
                  style={{
                    backgroundColor:
                      "color-mix(in oklch, var(--color-primary, #6366f1) 15%, var(--color-muted, #f5f5f5))",
                  }}
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
                  "relative z-20 rounded-xl px-5 py-5 shadow-sm md:px-6 md:py-6",
                  hoverEffect
                    ? "transition-colors duration-300"
                    : "transition-[transform,background-color,border-color,box-shadow] duration-300 group-hover:-translate-y-0.5 group-hover:shadow-md",
                )}
                style={{
                  border: `1px solid ${hoverEffect ? "transparent" : borderColor}`,
                  backgroundColor: cardBg,
                }}
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
                  <p
                    className="mt-3 text-sm leading-relaxed"
                    style={{ color: "var(--color-muted-foreground)" }}
                  >
                    {item.subtitle}
                  </p>
                ) : null}

                {item.badge || item.location ? (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {item.badge ? (
                      <span
                        className="inline-block rounded-full px-3 py-0.5 text-xs font-medium"
                        style={{
                          backgroundColor:
                            "color-mix(in oklch, var(--color-primary, #6366f1) 15%, transparent)",
                          color: "var(--color-primary, #6366f1)",
                        }}
                      >
                        {item.badge}
                      </span>
                    ) : null}
                    {item.location ? (
                      <span
                        className="inline-flex items-center gap-1 text-xs"
                        style={{ color: "var(--color-muted-foreground)" }}
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{ opacity: 0.7 }}
                          aria-label="Location"
                          role="img"
                        >
                          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        {item.location}
                      </span>
                    ) : null}
                  </div>
                ) : null}

                {item.description ? (
                  <p
                    className="mt-3 text-sm leading-relaxed md:text-[0.95rem]"
                    style={{
                      color: "var(--color-muted-foreground)",
                      opacity: 0.9,
                    }}
                  >
                    {item.description}
                  </p>
                ) : null}

                {item.role ? (
                  <p
                    className="mt-2 text-sm leading-relaxed md:text-[0.95rem]"
                    style={{
                      color: "var(--color-foreground)",
                      opacity: 0.8,
                    }}
                  >
                    {item.role}
                  </p>
                ) : null}

                {item.degrees && item.degrees.length > 0 ? (
                  <ul className="mt-3 space-y-1.5">
                    {item.degrees.map((deg, di) => (
                      <li
                        key={di}
                        className="flex items-baseline gap-2 text-sm md:text-[0.95rem]"
                      >
                        <span
                          className="shrink-0"
                          style={{
                            color: "var(--color-primary, #6366f1)",
                            fontSize: "0.5rem",
                            lineHeight: 1,
                          }}
                        >
                          ●
                        </span>
                        <span
                          style={{
                            color: "var(--color-foreground)",
                            opacity: 0.85,
                          }}
                        >
                          {deg.name}
                          {deg.honors ? (
                            <span
                              className="ml-1.5"
                              style={{
                                color: "var(--color-muted-foreground)",
                                opacity: 0.9,
                              }}
                            >
                              — {deg.honors}
                            </span>
                          ) : null}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
