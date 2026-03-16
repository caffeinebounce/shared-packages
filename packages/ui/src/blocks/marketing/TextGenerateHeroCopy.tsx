"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  cx,
  hasWindow,
  type MarketingSectionPadding,
  type MarketingSectionTone,
  sectionPaddingClasses,
  sectionToneClasses,
} from "./aceternity/shared";
import { useMotionEnabled } from "./aceternity/useMotionEnabled";

export interface TextGenerateHeroCopyProps {
  text: string;
  headingLevel?: 1 | 2 | 3;
  revealMsPerToken?: number;
  startDelayMs?: number;
  subtitle?: ReactNode;
  tone?: MarketingSectionTone;
  padding?: MarketingSectionPadding;
  className?: string;
}

function useGeneratedText(
  text: string,
  revealMsPerToken: number,
  startDelayMs: number,
  enabled: boolean,
) {
  const tokens = useMemo(
    () => text.split(/\s+/).filter((token) => token.length > 0),
    [text],
  );
  const [visibleCount, setVisibleCount] = useState(enabled ? 0 : tokens.length);

  useEffect(() => {
    if (!enabled || !hasWindow()) {
      setVisibleCount(tokens.length);
      return;
    }

    setVisibleCount(0);
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    timeoutId = setTimeout(() => {
      intervalId = setInterval(() => {
        setVisibleCount((current) => {
          if (current >= tokens.length) {
            if (intervalId) {
              clearInterval(intervalId);
            }
            return current;
          }
          return current + 1;
        });
      }, revealMsPerToken);
    }, startDelayMs);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [enabled, revealMsPerToken, startDelayMs, tokens]);

  return tokens.map((token, index) => (
    <span
      key={`${token}-${index}`}
      className={cx(
        "transition-opacity duration-300",
        index < visibleCount ? "opacity-100" : "opacity-20",
      )}
    >
      {token}{" "}
    </span>
  ));
}

export function TextGenerateHeroCopy({
  text,
  headingLevel = 1,
  revealMsPerToken = 55,
  startDelayMs = 180,
  subtitle,
  tone = "default",
  padding = "lg",
  className,
}: TextGenerateHeroCopyProps) {
  const motionEnabled = useMotionEnabled();
  const generated = useGeneratedText(
    text,
    revealMsPerToken,
    startDelayMs,
    motionEnabled,
  );

  const HeadingTag = `h${headingLevel}` as const;

  return (
    <section
      className={cx(
        sectionToneClasses[tone],
        sectionPaddingClasses[padding],
        className,
      )}
      data-slot="text-generate-hero-copy"
    >
      <div className="container mx-auto max-w-4xl px-4 text-center">
        <HeadingTag className="text-4xl font-semibold leading-tight tracking-tight text-foreground md:text-6xl">
          {generated}
        </HeadingTag>
        {subtitle ? (
          <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground md:text-lg">
            {subtitle}
          </p>
        ) : null}
      </div>
    </section>
  );
}
