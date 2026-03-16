import type { ReactNode } from "react";
import { Button } from "../../components/ui/button";
import {
  cx,
  type MarketingSectionPadding,
  type MarketingSectionTone,
  sectionPaddingClasses,
  sectionToneClasses,
} from "./aceternity/shared";

export interface HoverBorderCTAItem {
  id: string;
  title: ReactNode;
  description: ReactNode;
  href: string;
  ctaLabel: string;
}

export interface HoverBorderCTAGroupProps {
  heading?: ReactNode;
  items: HoverBorderCTAItem[];
  tone?: MarketingSectionTone;
  padding?: MarketingSectionPadding;
  className?: string;
}

export function HoverBorderCTAGroup({
  heading,
  items,
  tone = "default",
  padding = "md",
  className,
}: HoverBorderCTAGroupProps) {
  return (
    <section
      className={cx(
        sectionToneClasses[tone],
        sectionPaddingClasses[padding],
        className,
      )}
      data-slot="hover-border-cta-group"
    >
      <div className="container mx-auto px-4">
        {heading ? (
          <h2 className="mb-6 text-center text-2xl font-semibold text-foreground md:text-3xl">
            {heading}
          </h2>
        ) : null}

        <div className="grid gap-4 md:grid-cols-3">
          {items.map((item) => (
            <article
              key={item.id}
              className="group relative overflow-hidden rounded-xl border border-border/60 bg-card p-5"
            >
              <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="absolute inset-0 rounded-xl border border-primary/60" />
                <div className="absolute -inset-px rounded-xl bg-linear-to-r from-primary/0 via-primary/20 to-primary/0 blur-md" />
              </div>

              <div className="relative z-10">
                <h3 className="text-lg font-medium text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {item.description}
                </p>
                <div className="mt-4">
                  <Button asChild size="sm">
                    <a href={item.href}>{item.ctaLabel}</a>
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
