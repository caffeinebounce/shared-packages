"use client";

import type { ReactNode } from "react";

import { Container, type ContainerSize } from "../../components/ui/container";
import {
  cx,
  type MarketingSectionPadding,
  type MarketingSectionTone,
  sectionPaddingClasses,
  sectionToneClasses,
} from "./aceternity/shared";

export interface SectionShellProps {
  eyebrow?: ReactNode;
  heading?: ReactNode;
  intro?: ReactNode;
  children?: ReactNode;
  className?: string;
  contentClassName?: string;
  headerClassName?: string;
  tone?: MarketingSectionTone;
  padding?: MarketingSectionPadding;
  containerSize?: ContainerSize;
  headingLevel?: "h1" | "h2" | "h3";
}

export function SectionShell({
  eyebrow,
  heading,
  intro,
  children,
  className,
  contentClassName,
  headerClassName,
  tone = "default",
  padding = "lg",
  containerSize = "default",
  headingLevel = "h2",
}: SectionShellProps) {
  const Heading = headingLevel;

  return (
    <section
      className={cx(
        sectionToneClasses[tone],
        sectionPaddingClasses[padding],
        className,
      )}
      data-slot="section-shell"
    >
      <Container size={containerSize}>
        {(eyebrow || heading || intro) && (
          <div
            className={cx("max-w-3xl space-y-4", headerClassName)}
            data-slot="section-shell-header"
          >
            {eyebrow ? (
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
                {eyebrow}
              </p>
            ) : null}
            {heading ? (
              <Heading className="text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
                {heading}
              </Heading>
            ) : null}
            {intro ? (
              <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
                {intro}
              </p>
            ) : null}
          </div>
        )}

        {children ? (
          <div
            className={cx("mt-10", contentClassName)}
            data-slot="section-shell-content"
          >
            {children}
          </div>
        ) : null}
      </Container>
    </section>
  );
}
