"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { BackgroundRippleEffect } from "../effects";
import { HeroSection, type HeroSectionProps } from "./HeroSection";

export interface HeroSectionWithRippleProps
  extends Omit<HeroSectionProps, "carouselState" | "showArrows"> {
  /** Number of rows for the ripple effect grid */
  rippleRows?: number;
  /** Number of columns for the ripple effect grid */
  rippleCols?: number;
  /** Cell size for the ripple effect in pixels */
  rippleCellSize?: number;
  /** Whether to apply the radial mask (fades out edges). Default: true */
  rippleMask?: boolean;
  /** Opacity of the ripple effect (0-100). Default: 40 when images present, 100 otherwise */
  rippleOpacity?: number;
}

/**
 * Hero section with an animated background ripple effect.
 * Combines HeroSection with BackgroundRippleEffect for visual interest.
 * The ripple effect is interactive - clicking on cells triggers a ripple animation.
 *
 * When backgroundImages are provided:
 * - Images render at the lowest layer (z-0)
 * - Ripple renders above images with reduced opacity (z-10)
 * - Content renders on top (z-20)
 * - Arrow navigation is hidden (only dot indicators shown)
 */
export function HeroSectionWithRipple({
  rippleRows,
  rippleCols,
  rippleCellSize,
  rippleMask = true,
  rippleOpacity,
  backgroundImages = [],
  autoPlayInterval = 5000,
  className,
  ...props
}: HeroSectionWithRippleProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const hasImages = backgroundImages.length > 0;
  const hasMultipleImages = backgroundImages.length > 1;

  // Calculate ripple opacity: use provided value, or 40% when images present, 100% otherwise
  const effectiveRippleOpacity = rippleOpacity ?? (hasImages ? 40 : 100);

  const goToSlide = useCallback(
    (index: number) => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      setCurrentIndex(index);
      setTimeout(() => setIsTransitioning(false), 500);
    },
    [isTransitioning],
  );

  const goToNext = useCallback(() => {
    const newIndex =
      currentIndex === backgroundImages.length - 1 ? 0 : currentIndex + 1;
    goToSlide(newIndex);
  }, [currentIndex, backgroundImages.length, goToSlide]);

  // Auto-play carousel
  useEffect(() => {
    if (!hasMultipleImages || autoPlayInterval <= 0) return;

    const interval = setInterval(() => {
      goToNext();
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [hasMultipleImages, autoPlayInterval, goToNext]);

  return (
    <div className="relative min-h-dvh w-screen max-w-full overflow-x-hidden">
      {/* Layer 1: Background Images (z-0) */}
      {hasImages && (
        <div className="absolute inset-0 z-0">
          {backgroundImages.map((image, index) => (
            <div
              key={image}
              className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
                index === currentIndex ? "opacity-100" : "opacity-0"
              }`}
            >
              <Image
                src={image}
                alt=""
                fill
                className="object-cover"
                priority={index === 0}
              />
              {/* Subtle overlay for better text contrast */}
              <div className="absolute inset-0 bg-black/30" />
            </div>
          ))}
        </div>
      )}

      {/* Layer 2: Ripple Effect (z-10) - semi-transparent when over images */}
      <div
        className="absolute inset-0 z-10"
        style={{ opacity: effectiveRippleOpacity / 100 }}
      >
        <BackgroundRippleEffect
          rows={rippleRows}
          cols={rippleCols}
          cellSize={rippleCellSize}
          mask={rippleMask}
        />
      </div>

      {/* Layer 3: Content (z-20) - pointer-events-none allows clicks through to ripple */}
      <div className="absolute inset-0 z-20 pointer-events-none [&_a]:pointer-events-auto [&_button]:pointer-events-auto [&_input]:pointer-events-auto">
        <HeroSection
          {...props}
          padding="sm"
          className={className}
          showArrows={false}
          carouselState={
            hasMultipleImages
              ? {
                  currentIndex,
                  totalSlides: backgroundImages.length,
                  goToSlide,
                }
              : undefined
          }
        />
      </div>
    </div>
  );
}
