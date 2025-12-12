"use client";

import { useEffect, useState } from "react";

/**
 * Hook that tracks whether a media query matches.
 * Useful for responsive designs and conditional rendering.
 *
 * @param query - The media query string (e.g., "(min-width: 768px)")
 * @returns Whether the media query matches
 *
 * @example
 * ```tsx
 * const isMobile = useMediaQuery("(max-width: 767px)");
 * const isTablet = useMediaQuery("(min-width: 768px) and (max-width: 1023px)");
 * const isDesktop = useMediaQuery("(min-width: 1024px)");
 * const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
 * ```
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // SSR safety check
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia(query);

    // Set initial value
    setMatches(mediaQuery.matches);

    // Handler for changes
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Modern browsers
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [query]);

  return matches;
}

/**
 * Preset breakpoints matching common Tailwind CSS defaults.
 */
export const breakpoints = {
  sm: "(min-width: 640px)",
  md: "(min-width: 768px)",
  lg: "(min-width: 1024px)",
  xl: "(min-width: 1280px)",
  "2xl": "(min-width: 1536px)",
} as const;

/**
 * Hook that returns boolean flags for common responsive breakpoints.
 *
 * @example
 * ```tsx
 * const { isMobile, isTablet, isDesktop } = useBreakpoints();
 * ```
 */
export function useBreakpoints() {
  const isSm = useMediaQuery(breakpoints.sm);
  const isMd = useMediaQuery(breakpoints.md);
  const isLg = useMediaQuery(breakpoints.lg);
  const isXl = useMediaQuery(breakpoints.xl);
  const is2xl = useMediaQuery(breakpoints["2xl"]);

  return {
    /** Below 640px */
    isMobile: !isSm,
    /** 640px - 767px */
    isSm: isSm && !isMd,
    /** 768px - 1023px */
    isTablet: isMd && !isLg,
    /** 768px+ */
    isMd,
    /** 1024px+ */
    isDesktop: isLg,
    /** 1024px - 1279px */
    isLg: isLg && !isXl,
    /** 1280px+ */
    isXl,
    /** 1536px+ */
    is2xl,
  };
}
