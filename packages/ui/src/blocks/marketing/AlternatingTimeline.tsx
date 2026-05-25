"use client";

import type { ComponentProps, ReactNode } from "react";

import { cn } from "../../utils";

export type AlternatingTimelineItem = {
  id?: string;
  period?: ReactNode;
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  badge?: ReactNode;
  meta?: ReactNode;
  icon?: ReactNode;
  media?: ReactNode;
  className?: string;
  contentClassName?: string;
  mediaClassName?: string;
};

export interface AlternatingTimelineProps
  extends Omit<ComponentProps<"ol">, "children"> {
  items: AlternatingTimelineItem[];
  itemClassName?: string;
  contentClassName?: string;
  mediaClassName?: string;
  railClassName?: string;
  nodeClassName?: string;
  alternate?: boolean;
}

export function AlternatingTimeline({
  alternate = true,
  className,
  contentClassName,
  itemClassName,
  items,
  mediaClassName,
  nodeClassName,
  railClassName,
  ...props
}: AlternatingTimelineProps) {
  return (
    <ol
      className={cn("relative flex flex-col gap-8 md:gap-12", className)}
      data-slot="alternating-timeline"
      {...props}
    >
      {items.map((item, index) => {
        const isReversed = alternate && index % 2 === 1;
        const key = item.id ?? index;

        return (
          <li
            className={cn(
              "relative grid gap-5 pl-12 md:grid-cols-[minmax(0,1fr)_4.5rem_minmax(0,1fr)] md:gap-6 md:pl-0",
              itemClassName,
              item.className,
            )}
            data-orientation={isReversed ? "reverse" : "normal"}
            data-slot="alternating-timeline-item"
            key={key}
          >
            <div
              aria-hidden="true"
              className={cn(
                "absolute bottom-[-2rem] left-4 top-9 w-px bg-border md:bottom-[-3rem] md:left-1/2 md:top-12 md:-translate-x-1/2",
                index === items.length - 1 && "hidden",
                railClassName,
              )}
              data-slot="alternating-timeline-rail"
            />
            <div
              className={cn(
                "absolute left-0 top-1 flex size-8 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-sm md:static md:col-start-2 md:row-start-1 md:mx-auto md:mt-1 md:size-10",
                nodeClassName,
              )}
              data-slot="alternating-timeline-node"
            >
              {item.icon ? (
                item.icon
              ) : (
                <span
                  aria-hidden="true"
                  className="size-2 rounded-full bg-primary"
                  data-slot="alternating-timeline-dot"
                />
              )}
            </div>
            <article
              className={cn(
                "rounded-box border border-border bg-card p-5 text-card-foreground shadow-sm md:p-6",
                isReversed ? "md:col-start-3" : "md:col-start-1",
                contentClassName,
                item.contentClassName,
              )}
              data-slot="alternating-timeline-content"
            >
              <div className="flex flex-wrap items-center gap-2">
                {item.period ? (
                  <p
                    className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground"
                    data-slot="alternating-timeline-period"
                  >
                    {item.period}
                  </p>
                ) : null}
                {item.eyebrow ? (
                  <p
                    className="text-xs font-semibold uppercase tracking-[0.2em] text-primary"
                    data-slot="alternating-timeline-eyebrow"
                  >
                    {item.eyebrow}
                  </p>
                ) : null}
                {item.badge ? (
                  <span
                    className="inline-flex rounded-full border border-border px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground"
                    data-slot="alternating-timeline-badge"
                  >
                    {item.badge}
                  </span>
                ) : null}
              </div>
              <h3
                className="mt-4 text-2xl font-semibold leading-tight tracking-tight text-foreground"
                data-slot="alternating-timeline-title"
              >
                {item.title}
              </h3>
              {item.description ? (
                <p
                  className="mt-4 text-sm leading-6 text-muted-foreground"
                  data-slot="alternating-timeline-description"
                >
                  {item.description}
                </p>
              ) : null}
              {item.meta ? (
                <div
                  className="mt-5 border-t border-border pt-4 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground"
                  data-slot="alternating-timeline-meta"
                >
                  {item.meta}
                </div>
              ) : null}
            </article>
            {item.media ? (
              <div
                className={cn(
                  "overflow-hidden rounded-box border border-border bg-muted/40",
                  isReversed
                    ? "md:col-start-1 md:row-start-1"
                    : "md:col-start-3",
                  mediaClassName,
                  item.mediaClassName,
                )}
                data-slot="alternating-timeline-media"
              >
                {item.media}
              </div>
            ) : (
              <div
                aria-hidden="true"
                className={cn(
                  "hidden md:block",
                  isReversed
                    ? "md:col-start-1 md:row-start-1"
                    : "md:col-start-3",
                )}
                data-slot="alternating-timeline-spacer"
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
