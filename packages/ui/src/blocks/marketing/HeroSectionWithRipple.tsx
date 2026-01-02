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
  /** Whether to apply the radial mask (fades out edges). Default: true */
  rippleMask?: boolean;
}

/**
 * Hero section with an animated background ripple effect.
 * Combines HeroSection with BackgroundRippleEffect for visual interest.
 * The ripple effect is interactive - clicking on cells triggers a ripple animation.
 */
export function HeroSectionWithRipple({
  rippleRows,
  rippleCols,
  rippleCellSize,
  rippleMask = true,
  className,
  ...props
}: HeroSectionWithRippleProps) {
  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] w-screen max-w-full overflow-x-hidden">
      <BackgroundRippleEffect
        rows={rippleRows}
        cols={rippleCols}
        cellSize={rippleCellSize}
        mask={rippleMask}
      />
      {/* Content layer - pointer-events-none allows clicks through to ripple, 
          but interactive elements (buttons, links) have pointer-events-auto */}
      <div className="relative z-10 pointer-events-none [&_a]:pointer-events-auto [&_button]:pointer-events-auto [&_input]:pointer-events-auto">
        <HeroSection {...props} padding="sm" className={className} />
      </div>
    </div>
  );
}
