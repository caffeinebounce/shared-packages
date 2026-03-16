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

export interface BackgroundBeamsCTASectionProps {
  heading: ReactNode;
  subheading?: ReactNode;
  primaryAction: {
    href: string;
    label: string;
  };
  secondaryAction?: {
    href: string;
    label: string;
  };
  tone?: MarketingSectionTone;
  padding?: MarketingSectionPadding;
  className?: string;
}

export function BackgroundBeamsCTASection({
  heading,
  subheading,
  primaryAction,
  secondaryAction,
  tone = "accent",
  padding = "lg",
  className,
}: BackgroundBeamsCTASectionProps) {
  const motionEnabled = useMotionEnabled();

  return (
    <section
      className={cx(
        "relative overflow-hidden",
        sectionToneClasses[tone],
        sectionPaddingClasses[padding],
        className,
      )}
      data-slot="background-beams-cta-section"
    >
      <div className="pointer-events-none absolute inset-0">
        {Array.from({ length: 5 }).map((_, index) => (
          <motion.div
            key={index}
            animate={
              motionEnabled
                ? {
                    opacity: [0.2, 0.55, 0.2],
                    y: [0, index % 2 === 0 ? 18 : -18, 0],
                  }
                : { opacity: 0.28 }
            }
            className="absolute h-px w-[140%] bg-linear-to-r from-transparent via-primary/45 to-transparent"
            style={{
              left: "-20%",
              top: `${18 + index * 16}%`,
              rotate: `${-8 + index * 4}deg`,
            }}
            transition={{
              duration: 5 + index,
              ease: "easeInOut",
              repeat: Number.POSITIVE_INFINITY,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto max-w-3xl px-4 text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
          {heading}
        </h2>
        {subheading ? (
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            {subheading}
          </p>
        ) : null}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <a href={primaryAction.href}>{primaryAction.label}</a>
          </Button>
          {secondaryAction ? (
            <Button asChild size="lg" variant="outline">
              <a href={secondaryAction.href}>{secondaryAction.label}</a>
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
