"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Button } from "../../components/ui/button";
import { Container } from "../../components/ui/container";
import { cn } from "../../utils";

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
  /** Custom media/background layer rendered behind the hero content. */
  backgroundLayer?: ReactNode;
  /** Optional overlay rendered above the background layer and below content. */
  overlay?: ReactNode;
  /** Padding size */
  padding?: "sm" | "md" | "lg";
  /** Custom class name */
  className?: string;
  /** Custom class name for the full-height content container. */
  containerClassName?: string;
  /** Custom class name for the copy/content pane. */
  contentClassName?: string;
  /** Custom class name applied to string headings. */
  headingClassName?: string;
  /** Custom class name applied to string subheadings. */
  subheadingClassName?: string;
  /** Custom class name applied to the default CTA button. */
  ctaClassName?: string;
  /** Custom actions rendered after the default CTA. */
  actions?: ReactNode;
  /** Vertical position for the content container. */
  contentPosition?: "start" | "center" | "end";
  /** Horizontal text alignment for default hero copy. */
  contentAlignment?: "start" | "center";
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

const contentPositionClasses = {
  start: "items-start justify-center",
  center: "items-center justify-center",
  end: "items-end justify-center",
};

const contentAlignmentClasses = {
  start: "text-left",
  center: "text-center",
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
  backgroundLayer,
  overlay,
  padding = "lg",
  className = "",
  containerClassName,
  contentClassName,
  headingClassName,
  subheadingClassName,
  ctaClassName,
  actions,
  contentPosition = "center",
  contentAlignment = "center",
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

  // Touch/swipe support
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !hasMultipleSlides) return;

    const onTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchStart.current = { x: touch.clientX, y: touch.clientY };
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!touchStart.current) return;
      const touch = e.changedTouches[0];
      const dx = touch.clientX - touchStart.current.x;
      const dy = touch.clientY - touchStart.current.y;
      touchStart.current = null;

      // Horizontal swipe > 50px and more horizontal than vertical
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) goToNext();
        else goToPrevious();
      }
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [hasMultipleSlides, goToNext, goToPrevious]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex min-h-dvh flex-col overflow-hidden",
        backgroundClasses[background],
        paddingClasses[padding],
        className,
      )}
      data-slot="hero-section"
    >
      {backgroundLayer ? (
        <div className="absolute inset-0 z-0" data-slot="hero-background">
          {backgroundLayer}
        </div>
      ) : null}

      {/* Background Image Slider */}
      {!backgroundLayer && hasImages && (
        <div className="absolute inset-0 z-0" data-slot="hero-background">
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

      {overlay ? (
        <div
          className="pointer-events-none absolute inset-0 z-0"
          data-slot="hero-overlay"
        >
          {overlay}
        </div>
      ) : null}

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

      <Container
        className={cn(
          "relative z-10 flex flex-1",
          contentPositionClasses[contentPosition],
          containerClassName,
        )}
        data-slot="hero-section-container"
      >
        {/* Hero Content */}
        <div
          className={cn(
            "z-10",
            contentAlignmentClasses[contentAlignment],
            contentClassName,
          )}
          data-slot="hero-section-content"
        >
          {typeof heading === "string" ? (
            // Responsive heading: clamp between 2.25rem (~36px) and 3.75rem (~60px),
            // scaling with viewport width via 5vw + 1rem to keep hero titles legible on all screens.
            <h1
              className={cn(
                "mb-4 font-bold tracking-tight text-foreground",
                headingClassName,
              )}
              style={{ fontSize: "clamp(2.25rem, 5vw + 1rem, 3.75rem)" }}
            >
              {heading}
            </h1>
          ) : (
            heading
          )}

          {subheading && typeof subheading === "string" ? (
            <p
              className={cn(
                "mx-auto mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl",
                contentAlignment === "start" ? "mx-0" : undefined,
                subheadingClassName,
              )}
            >
              {subheading}
            </p>
          ) : (
            subheading
          )}

          {/* CTA Button */}
          {cta && (
            <Button asChild size="lg" className={cn("px-12", ctaClassName)}>
              <a href={cta.href}>{cta.label}</a>
            </Button>
          )}

          {actions}
          {children}
        </div>
      </Container>

      {/* Dot Indicators */}
      {hasMultipleSlides && (
        <div className="absolute bottom-8 inset-x-0 flex items-center justify-center gap-1 z-20">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              type="button"
              key={`slide-dot-${index}`}
              onClick={() => goToSlide(index)}
              className="relative flex items-center justify-center p-3"
              aria-label={`Go to slide ${index + 1}`}
            >
              <span
                className={`block h-2.5 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "w-8 bg-primary"
                    : "w-2.5 bg-foreground/30"
                }`}
              />
            </button>
          ))}
        </div>
      )}

      {/* Bottom Divider */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-border" />
    </div>
  );
}
