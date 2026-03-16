"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import {
  clamp,
  cx,
  hasWindow,
  type MarketingSectionPadding,
  type MarketingSectionTone,
  sectionPaddingClasses,
  sectionToneClasses,
} from "./aceternity/shared";
import { useMotionEnabled } from "./aceternity/useMotionEnabled";

export interface TracingBeamContentItem {
  id: string;
  title: ReactNode;
  body: ReactNode;
}

export interface TracingBeamContentSectionProps {
  heading?: ReactNode;
  subheading?: ReactNode;
  items: TracingBeamContentItem[];
  tone?: MarketingSectionTone;
  padding?: MarketingSectionPadding;
  className?: string;
}

export function TracingBeamContentSection({
  heading,
  subheading,
  items,
  tone = "default",
  padding = "lg",
  className,
}: TracingBeamContentSectionProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [progress, setProgress] = useState(0);
  const motionEnabled = useMotionEnabled();

  useEffect(() => {
    if (!hasWindow() || !motionEnabled) {
      return;
    }

    const update = () => {
      const container = containerRef.current;
      if (!container) {
        return;
      }
      const rect = container.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const traveled = viewportHeight - rect.top;
      const total = rect.height + viewportHeight * 0.35;
      setProgress(clamp(traveled / total, 0, 1));
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [motionEnabled]);

  return (
    <section
      className={cx(
        sectionToneClasses[tone],
        sectionPaddingClasses[padding],
        className,
      )}
      data-slot="tracing-beam-content-section"
    >
      <div ref={containerRef} className="container mx-auto px-4">
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

        <div className="relative mx-auto max-w-3xl pl-8">
          <div
            className="absolute left-3 top-0 h-full w-px bg-border"
            aria-hidden="true"
          />
          <div
            className="absolute left-[0.58rem] top-0 h-3 w-3 rounded-full border border-primary/40 bg-primary"
            style={{
              transform: `translateY(calc(${progress} * (100% - 0.75rem)))`,
            }}
            aria-hidden="true"
          />

          <div className="space-y-8">
            {items.map((item) => (
              <article
                key={item.id}
                className="rounded-xl border border-border/70 bg-card p-5"
              >
                <h3 className="text-lg font-medium text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {item.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
