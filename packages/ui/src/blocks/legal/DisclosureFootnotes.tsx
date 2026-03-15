"use client";

import { ChevronDown } from "lucide-react";
import { useId, useState } from "react";
import { cn } from "../../utils";

export interface DisclosureItem {
  /** Anchor id for deep-linking from deal pages */
  id: string;
  /** Short label — e.g. "1", "2", "†" */
  label?: string;
  /** The disclosure copy */
  text: string;
  /** Opt-in hide — defaults to false (shown). Set true to suppress this item. */
  hidden?: boolean;
}

export interface DisclosureFootnotesProps {
  disclosures: DisclosureItem[];
  /** "compact" collapses to first 3 on mobile with a "Show all" toggle. "full" shows everything. Default: "compact" */
  variant?: "compact" | "full";
  /** "tray" renders a collapsed disclosure tray on mobile and uses inline disclosures from sm+ upward. Default: "inline" */
  mobileBehavior?: "inline" | "tray";
  className?: string;
}

const COLLAPSE_THRESHOLD = 3;

function DisclosureList({
  disclosures,
  startIndex = 0,
}: {
  disclosures: DisclosureItem[];
  startIndex?: number;
}) {
  return (
    <ol className="list-none space-y-3">
      {disclosures.map((d, index) => (
        <li
          key={d.id}
          id={d.id}
          className="flex gap-2 text-xs leading-relaxed text-muted-foreground/70"
        >
          <span className="shrink-0 font-medium text-muted-foreground/50">
            {d.label ?? `${startIndex + index + 1}.`}
          </span>
          <span>{d.text}</span>
        </li>
      ))}
    </ol>
  );
}

export function DisclosureFootnotes({
  disclosures,
  variant = "compact",
  mobileBehavior = "inline",
  className,
}: DisclosureFootnotesProps) {
  const [expanded, setExpanded] = useState(false);
  const [trayExpanded, setTrayExpanded] = useState(false);
  const trayPanelId = useId();

  const activeDisclosures = disclosures.filter((d) => !d.hidden);

  if (activeDisclosures.length === 0) return null;

  const shouldCollapse =
    variant === "compact" && activeDisclosures.length > COLLAPSE_THRESHOLD;
  const inlineDisclosures =
    shouldCollapse && !expanded
      ? activeDisclosures.slice(0, COLLAPSE_THRESHOLD)
      : activeDisclosures;
  const trayCountLabel = `${activeDisclosures.length} disclosure${
    activeDisclosures.length === 1 ? "" : "s"
  }`;

  return (
    <section
      className={cn("border-t border-white/[0.06] py-8", className)}
      aria-label="Important disclosures"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {mobileBehavior === "tray" ? (
          <div className="sm:hidden" data-slot="disclosure-tray">
            <button
              type="button"
              data-slot="disclosure-tray-trigger"
              aria-expanded={trayExpanded}
              aria-controls={trayPanelId}
              onClick={() => setTrayExpanded((current) => !current)}
              className="group flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-left transition-colors hover:border-white/14 hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
            >
              <span className="space-y-1">
                <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground/60">
                  Important Disclosures
                </span>
                <span className="block text-sm text-muted-foreground/78">
                  {trayExpanded
                    ? "Hide legal footnotes"
                    : `Show ${trayCountLabel}`}
                </span>
              </span>
              <ChevronDown
                className={cn(
                  "size-4 shrink-0 text-muted-foreground/65 transition-transform duration-200 motion-reduce:transition-none",
                  trayExpanded && "rotate-180",
                )}
                aria-hidden
              />
            </button>
            <div
              id={trayPanelId}
              data-slot="disclosure-tray-panel"
              hidden={!trayExpanded}
              className="mt-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-4"
            >
              <DisclosureList disclosures={activeDisclosures} />
            </div>
          </div>
        ) : null}

        <div
          className={cn(
            mobileBehavior === "tray" ? "hidden sm:block" : undefined,
          )}
          data-slot="disclosure-inline-panel"
        >
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
            Important Disclosures
          </h2>
          <DisclosureList disclosures={inlineDisclosures} />
          {shouldCollapse && !expanded && (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="mt-3 text-xs text-muted-foreground/50 underline underline-offset-2 transition-colors hover:text-muted-foreground"
            >
              Show all disclosures ({activeDisclosures.length})
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
