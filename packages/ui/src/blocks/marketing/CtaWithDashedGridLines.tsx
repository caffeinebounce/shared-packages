import type { ReactNode } from "react";
import { Button } from "../../components/ui/button";
import { cn } from "../../utils";

interface GridLineProps {
  offset?: number;
  className?: string;
}

function GridLineHorizontal({ offset = 32, className }: GridLineProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute h-px", className)}
      style={{
        left: -offset,
        right: -offset,
        backgroundImage:
          "repeating-linear-gradient(to right, color-mix(in oklab, var(--border) 70%, transparent) 0 6px, transparent 6px 12px)",
        maskImage:
          "linear-gradient(to right, transparent 0%, black 16%, black 84%, transparent 100%)",
      }}
    />
  );
}

function GridLineVertical({ offset = 32, className }: GridLineProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute w-px", className)}
      style={{
        top: -offset,
        bottom: -offset,
        backgroundImage:
          "repeating-linear-gradient(to bottom, color-mix(in oklab, var(--border) 70%, transparent) 0 6px, transparent 6px 12px)",
        maskImage:
          "linear-gradient(to bottom, transparent 0%, black 16%, black 84%, transparent 100%)",
      }}
    />
  );
}

export interface CtaWithDashedGridLinesProps {
  heading?: ReactNode;
  highlightedHeading?: ReactNode;
  description?: ReactNode;
  primaryAction?: {
    label: string;
    href: string;
  };
  secondaryAction?: {
    label: string;
    href: string;
  };
  quote?: ReactNode;
  quoteAuthor?: ReactNode;
  quoteRole?: ReactNode;
  className?: string;
}

export function CtaWithDashedGridLines({
  heading = "Ship products with the speed of light",
  highlightedHeading,
  description = "Get the best in class support for the most advanced products.",
  primaryAction = { label: "Buy now", href: "#" },
  secondaryAction = { label: "Talk to us", href: "#" },
  quote = '"This is the best product ever when it comes to shipping. Ten on ten recommended. I just can\'t wait to see what happens with this product."',
  quoteAuthor = "Michael Scarn",
  quoteRole = "Side projects builder",
  className,
}: CtaWithDashedGridLinesProps) {
  return (
    <section className={cn("py-16 md:py-24", className)}>
      <div className="container mx-auto px-4">
        <div className="relative rounded-2xl border border-border/80 bg-background">
          <GridLineHorizontal className="top-0" />
          <GridLineHorizontal className="bottom-0" />
          <GridLineVertical className="left-0" />
          <GridLineVertical className="right-0" />

          <div className="grid overflow-hidden rounded-2xl md:grid-cols-3">
            <div className="p-8 md:col-span-2 md:p-12">
              <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
                {heading}{" "}
                {highlightedHeading ? (
                  <span className="text-primary">{highlightedHeading}</span>
                ) : null}
              </h2>
              <p className="mt-4 max-w-2xl text-muted-foreground">
                {description}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild>
                  <a href={primaryAction.href}>{primaryAction.label}</a>
                </Button>
                <Button asChild variant="outline">
                  <a href={secondaryAction.href}>{secondaryAction.label}</a>
                </Button>
              </div>
            </div>

            <aside className="border-t border-dashed border-border/70 p-8 md:border-t-0 md:border-l md:p-10">
              <blockquote className="text-sm leading-7 text-foreground/90">
                {quote}
              </blockquote>
              <footer className="mt-6">
                <p className="font-medium text-foreground">{quoteAuthor}</p>
                <p className="text-xs text-muted-foreground">{quoteRole}</p>
              </footer>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
