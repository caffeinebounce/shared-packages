"use client";

import type { ImgHTMLAttributes } from "react";

import { cn } from "../../utils";

export type ThemeLogoVariant =
  /** No processing — logo works in both modes as-is */
  | "auto"
  /** Invert colors in light mode (for white-on-transparent logos) */
  | "invert"
  /** Use mix-blend-mode to knock out solid backgrounds */
  | "remove-bg";

export interface ThemeLogoProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, "children"> {
  /** How to handle light/dark mode adaptation */
  variant?: ThemeLogoVariant;
}

/**
 * ThemeLogo — renders a logo `<img>` that adapts to light/dark mode.
 *
 * Variants:
 * - `"auto"` (default): no processing, logo works as-is in both modes
 * - `"invert"`: CSS `invert` filter in light mode, normal in dark mode.
 *   Use for white-on-transparent logos (e.g. white SVG/PNG text).
 * - `"remove-bg"`: Uses `mix-blend-mode: multiply` in light mode and
 *   `screen` in dark mode to knock out solid light/dark backgrounds.
 *
 * @example
 * ```tsx
 * <ThemeLogo src="/logos/lafayette.svg" alt="Lafayette Square" variant="invert" className="h-8" />
 * <ThemeLogo src="/logos/brightwood.png" alt="Brightwood" variant="remove-bg" className="h-6" />
 * ```
 */
export function ThemeLogo({
  variant = "auto",
  className,
  ...props
}: ThemeLogoProps) {
  const variantClass =
    variant === "invert"
      ? "dark:invert-0 invert"
      : variant === "remove-bg"
        ? "mix-blend-multiply dark:mix-blend-screen"
        : "";

  // biome-ignore lint/a11y/useAltText: alt is passed via ...props
  return <img className={cn(variantClass, className)} {...props} />;
}
