"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  clamp,
  cx,
  hasWindow,
  type MarketingSectionPadding,
  type MarketingSectionTone,
  sectionPaddingClasses,
  sectionToneClasses,
} from "./aceternity/shared";

export interface StickyScrollStoryItem {
  id: string;
  title: ReactNode;
  body: ReactNode;
  visual?: ReactNode;
}

export interface StickyScrollStorySectionProps {
  heading?: ReactNode;
  subheading?: ReactNode;
  items: StickyScrollStoryItem[];
  defaultActiveIndex?: number;
  tone?: MarketingSectionTone;
  padding?: MarketingSectionPadding;
  className?: string;
}

export function StickyScrollStorySection({
  heading,
  subheading,
  items,
  defaultActiveIndex = 0,
  tone = "default",
  padding = "lg",
  className,
}: StickyScrollStorySectionProps) {
  const [activeIndex, setActiveIndex] = useState(
    clamp(defaultActiveIndex, 0, Math.max(items.length - 1, 0)),
  );
  const refs = useRef<Array<HTMLElement | null>>([]);

  const activeItem = useMemo(() => items[activeIndex], [items, activeIndex]);

  useEffect(() => {
    setActiveIndex((current) => {
      const max = Math.max(items.length - 1, 0);
      const fromDefault = clamp(defaultActiveIndex, 0, max);
      return current > max ? fromDefault : current;
    });
  }, [defaultActiveIndex, items.length]);

  useEffect(() => {
    if (!hasWindow() || items.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) {
            continue;
          }
          const index = Number(entry.target.getAttribute("data-index"));
          if (!Number.isNaN(index)) {
            setActiveIndex(clamp(index, 0, items.length - 1));
          }
        }
      },
      { rootMargin: "-35% 0px -50% 0px", threshold: 0.1 },
    );

    for (const element of refs.current) {
      if (element) {
        observer.observe(element);
      }
    }

    return () => observer.disconnect();
  }, [items.length]);

  return (
    <section
      className={cx(
        sectionToneClasses[tone],
        sectionPaddingClasses[padding],
        className,
      )}
      data-slot="sticky-scroll-story-section"
    >
      <div className="container mx-auto px-4">
        {heading ? (
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              {heading}
            </h2>
            {subheading ? (
              <p className="mt-3 text-muted-foreground">{subheading}</p>
            ) : null}
          </div>
        ) : null}

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            {items.map((item, index) => {
              const isActive = index === activeIndex;
              return (
                <article
                  key={item.id}
                  ref={(element) => {
                    refs.current[index] = element;
                  }}
                  data-index={index}
                  className={cx(
                    "rounded-xl border p-5 transition-colors",
                    isActive
                      ? "border-primary bg-card"
                      : "border-border/70 bg-card/50",
                  )}
                >
                  <h3 className="text-lg font-medium text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {item.body}
                  </p>
                </article>
              );
            })}
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-border/70 bg-card p-6 min-h-60">
              {activeItem?.visual ?? (
                <div className="flex h-full min-h-44 items-center justify-center text-sm text-muted-foreground">
                  Scroll the story to preview this step.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
