"use client";

import type { ReactNode } from "react";

import { Button } from "../../components/ui/button";
import { Container } from "../../components/ui/container";
import { cn } from "../../utils";
import { FocalMediaFrame } from "./FocalMediaFrame";

interface EditorialHeroAction {
  className?: string;
  href: string;
  label: string;
  variant?: "default" | "outline";
}

interface EditorialHeroSignal {
  description: ReactNode;
  title: ReactNode;
}

interface EditorialHeroCallout {
  content: ReactNode;
  eyebrow?: ReactNode;
}

interface EditorialHeroMedia {
  alt: string;
  badge?: ReactNode;
  callout?: EditorialHeroCallout;
  focalPoint?: {
    x: number;
    y: number;
  };
  height: number;
  src: string;
  width: number;
}

export interface EditorialHeroProps {
  actions?: EditorialHeroAction[];
  className?: string;
  containerClassName?: string;
  contentClassName?: string;
  description?: ReactNode;
  eyebrow?: ReactNode;
  heading: ReactNode;
  media: EditorialHeroMedia;
  mediaBadgeClassName?: string;
  mediaCalloutClassName?: string;
  mediaClassName?: string;
  signalCardClassName?: string;
  signals?: EditorialHeroSignal[];
}

function renderNode(
  value: ReactNode,
  className: string,
  Component: "div" | "h1" | "p" = "p",
) {
  if (value === null || value === undefined) {
    return null;
  }

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return <Component className={className}>{value}</Component>;
  }

  return value;
}

function EditorialHeroCalloutContent({
  callout,
}: {
  callout: EditorialHeroCallout;
}) {
  return (
    <>
      {callout.eyebrow
        ? renderNode(
            callout.eyebrow,
            "text-xs font-medium uppercase tracking-[0.22em] text-primary/75",
          )
        : null}
      {renderNode(
        callout.content,
        "mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base",
        "div",
      )}
    </>
  );
}

export function EditorialHero({
  actions = [],
  className,
  containerClassName,
  contentClassName,
  description,
  eyebrow,
  heading,
  media,
  mediaBadgeClassName,
  mediaCalloutClassName,
  mediaClassName,
  signalCardClassName,
  signals = [],
}: EditorialHeroProps) {
  const renderMediaFrame = (desktop: boolean) => (
    <FocalMediaFrame
      alt={media.alt}
      className={cn(
        "h-[24rem] w-full rounded-xl border border-border/70 bg-card shadow-lg md:h-[28rem] lg:h-full lg:min-h-[32rem]",
        mediaClassName,
      )}
      focalPoint={media.focalPoint}
      height={media.height}
      src={media.src}
      width={media.width}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent opacity-90" />

      {media.badge ? (
        <div
          className={cn(
            "absolute left-4 top-4 z-10 rounded-lg border border-border/70 bg-background/85 px-3 py-2 text-xs font-medium uppercase tracking-[0.18em] text-foreground/85 shadow-sm backdrop-blur",
            mediaBadgeClassName,
          )}
          data-slot={
            desktop
              ? "editorial-hero-media-badge-desktop"
              : "editorial-hero-media-badge-mobile"
          }
        >
          {renderNode(media.badge, "", "div")}
        </div>
      ) : null}

      {desktop && media.callout ? (
        <div
          className={cn(
            "absolute inset-x-6 bottom-6 z-10 rounded-xl border border-border/70 bg-background/88 p-5 shadow-lg backdrop-blur",
            mediaCalloutClassName,
          )}
          data-slot="editorial-hero-callout-desktop"
        >
          <EditorialHeroCalloutContent callout={media.callout} />
        </div>
      ) : null}
    </FocalMediaFrame>
  );

  return (
    <section className={cn("w-full", className)} data-slot="editorial-hero">
      <Container
        className={cn(
          "grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-stretch",
          containerClassName,
        )}
      >
        <div
          className={cn("flex flex-col gap-6 lg:pr-6", contentClassName)}
          data-slot="editorial-hero-content"
        >
          <div className="space-y-6" data-slot="editorial-hero-copy">
            {eyebrow
              ? renderNode(
                  eyebrow,
                  "text-sm font-medium uppercase tracking-[0.24em] text-primary/80",
                )
              : null}
            {renderNode(
              heading,
              "max-w-4xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl",
              "h1",
            )}
            {description
              ? renderNode(
                  description,
                  "max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg lg:text-xl",
                )
              : null}
          </div>

          <div className="lg:hidden" data-slot="editorial-hero-media-mobile">
            {renderMediaFrame(false)}
          </div>

          {media.callout ? (
            <div
              className={cn(
                "rounded-xl border border-border/70 bg-card/90 p-5 shadow-sm backdrop-blur lg:hidden",
                mediaCalloutClassName,
              )}
              data-slot="editorial-hero-callout-mobile"
            >
              <EditorialHeroCalloutContent callout={media.callout} />
            </div>
          ) : null}

          {actions.length > 0 ? (
            <div
              className="grid gap-3 sm:mx-auto sm:max-w-[34rem] sm:grid-cols-2 lg:mx-0"
              data-slot="editorial-hero-actions"
            >
              {actions.map((action, index) => (
                <Button
                  key={`${action.href}-${action.label}`}
                  asChild
                  className={cn(
                    "min-h-12 w-full justify-center text-center",
                    index === 0 ? "sm:col-span-2" : undefined,
                    action.className,
                  )}
                  variant={action.variant ?? "default"}
                >
                  <a href={action.href}>{action.label}</a>
                </Button>
              ))}
            </div>
          ) : null}

          {signals.length > 0 ? (
            <div
              className="grid gap-4 sm:grid-cols-2 md:grid-cols-3"
              data-slot="editorial-hero-signals"
            >
              {signals.map((signal, index) => (
                <div
                  key={`signal-${index}`}
                  className={cn(
                    "rounded-xl border border-border/70 bg-card/70 p-5 shadow-sm",
                    signalCardClassName,
                  )}
                  data-slot="editorial-hero-signal"
                >
                  {renderNode(
                    signal.title,
                    "text-sm font-medium uppercase tracking-[0.2em] text-primary/80",
                  )}
                  {renderNode(
                    signal.description,
                    "mt-3 text-sm leading-relaxed text-muted-foreground",
                  )}
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div
          className="hidden lg:block lg:h-full lg:self-stretch"
          data-slot="editorial-hero-media-desktop"
        >
          {renderMediaFrame(true)}
        </div>
      </Container>
    </section>
  );
}
