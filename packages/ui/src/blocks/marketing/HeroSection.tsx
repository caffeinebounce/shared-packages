"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { type ReactNode, useCallback, useEffect, useState } from "react";
import { Button } from "../../components/ui/button";

export interface CarouselState {
  currentIndex: number;
  totalSlides: number;
  goToSlide: (index: number) => void;
}

export interface HeroSectionProps {
  /** Main heading */
  heading: ReactNode;
  /** Subheading/subtitle */
  subheading?: ReactNode;
  /** CTA button config */
  cta?: {
    label: string;
    href: string;
  };
  /** Background images for carousel */
  backgroundImages?: string[];
  /** Auto-play interval in milliseconds */
  autoPlayInterval?: number;
  /** Show navigation arrows (default: true) */
  showArrows?: boolean;
  /** External carousel state (when images are managed by parent) */
  carouselState?: CarouselState;
  /** Logo configuration */
  logo?: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
  };
  /** Background variant */
  background?: "default" | "muted" | "accent";
  /** Padding size */
  padding?: "sm" | "md" | "lg";
  /** Custom class name */
  className?: string;
  children?: ReactNode;
}

const paddingClasses = {
  sm: "py-12 md:py-16",
  md: "py-16 md:py-24",
  lg: "py-20 md:py-28",
};

const backgroundClasses = {
  default: "",
  muted: "bg-muted/30",
  accent: "bg-accent/10",
};

export function HeroSection({
  heading,
  subheading,
  cta,
  backgroundImages = [],
  autoPlayInterval = 5000,
  showArrows = true,
  carouselState,
  logo,
  background = "default",
  padding = "lg",
  className = "",
  children,
}: HeroSectionProps) {
  const [internalIndex, setInternalIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const hasImages = backgroundImages.length > 0;
  const hasMultipleImages = backgroundImages.length > 1;

  // Use external carousel state if provided, otherwise use internal state
  const currentIndex = carouselState?.currentIndex ?? internalIndex;
  const totalSlides = carouselState?.totalSlides ?? backgroundImages.length;
  const hasMultipleSlides = totalSlides > 1;

  const goToSlide = useCallback(
    (index: number) => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      if (carouselState?.goToSlide) {
        carouselState.goToSlide(index);
      } else {
        setInternalIndex(index);
      }
      setTimeout(() => setIsTransitioning(false), 500);
    },
    [isTransitioning, carouselState],
  );

  const goToPrevious = useCallback(() => {
    const newIndex = currentIndex === 0 ? totalSlides - 1 : currentIndex - 1;
    goToSlide(newIndex);
  }, [currentIndex, totalSlides, goToSlide]);

  const goToNext = useCallback(() => {
    const newIndex = currentIndex === totalSlides - 1 ? 0 : currentIndex + 1;
    goToSlide(newIndex);
  }, [currentIndex, totalSlides, goToSlide]);

  // Auto-play (only when using internal state)
  useEffect(() => {
    if (carouselState || !hasMultipleImages || autoPlayInterval <= 0) return;

    const interval = setInterval(() => {
      goToNext();
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [carouselState, hasMultipleImages, autoPlayInterval, goToNext]);

  return (
    <div
      className={`relative flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] text-center overflow-hidden ${backgroundClasses[background]} ${paddingClasses[padding]} ${className}`}
    >
      {/* Background Image Slider */}
      {hasImages && (
        <div className="absolute inset-0 -z-10">
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
              {/* Overlay for text readability */}
              <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px]" />
            </div>
          ))}
        </div>
      )}

      {/* Navigation Arrows */}
      {showArrows && hasMultipleImages && (
        <>
          <button
            type="button"
            onClick={goToPrevious}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-background/50 hover:bg-background/80 backdrop-blur-sm transition-all duration-200 group"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6 text-foreground/70 group-hover:text-foreground transition-colors" />
          </button>
          <button
            type="button"
            onClick={goToNext}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-background/50 hover:bg-background/80 backdrop-blur-sm transition-all duration-200 group"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6 text-foreground/70 group-hover:text-foreground transition-colors" />
          </button>
        </>
      )}

      {/* Logo */}
      {logo && (
        <div className="mb-8 z-10">
          <Image
            src={logo.src}
            alt={logo.alt}
            width={logo.width ?? 120}
            height={logo.height ?? 120}
            className="mx-auto dark:invert"
          />
        </div>
      )}

      {/* Hero Content */}
      <div className="z-10 px-4">
        {typeof heading === "string" ? (
          // Responsive heading: clamp between 2.25rem (~36px) and 3.75rem (~60px),
          // scaling with viewport width via 5vw + 1rem to keep hero titles legible on all screens.
          <h1
            className="font-bold tracking-tight text-foreground mb-4"
            style={{ fontSize: "clamp(2.25rem, 5vw + 1rem, 3.75rem)" }}
          >
            {heading}
          </h1>
        ) : (
          heading
        )}

        {subheading && (
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-8 mx-auto">
            {subheading}
          </p>
        )}

        {/* CTA Button */}
        {cta && (
          <Button asChild size="lg" className="px-12">
            <a href={cta.href}>{cta.label}</a>
          </Button>
        )}

        {children}
      </div>

      {/* Dot Indicators */}
      {hasMultipleSlides && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              type="button"
              key={`slide-dot-${index}`}
              onClick={() => goToSlide(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "bg-primary w-8"
                  : "bg-foreground/30 hover:bg-foreground/50"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Bottom Divider */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-border" />
    </div>
  );
}
