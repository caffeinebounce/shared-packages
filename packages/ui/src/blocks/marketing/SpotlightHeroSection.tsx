"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { Button } from "../../components/ui/button";
import {
  cx,
  type MarketingSectionPadding,
  type MarketingSectionTone,
  sectionPaddingClasses,
  sectionToneClasses,
} from "./aceternity/shared";
import { useMotionEnabled } from "./aceternity/useMotionEnabled";

export interface SpotlightHeroAction {
  href: string;
  label: string;
  variant?: "default" | "secondary" | "outline";
}

export interface SpotlightHeroSectionProps {
  eyebrow?: ReactNode;
  heading: ReactNode;
  subheading?: ReactNode;
  actions?: SpotlightHeroAction[];
  tone?: MarketingSectionTone;
  padding?: MarketingSectionPadding;
  className?: string;
}

export function SpotlightHeroSection({
  eyebrow,
  heading,
  subheading,
  actions = [],
  tone = "default",
  padding = "lg",
  className,
}: SpotlightHeroSectionProps) {
  const motionEnabled = useMotionEnabled();

  return (
    <section
      className={cx(
        "relative overflow-hidden",
        sectionToneClasses[tone],
        sectionPaddingClasses[padding],
        className,
      )}
      data-slot="spotlight-hero-section"
    >
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          animate={
            motionEnabled ? { opacity: [0.35, 0.65, 0.35] } : { opacity: 0.45 }
          }
          className="absolute -left-24 top-0 h-80 w-80 rounded-full bg-primary/25 blur-3xl"
          transition={{
            duration: 6,
            ease: "easeInOut",
            repeat: Number.POSITIVE_INFINITY,
          }}
        />
        <motion.div
          animate={
            motionEnabled ? { opacity: [0.2, 0.55, 0.2] } : { opacity: 0.35 }
          }
          className="absolute -right-12 bottom-0 h-72 w-72 rounded-full bg-chart-2/25 blur-3xl"
          transition={{
            duration: 7.5,
            ease: "easeInOut",
            repeat: Number.POSITIVE_INFINITY,
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 text-center">
        {eyebrow ? (
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-primary">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mx-auto max-w-4xl text-4xl font-semibold tracking-tight text-foreground md:text-6xl">
          {heading}
        </h2>
        {subheading ? (
          <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground md:text-lg">
            {subheading}
          </p>
        ) : null}

        {actions.length > 0 ? (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {actions.map((action) => (
              <Button
                key={`${action.label}-${action.href}`}
                asChild
                variant={action.variant ?? "default"}
              >
                <a href={action.href}>{action.label}</a>
              </Button>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
