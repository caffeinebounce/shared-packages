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
   * When true, hovering a character scrambles it and its neighbours (±hoverRadius)
   * continuously until the mouse leaves.
   * Defaults to false.
   */
  hoverScramble?: boolean;
  /**
   * Number of neighbouring characters (each side) to scramble on hover.
   * Defaults to 1.
   */
  hoverRadius?: number;
  /**
   * Duration in milliseconds after mouse leaves before characters settle back.
   * Defaults to 150.
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

  const [forceStart, setForceStart] = useState(false);

  // Fallback: useInView can miss elements already in viewport during SSR hydration
  // or inside animated containers (transforms). Use a hard timeout as ultimate fallback.
  useEffect(() => {
    if (isInView || forceStart) return;

    // Try viewport check repeatedly for 500ms, then force-start regardless
    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 10;

    const check = () => {
      if (cancelled || isInView || forceStart) return;
      const el = ref.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        if (
          rect.top < window.innerHeight &&
          rect.bottom > 0 &&
          rect.left < window.innerWidth &&
          rect.right > 0
        ) {
          setForceStart(true);
          return;
        }
      }
      attempts++;
      if (attempts < maxAttempts) {
        requestAnimationFrame(check);
      }
    };
    requestAnimationFrame(check);

    // Hard fallback: if nothing fired after 600ms, just start
    const hardTimeout = setTimeout(() => {
      if (!cancelled) setForceStart(true);
    }, 600);

    return () => {
      cancelled = true;
      clearTimeout(hardTimeout);
    };
  }, [isInView, forceStart]);

  const [revealCount, setRevealCount] = useState<number>(0);
  // Tick counter forces re-render when scramble chars flip (ref mutations alone don't trigger render)
  const [, setTick] = useState(0);
  const [hoverScrambledIndices, setHoverScrambledIndices] = useState<
    Set<number>
  >(new Set());
  const [hoverChars, setHoverChars] = useState<Map<number, string>>(new Map());

  // Track which indices are actively hovered (mouse is over them)
  const activeHoverRef = useRef<Set<number>>(new Set());
  // Intervals for flipping characters while hovered
  const hoverFlipRef = useRef<Map<number, ReturnType<typeof setInterval>>>(
    new Map(),
  );
  // Timeouts for settling after mouse leaves
  const settleTimersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const lastFlipTimeRef = useRef<number>(0);
  const scrambleCharsRef = useRef<string[]>(
    text ? generateGibberishPreservingSpaces(text, charset).split("") : [],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      for (const t of hoverFlipRef.current.values()) clearInterval(t);
      for (const t of settleTimersRef.current.values()) clearTimeout(t);
    };
  }, []);

  // Initial reveal animation
  useEffect(() => {
    if (!isInView && !forceStart) return;

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
        // Force re-render so scramble ref mutations become visible
        setTick((t) => t + 1);
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
  }, [isInView, forceStart, text, revealDelayMs, charset, flipDelayMs]);

  const startScrambling = useCallback(
    (indices: number[]) => {
      // Add to scrambled set
      setHoverScrambledIndices((prev) => {
        const next = new Set(prev);
        for (const i of indices) next.add(i);
        return next;
      });

      for (const i of indices) {
        // Cancel any settle timer — we're re-entering
        const existingSettle = settleTimersRef.current.get(i);
        if (existingSettle) {
          clearTimeout(existingSettle);
          settleTimersRef.current.delete(i);
        }

        // If already flipping, skip
        if (hoverFlipRef.current.has(i)) continue;

        // Immediate random char
        setHoverChars((prev) => {
          const next = new Map(prev);
          next.set(i, generateRandomCharacter(charset));
          return next;
        });

        // Continuous flip interval while hovered
        const flipInterval = setInterval(() => {
          setHoverChars((prev) => {
            const next = new Map(prev);
            next.set(i, generateRandomCharacter(charset));
            return next;
          });
        }, 30);
        hoverFlipRef.current.set(i, flipInterval);
      }
    },
    [charset],
  );

  const stopScrambling = useCallback(
    (indices: number[]) => {
      for (const i of indices) {
        // Only stop if no longer actively hovered by any source
        if (activeHoverRef.current.has(i)) continue;

        // Schedule settle after delay
        const timer = setTimeout(() => {
          // Stop flipping
          const flip = hoverFlipRef.current.get(i);
          if (flip) {
            clearInterval(flip);
            hoverFlipRef.current.delete(i);
          }
          settleTimersRef.current.delete(i);

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
        settleTimersRef.current.set(i, timer);
      }
    },
    [hoverDurationMs],
  );

  const getAffectedIndices = useCallback(
    (index: number): number[] => {
      const indices: number[] = [];
      for (
        let i = Math.max(0, index - hoverRadius);
        i <= Math.min(text.length - 1, index + hoverRadius);
        i++
      ) {
        if (text[i] !== " ") {
          indices.push(i);
        }
      }
      return indices;
    },
    [hoverRadius, text],
  );

  const handleCharEnter = useCallback(
    (index: number) => {
      if (!hoverScramble) return;
      const indices = getAffectedIndices(index);
      if (indices.length === 0) return;

      // Mark all affected as actively hovered
      for (const i of indices) activeHoverRef.current.add(i);

      startScrambling(indices);
    },
    [hoverScramble, getAffectedIndices, startScrambling],
  );

  const handleCharLeave = useCallback(
    (index: number) => {
      if (!hoverScramble) return;
      const indices = getAffectedIndices(index);

      // Remove this char's contribution to active hover
      for (const i of indices) activeHoverRef.current.delete(i);

      stopScrambling(indices);
    },
    [hoverScramble, getAffectedIndices, stopScrambling],
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
                ? () => handleCharEnter(index)
                : undefined
            }
            onMouseLeave={
              isFullyRevealed && hoverScramble
                ? () => handleCharLeave(index)
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
