"use client";

import { type ImgHTMLAttributes, useEffect, useState } from "react";

import { cn } from "../../utils";

export type ThemeLogoVariant =
  /** No processing — logo works in both modes as-is */
  | "auto"
  /** Invert colors in light mode (for white-on-transparent logos) */
  | "invert"
  /** Invert colors in dark mode only (for dark-on-transparent logos) */
  | "invert-dark"
  /** Use mix-blend-mode to knock out solid backgrounds */
  | "remove-bg";

export interface ThemeLogoProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, "children"> {
  /** How to handle light/dark mode adaptation */
  variant?: ThemeLogoVariant;
  /** Separate image source for light mode */
  lightSrc?: string;
  /** Separate image source for dark mode (defaults to src) */
  darkSrc?: string;
  /** Apply brightness(0) in light mode to turn white logos dark */
  darkenInLight?: boolean;
}

/**
 * ThemeLogo — renders a logo `<img>` that adapts to light/dark mode.
 *
 * Uses inline styles for Tailwind v4 compiled-package compatibility.
 *
 * Features:
 * - `lightSrc` / `darkSrc`: swap image sources per theme
 * - `darkenInLight`: applies `brightness(0)` filter in light mode
 * - `variant`: CSS filter/blend-mode presets (auto, invert, invert-dark, remove-bg)
 *
 * @example
 * ```tsx
 * // Source swapping
 * <ThemeLogo src="/logos/logo-dark.svg" lightSrc="/logos/logo-light.svg" alt="Logo" className="h-8" />
 *
 * // Darken white logo in light mode
 * <ThemeLogo src="/logos/white-logo.svg" darkenInLight alt="Logo" className="h-6" />
 *
 * // Variant presets
 * <ThemeLogo src="/logos/lafayette.svg" alt="Lafayette Square" variant="invert" className="h-8" />
 * ```
 */
export function ThemeLogo({
  variant = "auto",
  lightSrc,
  darkSrc,
  darkenInLight,
  className,
  src,
  style,
  ...props
}: ThemeLogoProps) {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const html = document.documentElement;
    setIsDark(html.classList.contains("dark"));

    const observer = new MutationObserver(() => {
      setIsDark(html.classList.contains("dark"));
    });
    observer.observe(html, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // Resolve active source
  let activeSrc = src;
  if (mounted) {
    if (isDark && darkSrc) {
      activeSrc = darkSrc;
    } else if (!isDark && lightSrc) {
      activeSrc = lightSrc;
    }
  }

  // Build inline filter/blend styles (no Tailwind dark: classes — v4 safe)
  const inlineStyle: React.CSSProperties = { ...style };

  if (mounted) {
    if (darkenInLight && !isDark) {
      inlineStyle.filter = "brightness(0)";
    }

    if (variant === "invert") {
      inlineStyle.filter = isDark ? undefined : "invert(1)";
    } else if (variant === "invert-dark") {
      inlineStyle.filter = isDark ? "invert(1)" : undefined;
    } else if (variant === "remove-bg") {
      inlineStyle.mixBlendMode = isDark ? "screen" : "multiply";
    }
  }

  const { alt, ...rest } = props;
  return (
    <img
      src={activeSrc}
      alt={alt ?? ""}
      className={cn(className)}
      style={inlineStyle}
      {...rest}
    />
  );
}
