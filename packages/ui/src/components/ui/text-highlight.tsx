"use client";

import type { ReactNode } from "react";

import { cn } from "../../utils";

export interface TextHighlightProps {
  /** Content to highlight */
  children: ReactNode;
  /** Additional className for styling */
  className?: string;
  /** Animation duration in seconds */
  duration?: number;
  /** Animation delay in seconds */
  delay?: number;
  /**
   * Gradient colors for the highlight.
   * Provide Tailwind gradient classes like "from-emerald-300 to-teal-300"
   * @default "from-indigo-300 to-purple-300 dark:from-indigo-500 dark:to-purple-500"
   */
  gradient?: string;
  /** Whether to disable the animation (instant highlight) */
  disableAnimation?: boolean;
}

/**
 * Animated text highlight component that draws a gradient background behind text.
 * Perfect for emphasizing key phrases in hero sections.
 *
 * The animation respects the user's `prefers-reduced-motion` setting and will
 * display the highlight instantly when reduced motion is preferred.
 *
 * @example
 * ```tsx
 * <h1>
 *   Ready to take your business{" "}
 *   <TextHighlight gradient="from-emerald-300 to-teal-300 dark:from-emerald-400 dark:to-teal-400">
 *     to the next level?
 *   </TextHighlight>
 * </h1>
 * ```
 */
export function TextHighlight({
  children,
  className,
  duration = 2,
  delay = 0.5,
  gradient = "from-indigo-300 to-purple-300 dark:from-indigo-500 dark:to-purple-500",
  disableAnimation = false,
}: TextHighlightProps) {
  // Animation is controlled via CSS custom properties
  // The actual animation respects prefers-reduced-motion in base.css
  const animationStyle = disableAnimation
    ? { backgroundSize: "100% 100%" }
    : {
        "--highlight-duration": `${duration}s`,
        "--highlight-delay": `${delay}s`,
      };

  return (
    <span
      data-slot="text-highlight"
      data-animated={!disableAnimation}
      className={cn(
        "relative inline-block rounded-lg bg-gradient-to-r bg-no-repeat px-1 pb-1",
        !disableAnimation && "text-highlight-animated",
        gradient,
        className,
      )}
      style={{
        backgroundPosition: "left center",
        ...animationStyle,
      }}
    >
      {children}
    </span>
  );
}
