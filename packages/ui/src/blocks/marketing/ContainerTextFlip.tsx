"use client";

import { motion } from "motion/react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { cn } from "../../utils";
import { hasWindow } from "./aceternity/shared";
import { useMotionEnabled } from "./aceternity/useMotionEnabled";

const DEFAULT_WORDS = ["better", "modern", "beautiful", "useful"];

export interface ContainerTextFlipProps {
  /** Array of words to cycle through in the animation. */
  words?: string[];
  /** Time in milliseconds between word transitions. */
  interval?: number;
  /** Additional classes for the animated container. */
  className?: string;
  /** Additional classes for the rendered word. */
  textClassName?: string;
  /** Duration of the transition animation in milliseconds. */
  animationDuration?: number;
  /** Accessible label announced instead of each animated word changing. */
  ariaLabel?: string;
  /** Words to visually emphasize inside the active phrase. */
  highlightWords?: string[];
  /** Additional classes for emphasized words. */
  highlightClassName?: string;
  /** Called whenever the active word or phrase changes. */
  onIndexChange?: (index: number, word: string) => void;
}

function normalizeWords(words: string[] | undefined) {
  const normalized = words
    ?.map((word) => word.trim())
    .filter((word) => word.length > 0);

  return normalized && normalized.length > 0 ? normalized : DEFAULT_WORDS;
}

export function ContainerTextFlip({
  words,
  interval = 3000,
  className,
  textClassName,
  animationDuration = 700,
  ariaLabel,
  highlightWords,
  highlightClassName,
  onIndexChange,
}: ContainerTextFlipProps) {
  const id = useId();
  const motionEnabled = useMotionEnabled();
  const normalizedWords = useMemo(() => normalizeWords(words), [words]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [width, setWidth] = useState(100);
  const textRef = useRef<HTMLSpanElement | null>(null);
  const currentWord = normalizedWords[currentWordIndex] ?? normalizedWords[0];
  const durationSeconds = Math.max(animationDuration, 0) / 1000;
  const widthDurationSeconds = Math.max(animationDuration, 0) / 2000;
  const highlightedWords = useMemo(
    () => new Set(highlightWords?.map((word) => word.toLowerCase()) ?? []),
    [highlightWords],
  );

  useEffect(() => {
    setCurrentWordIndex((index) =>
      Math.min(index, Math.max(normalizedWords.length - 1, 0)),
    );
  }, [normalizedWords.length]);

  useEffect(() => {
    if (
      !motionEnabled ||
      !hasWindow() ||
      normalizedWords.length < 2 ||
      interval <= 0
    ) {
      return;
    }

    const intervalId = setInterval(() => {
      setCurrentWordIndex((index) => (index + 1) % normalizedWords.length);
    }, interval);

    return () => {
      clearInterval(intervalId);
    };
  }, [interval, motionEnabled, normalizedWords.length]);

  useEffect(() => {
    if (!textRef.current) {
      return;
    }

    setWidth(textRef.current.scrollWidth + (currentWord.length > 0 ? 30 : 0));
  }, [currentWord]);

  useEffect(() => {
    onIndexChange?.(currentWordIndex, currentWord);
  }, [currentWord, currentWordIndex, onIndexChange]);

  return (
    <motion.span
      animate={motionEnabled ? { width } : undefined}
      aria-label={ariaLabel ?? normalizedWords.join(", ")}
      className={cn(
        "relative inline-flex overflow-hidden rounded-lg border border-border bg-muted/70 px-3 py-1 align-baseline text-foreground shadow-sm",
        className,
      )}
      data-slot="container-text-flip"
      layout
      layoutId={`container-text-flip-${id}`}
      transition={{ duration: widthDurationSeconds, ease: "easeInOut" }}
    >
      <span className="sr-only">{ariaLabel ?? normalizedWords.join(", ")}</span>
      <motion.span
        animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
        aria-hidden="true"
        className={cn("inline-block whitespace-nowrap", textClassName)}
        data-slot="container-text-flip-word"
        initial={
          motionEnabled ? { filter: "blur(8px)", opacity: 0, y: 8 } : false
        }
        key={`${currentWord}-${currentWordIndex}`}
        layoutId={`container-text-flip-word-${currentWord}-${id}`}
        ref={textRef}
        transition={{ duration: durationSeconds, ease: "easeInOut" }}
      >
        {highlightedWords.size > 0
          ? currentWord.split(/(\s+)/).map((part, index) => {
              const normalized = part
                .toLowerCase()
                .replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, "");
              const highlighted = highlightedWords.has(normalized);

              return (
                <motion.span
                  animate={{ filter: "blur(0px)", opacity: 1 }}
                  className={cn(
                    highlighted ? highlightClassName : undefined,
                    /\s+/.test(part) ? "inline" : "inline-block",
                  )}
                  initial={
                    motionEnabled ? { filter: "blur(10px)", opacity: 0 } : false
                  }
                  key={`${part}-${index}`}
                  transition={{ delay: motionEnabled ? index * 0.03 : 0 }}
                >
                  {/\s+/.test(part) ? part.replace(/ /g, "\u00A0") : part}
                </motion.span>
              );
            })
          : currentWord.split("").map((letter, index) => (
              <motion.span
                animate={{ filter: "blur(0px)", opacity: 1 }}
                className="inline-block"
                initial={
                  motionEnabled ? { filter: "blur(10px)", opacity: 0 } : false
                }
                key={`${letter}-${index}`}
                transition={{ delay: motionEnabled ? index * 0.02 : 0 }}
              >
                {letter === " " ? "\u00A0" : letter}
              </motion.span>
            ))}
      </motion.span>
    </motion.span>
  );
}
