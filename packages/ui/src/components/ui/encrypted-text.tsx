"use client";

import { motion, useInView } from "motion/react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "../../utils";

export type EncryptedTextProps = {
  text: string;
  className?: string;
  /**
   * Time in milliseconds between revealing each subsequent real character.
   * Lower is faster. Defaults to 50ms per character.
   */
  revealDelayMs?: number;
  /** Optional custom character set to use for the gibberish effect. */
  charset?: string;
  /**
   * Time in milliseconds between gibberish flips for unrevealed characters.
   * Lower is more jittery. Defaults to 50ms.
   */
  flipDelayMs?: number;
  /** CSS class for styling the encrypted/scrambled characters */
  encryptedClassName?: string;
  /** CSS class for styling the revealed characters */
  revealedClassName?: string;
  /**
   * Enable hover scramble effect on revealed characters.
   * When true, hovering a character scrambles it and its neighbours (±hoverRadius).
   * Defaults to false.
   */
  hoverScramble?: boolean;
  /**
   * Number of neighbouring characters (each side) to scramble on hover.
   * Defaults to 1.
   */
  hoverRadius?: number;
  /**
   * Duration in milliseconds for the hover scramble effect before
   * characters settle back. Defaults to 150.
   */
  hoverDurationMs?: number;
};

const DEFAULT_CHARSET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-={}[];:,.<>/?";

function generateRandomCharacter(charset: string): string {
  const index = Math.floor(Math.random() * charset.length);
  return charset.charAt(index);
}

function generateGibberishPreservingSpaces(
  original: string,
  charset: string,
): string {
  if (!original) return "";
  let result = "";
  for (let i = 0; i < original.length; i += 1) {
    const ch = original[i];
    result += ch === " " ? " " : generateRandomCharacter(charset);
  }
  return result;
}

export const EncryptedText: React.FC<EncryptedTextProps> = ({
  text,
  className,
  revealDelayMs = 50,
  charset = DEFAULT_CHARSET,
  flipDelayMs = 50,
  encryptedClassName,
  revealedClassName,
  hoverScramble = false,
  hoverRadius = 1,
  hoverDurationMs = 150,
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  const [revealCount, setRevealCount] = useState<number>(0);
  const [hoverScrambledIndices, setHoverScrambledIndices] = useState<
    Set<number>
  >(new Set());
  const [hoverChars, setHoverChars] = useState<Map<number, string>>(new Map());
  const hoverTimersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(
    new Map(),
  );
  const hoverFlipRef = useRef<Map<number, ReturnType<typeof setInterval>>>(
    new Map(),
  );
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const lastFlipTimeRef = useRef<number>(0);
  const scrambleCharsRef = useRef<string[]>(
    text ? generateGibberishPreservingSpaces(text, charset).split("") : [],
  );

  // Cleanup hover timers on unmount
  useEffect(() => {
    return () => {
      for (const t of hoverTimersRef.current.values()) clearTimeout(t);
      for (const t of hoverFlipRef.current.values()) clearInterval(t);
    };
  }, []);

  useEffect(() => {
    if (!isInView) return;

    const initial = text
      ? generateGibberishPreservingSpaces(text, charset)
      : "";
    scrambleCharsRef.current = initial.split("");
    startTimeRef.current = performance.now();
    lastFlipTimeRef.current = startTimeRef.current;
    setRevealCount(0);

    let isCancelled = false;

    const update = (now: number) => {
      if (isCancelled) return;

      const elapsedMs = now - startTimeRef.current;
      const totalLength = text.length;
      const currentRevealCount = Math.min(
        totalLength,
        Math.floor(elapsedMs / Math.max(1, revealDelayMs)),
      );

      setRevealCount(currentRevealCount);

      if (currentRevealCount >= totalLength) {
        return;
      }

      const timeSinceLastFlip = now - lastFlipTimeRef.current;
      if (timeSinceLastFlip >= Math.max(0, flipDelayMs)) {
        for (let index = 0; index < totalLength; index += 1) {
          if (index >= currentRevealCount) {
            if (text[index] !== " ") {
              scrambleCharsRef.current[index] =
                generateRandomCharacter(charset);
            } else {
              scrambleCharsRef.current[index] = " ";
            }
          }
        }
        lastFlipTimeRef.current = now;
      }

      animationFrameRef.current = requestAnimationFrame(update);
    };

    animationFrameRef.current = requestAnimationFrame(update);

    return () => {
      isCancelled = true;
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isInView, text, revealDelayMs, charset, flipDelayMs]);

  const handleCharHover = useCallback(
    (index: number) => {
      if (!hoverScramble) return;
      // Only scramble revealed, non-space characters
      const indicesToScramble: number[] = [];
      for (
        let i = Math.max(0, index - hoverRadius);
        i <= Math.min(text.length - 1, index + hoverRadius);
        i++
      ) {
        if (text[i] !== " ") {
          indicesToScramble.push(i);
        }
      }

      if (indicesToScramble.length === 0) return;

      // Add to scrambled set
      setHoverScrambledIndices((prev) => {
        const next = new Set(prev);
        for (const i of indicesToScramble) next.add(i);
        return next;
      });

      // Start flipping characters rapidly
      for (const i of indicesToScramble) {
        // Clear any existing timer/interval for this index
        const existingTimer = hoverTimersRef.current.get(i);
        if (existingTimer) clearTimeout(existingTimer);
        const existingFlip = hoverFlipRef.current.get(i);
        if (existingFlip) clearInterval(existingFlip);

        // Immediately set a random char
        setHoverChars((prev) => {
          const next = new Map(prev);
          next.set(i, generateRandomCharacter(charset));
          return next;
        });

        // Flip rapidly during hover duration
        const flipInterval = setInterval(() => {
          setHoverChars((prev) => {
            const next = new Map(prev);
            next.set(i, generateRandomCharacter(charset));
            return next;
          });
        }, 30);
        hoverFlipRef.current.set(i, flipInterval);

        // After duration, settle back to real character
        const timer = setTimeout(() => {
          clearInterval(flipInterval);
          hoverFlipRef.current.delete(i);
          setHoverScrambledIndices((prev) => {
            const next = new Set(prev);
            next.delete(i);
            return next;
          });
          setHoverChars((prev) => {
            const next = new Map(prev);
            next.delete(i);
            return next;
          });
        }, hoverDurationMs);
        hoverTimersRef.current.set(i, timer);
      }
    },
    [hoverScramble, hoverRadius, hoverDurationMs, text, charset],
  );

  if (!text) return null;

  const isFullyRevealed = revealCount >= text.length;

  return (
    <motion.span ref={ref} className={cn(className)} aria-label={text}>
      {text.split("").map((char, index) => {
        const isRevealed = index < revealCount;
        const isHoverScrambled = hoverScrambledIndices.has(index);

        let displayChar: string;
        if (isHoverScrambled && isRevealed) {
          displayChar =
            hoverChars.get(index) ?? generateRandomCharacter(charset);
        } else if (isRevealed) {
          displayChar = char;
        } else if (char === " ") {
          displayChar = " ";
        } else {
          displayChar =
            scrambleCharsRef.current[index] ?? generateRandomCharacter(charset);
        }

        const charClassName = isHoverScrambled
          ? encryptedClassName
          : isRevealed
            ? revealedClassName
            : encryptedClassName;

        return (
          // biome-ignore lint/a11y/noStaticElementInteractions: decorative hover effect
          <span
            key={index}
            className={cn(
              charClassName,
              isFullyRevealed && hoverScramble && char !== " "
                ? "cursor-default"
                : undefined,
            )}
            onMouseEnter={
              isFullyRevealed && hoverScramble
                ? () => handleCharHover(index)
                : undefined
            }
          >
            {displayChar}
          </span>
        );
      })}
    </motion.span>
  );
};
