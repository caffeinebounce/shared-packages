import type { ReactNode } from "react";
import { Button } from "../../components/ui/button";
import { Container } from "../../components/ui/container";
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
  eyebrow?: ReactNode;
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

export interface CTAWithDashedGridLinesProps
  extends CtaWithDashedGridLinesProps {}

export function CTAWithDashedGridLines({
  eyebrow,
  heading = "Ship products with the speed of light",
  highlightedHeading,
  description = "Get the best in class support for the most advanced products.",
  primaryAction,
  secondaryAction,
  quote = '"This is the best product ever when it comes to shipping. Ten on ten recommended. I just can\'t wait to see what happens with this product."',
  quoteAuthor = "Michael Scarn",
  quoteRole = "Side projects builder",
  className,
}: CTAWithDashedGridLinesProps) {
  return (
    <section className={cn("py-16 md:py-24", className)}>
      <Container>
        <div
          className="relative rounded-box bg-background"
          data-slot="cta-dashed-shell"
        >
          <GridLineHorizontal className="top-0" />
          <GridLineHorizontal className="bottom-0" />
          <GridLineVertical className="left-0" />
          <GridLineVertical className="right-0" />

          <div
            className="grid overflow-hidden rounded-box md:grid-cols-[minmax(0,1.7fr)_minmax(18rem,0.95fr)]"
            data-slot="cta-dashed-grid"
          >
            <div className="p-8 md:p-12">
              {eyebrow ? <div className="mb-4">{eyebrow}</div> : null}

              <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
                {heading}{" "}
                {highlightedHeading ? (
                  <span className="text-primary">{highlightedHeading}</span>
                ) : null}
              </h2>
              <p className="mt-4 max-w-2xl text-muted-foreground">
                {description}
              </p>

              {primaryAction || secondaryAction ? (
                <div className="mt-8 flex flex-wrap gap-3">
                  {primaryAction ? (
                    <Button asChild>
                      <a href={primaryAction.href}>{primaryAction.label}</a>
                    </Button>
                  ) : null}
                  {secondaryAction ? (
                    <Button asChild variant="outline">
                      <a href={secondaryAction.href}>{secondaryAction.label}</a>
                    </Button>
                  ) : null}
                </div>
              ) : null}
            </div>

            <aside className="flex flex-col justify-center gap-7 border-t border-dashed border-border/70 p-8 md:border-t-0 md:border-l md:p-12">
              <blockquote className="max-w-md font-serif text-lg leading-[1.7] text-foreground/92 md:text-[1.35rem]">
                {quote}
              </blockquote>
              <footer className="space-y-1">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-foreground/88">
                  {quoteAuthor}
                </p>
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  {quoteRole}
                </p>
              </footer>
            </aside>
          </div>
        </div>
      </Container>
    </section>
  );
}

/**
 * @deprecated Use `CTAWithDashedGridLines`.
 */
export const CtaWithDashedGridLines = CTAWithDashedGridLines;
