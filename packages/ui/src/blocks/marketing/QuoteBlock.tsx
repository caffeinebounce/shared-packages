"use client";

import { cn } from "../../utils";

export interface QuoteBlockProps {
  quote: string;
  attribution?: string;
  /** Decorative accent line above quote */
  accentClassName?: string;
  className?: string;
}

export function QuoteBlock({
  quote,
  attribution,
  accentClassName,
  className,
}: QuoteBlockProps) {
  return (
    <figure
      className={cn(
        "mx-auto max-w-3xl rounded-box border border-white/10 bg-white/5 px-6 py-10 text-center md:px-10",
        className,
      )}
    >
      <div
        className={cn("mx-auto mb-6 h-px w-16 bg-white/30", accentClassName)}
      />

      <blockquote className="font-serif text-2xl leading-relaxed text-white md:text-3xl">
        “{quote}”
      </blockquote>

      {attribution ? (
        <figcaption className="mt-6 text-sm font-medium tracking-wide text-white/70">
          — {attribution}
        </figcaption>
      ) : null}
    </figure>
  );
}
