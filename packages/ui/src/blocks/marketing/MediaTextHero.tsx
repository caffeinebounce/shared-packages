"use client";

import type { CSSProperties, ReactNode } from "react";

import { Container } from "../../components/ui/container";
import type { PixelatedCanvasProps } from "../../components/ui/pixelated-canvas";
import { cn } from "../../utils";
import { FocalMediaFrame } from "./FocalMediaFrame";

interface MediaTextHeroMedia {
  alt: string;
  focalPoint?: {
    x: number;
    y: number;
  };
  height: number;
  pixelatedCanvas?: boolean;
  pixelatedFallbackSrc?: string;
  pixelatedCanvasProps?: Partial<
    Omit<PixelatedCanvasProps, "alt" | "height" | "src" | "width">
  >;
  src: string;
  width: number;
}

export interface MediaTextHeroProps {
  className?: string;
  containerClassName?: string;
  contentClassName?: string;
  description?: ReactNode;
  eyebrow?: ReactNode;
  heading: ReactNode;
  headingLevel?: "h1" | "h2" | "h3";
  media: MediaTextHeroMedia;
  mediaClassName?: string;
  mediaPosition?: "start" | "end";
  mobileTopInset?: string;
}

function renderNode(
  value: ReactNode,
  className: string,
  Component: "div" | "h1" | "h2" | "h3" | "p" = "p",
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

export function MediaTextHero({
  className,
  containerClassName,
  contentClassName,
  description,
  eyebrow,
  heading,
  headingLevel = "h1",
  media,
  mediaClassName,
  mediaPosition = "start",
  mobileTopInset,
}: MediaTextHeroProps) {
  const Heading = headingLevel;
  const heroStyle = {
    "--media-text-hero-mobile-top-inset": mobileTopInset ?? "0px",
  } as CSSProperties;
  const mediaMaxWidth = `${Math.min(media.width, 420)}px`;
  const mediaPaneStyle = {
    maxWidth: "100%",
    width: mediaMaxWidth,
  } as CSSProperties;

  const mediaPane = (
    <div
      className="mx-auto shrink-0 md:mx-0"
      data-slot="media-text-hero-media-pane"
      style={mediaPaneStyle}
    >
      <div
        className="w-full"
        data-slot="media-text-hero-media"
        style={{
          aspectRatio: `${media.width} / ${media.height}`,
        }}
      >
        <FocalMediaFrame
          alt={media.alt}
          className={cn(
            "h-full w-full rounded-box border border-border/70 bg-card shadow-lg",
            mediaClassName,
          )}
          focalPoint={media.focalPoint}
          height={media.height}
          pixelatedCanvas={media.pixelatedCanvas ?? false}
          pixelatedFallbackSrc={media.pixelatedFallbackSrc}
          pixelatedCanvasProps={media.pixelatedCanvasProps}
          src={media.src}
          width={media.width}
        />
      </div>
    </div>
  );

  const copyPane = (
    <div
      className={cn(
        "flex w-full flex-col gap-4 text-center md:text-left",
        contentClassName,
      )}
      data-slot="media-text-hero-content"
    >
      {eyebrow
        ? renderNode(
            eyebrow,
            "text-sm font-medium uppercase tracking-[0.24em] text-primary",
          )
        : null}
      {renderNode(
        heading,
        "text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl",
        Heading,
      )}
      {description
        ? renderNode(
            description,
            "text-lg leading-relaxed text-muted-foreground",
          )
        : null}
    </div>
  );

  return (
    <section
      className={cn(
        "relative flex items-start overflow-hidden py-12 md:items-center md:py-16",
        className,
      )}
      data-position={mediaPosition}
      data-slot="media-text-hero"
      style={heroStyle}
    >
      <Container
        className={cn(
          "mt-[var(--media-text-hero-mobile-top-inset)] grid w-full gap-12 md:mt-0 md:items-center md:gap-16",
          mediaPosition === "start"
            ? "md:grid-cols-[auto_minmax(0,1fr)]"
            : "md:grid-cols-[minmax(0,1fr)_auto]",
          containerClassName,
        )}
        data-slot="media-text-hero-container"
      >
        {mediaPosition === "start" ? (
          <>
            {mediaPane}
            {copyPane}
          </>
        ) : (
          <>
            {copyPane}
            {mediaPane}
          </>
        )}
      </Container>
    </section>
  );
}
