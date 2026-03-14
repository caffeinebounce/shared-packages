"use client";

import { useState } from "react";
import { cn } from "../../utils";

export interface DisclosureItem {
  /** Anchor id for deep-linking from deal pages */
  id: string;
  /** Short label — e.g. "1", "2", "†" */
  label?: string;
  /** The disclosure copy */
  text: string;
}

export interface DisclosureFootnotesProps {
  disclosures: DisclosureItem[];
  /** "compact" collapses to first 3 on mobile with a "Show all" toggle. "full" shows everything. Default: "compact" */
  variant?: "compact" | "full";
  className?: string;
}

export function DisclosureFootnotes({
  disclosures,
  variant = "compact",
  className,
}: DisclosureFootnotesProps) {
  const [expanded, setExpanded] = useState(false);

  if (disclosures.length === 0) return null;

  const COLLAPSE_THRESHOLD = 3;
  const shouldCollapse =
    variant === "compact" && disclosures.length > COLLAPSE_THRESHOLD;
  const visibleDisclosures =
    shouldCollapse && !expanded
      ? disclosures.slice(0, COLLAPSE_THRESHOLD)
      : disclosures;

  return (
    <section
      className={cn("border-t border-white/[0.06] py-8", className)}
      aria-label="Important disclosures"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
          Important Disclosures
        </h2>
        <ol className="list-none space-y-3">
          {visibleDisclosures.map((d, i) => (
            <li
              key={d.id}
              id={d.id}
              className="flex gap-2 text-xs leading-relaxed text-muted-foreground/70"
            >
              <span className="shrink-0 font-medium text-muted-foreground/50">
                {d.label ?? `${i + 1}.`}
              </span>
              <span>{d.text}</span>
            </li>
          ))}
        </ol>
        {shouldCollapse && !expanded && (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="mt-3 text-xs text-muted-foreground/50 underline underline-offset-2 transition-colors hover:text-muted-foreground"
          >
            Show all disclosures ({disclosures.length})
          </button>
        )}
      </div>
    </section>
  );
}
