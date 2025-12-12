"use client";

import { BackgroundRippleEffect } from "../effects";
import { HeroSection, type HeroSectionProps } from "./HeroSection";

export interface HeroSectionWithRippleProps extends HeroSectionProps {
  /** Number of rows for the ripple effect grid */
  rippleRows?: number;
  /** Number of columns for the ripple effect grid */
  rippleCols?: number;
  /** Cell size for the ripple effect in pixels */
  rippleCellSize?: number;
}

/**
 * Hero section with an animated background ripple effect.
 * Combines HeroSection with BackgroundRippleEffect for visual interest.
 */
export function HeroSectionWithRipple({
  rippleRows,
  rippleCols,
  rippleCellSize,
  ...props
}: HeroSectionWithRippleProps) {
  return (
    <div className="relative">
      <BackgroundRippleEffect
        rows={rippleRows}
        cols={rippleCols}
        cellSize={rippleCellSize}
      />
      <HeroSection {...props} />
    </div>
  );
}
