"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type ScrollDirection = "up" | "down" | null;

export interface UseScrollDirectionOptions {
  /** Minimum scroll delta before direction changes (prevents jitter) */
  threshold?: number;
  /** Scroll position below which navbar is always visible */
  topThreshold?: number;
}

/**
 * Hook that tracks scroll direction for implementing hide-on-scroll-down patterns.
 *
 * @example
 * ```tsx
 * const { direction, isAtTop } = useScrollDirection({ threshold: 10 });
 * const visible = direction === "up" || isAtTop;
 * ```
 */
export function useScrollDirection({
  threshold = 10,
  topThreshold = 50,
}: UseScrollDirectionOptions = {}) {
  const [direction, setDirection] = useState<ScrollDirection>(null);
  const [isAtTop, setIsAtTop] = useState(true);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  const updateScrollDirection = useCallback(() => {
    const scrollY = window.scrollY;

    // Check if at top of page
    setIsAtTop(scrollY < topThreshold);

    // Calculate direction with threshold
    const diff = scrollY - lastScrollY.current;

    if (Math.abs(diff) >= threshold) {
      setDirection(diff > 0 ? "down" : "up");
      lastScrollY.current = scrollY;
    }

    ticking.current = false;
  }, [threshold, topThreshold]);

  const onScroll = useCallback(() => {
    if (!ticking.current) {
      window.requestAnimationFrame(updateScrollDirection);
      ticking.current = true;
    }
  }, [updateScrollDirection]);

  useEffect(() => {
    // Initialize
    lastScrollY.current = window.scrollY;
    setIsAtTop(window.scrollY < topThreshold);

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [onScroll, topThreshold]);

  return { direction, isAtTop };
}
