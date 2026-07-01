"use client";

import type { ReactNode } from "react";

import { EditorialHero, type EditorialHeroProps } from "./EditorialHero";
import {
  type SpotlightHeroAction,
  SpotlightHeroSection,
  type SpotlightHeroSectionProps,
} from "./SpotlightHeroSection";

export interface PageHeroAction extends SpotlightHeroAction {}

export interface PageHeroMedia {
  alt: string;
  badge?: ReactNode;
  callout?: EditorialHeroProps["media"]["callout"];
  focalPoint?: EditorialHeroProps["media"]["focalPoint"];
  height: number;
  pixelatedCanvas?: boolean;
  pixelatedCanvasProps?: EditorialHeroProps["media"]["pixelatedCanvasProps"];
  src: string;
  width: number;
}

export interface PageHeroProps {
  variant?: "editorial" | "spotlight";
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: PageHeroAction[];
  media?: PageHeroMedia;
  className?: string;
  containerClassName?: string;
  contentClassName?: string;
  headingLevel?: SpotlightHeroSectionProps["headingLevel"];
  tone?: SpotlightHeroSectionProps["tone"];
  padding?: SpotlightHeroSectionProps["padding"];
}

export function PageHero({
  variant = "spotlight",
  eyebrow,
  title,
  description,
  actions = [],
  media,
  className,
  containerClassName,
  contentClassName,
  headingLevel = "h1",
  tone = "default",
  padding = "lg",
}: PageHeroProps) {
  if (variant === "editorial") {
    if (!media) {
      throw new Error("PageHero editorial variant requires media.");
    }

    const editorialActions = actions.map((action) => ({
      ...action,
      variant: action.variant === "secondary" ? "outline" : action.variant,
    }));

    return (
      <EditorialHero
        eyebrow={eyebrow}
        heading={title}
        description={description}
        actions={editorialActions}
        media={media}
        className={className}
        containerClassName={containerClassName}
        contentClassName={contentClassName}
      />
    );
  }

  return (
    <SpotlightHeroSection
      eyebrow={eyebrow}
      heading={title}
      subheading={description}
      actions={actions}
      headingLevel={headingLevel}
      tone={tone}
      padding={padding}
      className={className}
    />
  );
}
