"use client";

import { Quote } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect } from "react";
import {
  cx,
  hasWindow,
  type MarketingSectionPadding,
  type MarketingSectionTone,
  sectionPaddingClasses,
  sectionToneClasses,
} from "./aceternity/shared";
import { useMotionEnabled } from "./aceternity/useMotionEnabled";

const MARQUEE_STYLE_ID = "cb-infinite-testimonials-keyframes";

function injectMarqueeKeyframes() {
  if (!hasWindow() || document.getElementById(MARQUEE_STYLE_ID)) {
    return;
  }

  const style = document.createElement("style");
  style.id = MARQUEE_STYLE_ID;
  style.textContent = `
    @keyframes cb-marquee {
      from { transform: translateX(0); }
      to { transform: translateX(calc(-50% - 0.5rem)); }
    }
  `;
  document.head.appendChild(style);
}

export interface InfiniteTestimonialItem {
  id: string;
  quote: string;
  author: string;
  role?: string;
}

export interface InfiniteTestimonialsSectionProps {
  heading?: ReactNode;
  subheading?: ReactNode;
  testimonials: InfiniteTestimonialItem[];
  speedSeconds?: number;
  tone?: MarketingSectionTone;
  padding?: MarketingSectionPadding;
  className?: string;
}

export function InfiniteTestimonialsSection({
  heading = "Loved by teams shipping quickly",
  subheading,
  testimonials,
  speedSeconds = 28,
  tone = "default",
  padding = "lg",
  className,
}: InfiniteTestimonialsSectionProps) {
  const motionEnabled = useMotionEnabled();
  const items =
    testimonials.length > 0 ? [...testimonials, ...testimonials] : [];

  useEffect(() => {
    injectMarqueeKeyframes();
  }, []);

  return (
    <section
      className={cx(
        "overflow-hidden",
        sectionToneClasses[tone],
        sectionPaddingClasses[padding],
        className,
      )}
      data-slot="infinite-testimonials-section"
    >
      <div className="container mx-auto px-4">
        {heading ? (
          <div className="mx-auto mb-8 max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              {heading}
            </h2>
            {subheading ? (
              <p className="mt-3 text-muted-foreground">{subheading}</p>
            ) : null}
          </div>
        ) : null}

        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-14 bg-linear-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-14 bg-linear-to-l from-background to-transparent" />

          <div
            className="flex w-max gap-4"
            style={{
              animation: motionEnabled
                ? `cb-marquee ${speedSeconds}s linear infinite`
                : "none",
            }}
          >
            {items.map((testimonial, index) => (
              <article
                key={`${testimonial.id}-${index}`}
                className="w-[20rem] shrink-0 rounded-xl border border-border/70 bg-card p-5"
              >
                <Quote
                  className="mb-3 h-5 w-5 text-primary/60"
                  aria-hidden="true"
                />
                <p className="text-sm leading-6 text-foreground">
                  {testimonial.quote}
                </p>
                <p className="mt-4 text-sm font-medium text-foreground">
                  {testimonial.author}
                </p>
                {testimonial.role ? (
                  <p className="text-xs text-muted-foreground">
                    {testimonial.role}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
