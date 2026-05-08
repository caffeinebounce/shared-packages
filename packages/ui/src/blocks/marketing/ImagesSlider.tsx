"use client";

import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { cx, hasWindow } from "./aceternity/shared";
import { useMotionEnabled } from "./aceternity/useMotionEnabled";

export type ImagesSliderDirection = "up" | "down";

export interface ImagesSliderImage {
  src: string;
  alt?: string;
}

export interface ImagesSliderProps {
  images: Array<string | ImagesSliderImage>;
  children?: ReactNode;
  overlay?: boolean | ReactNode;
  overlayClassName?: string;
  className?: string;
  imageClassName?: string;
  autoplay?: boolean;
  intervalMs?: number;
  direction?: ImagesSliderDirection;
  durationSeconds?: number;
  keyboardDurationSeconds?: number;
  showIndicators?: boolean;
  indicatorClassName?: string;
  indicatorButtonClassName?: string;
  activeIndicatorClassName?: string;
  keyboardControls?: boolean;
  onIndexChange?: (index: number) => void;
  ariaLabel?: string;
}

function normalizeImage(
  image: string | ImagesSliderImage,
  index: number,
): ImagesSliderImage {
  if (typeof image === "string") {
    return { src: image, alt: "" };
  }

  return {
    src: image.src,
    alt: image.alt ?? `Slider image ${index + 1}`,
  };
}

function getWrappedIndex(index: number, length: number) {
  if (length <= 0) {
    return 0;
  }

  return ((index % length) + length) % length;
}

export function ImagesSlider({
  images,
  children,
  overlay = true,
  overlayClassName,
  className,
  imageClassName,
  autoplay = true,
  intervalMs = 5000,
  direction = "up",
  durationSeconds = 0.7,
  keyboardDurationSeconds = 0.3,
  showIndicators = true,
  indicatorClassName,
  indicatorButtonClassName,
  activeIndicatorClassName,
  keyboardControls = true,
  onIndexChange,
  ariaLabel = "Image slider",
}: ImagesSliderProps) {
  const motionEnabled = useMotionEnabled();
  const normalizedImages = useMemo(
    () => images.map((image, index) => normalizeImage(image, index)),
    [images],
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasRendered, setHasRendered] = useState(false);
  const [activeDurationSeconds, setActiveDurationSeconds] =
    useState(durationSeconds);
  const currentImage = normalizedImages[currentIndex] ?? null;
  const hasMultipleImages = normalizedImages.length > 1;

  const showIndex = useCallback(
    (index: number, nextDurationSeconds = durationSeconds) => {
      setActiveDurationSeconds(nextDurationSeconds);
      setCurrentIndex((current) => {
        const next = getWrappedIndex(index, normalizedImages.length);

        if (next !== current) {
          onIndexChange?.(next);
        }

        return next;
      });
    },
    [durationSeconds, normalizedImages.length, onIndexChange],
  );

  const showNext = useCallback(() => {
    setActiveDurationSeconds(durationSeconds);
    setCurrentIndex((current) => {
      const next = getWrappedIndex(current + 1, normalizedImages.length);

      if (next !== current) {
        onIndexChange?.(next);
      }

      return next;
    });
  }, [durationSeconds, normalizedImages.length, onIndexChange]);

  const showNextWithDuration = useCallback(
    (nextDurationSeconds: number) => {
      setActiveDurationSeconds(nextDurationSeconds);
      setCurrentIndex((current) => {
        const next = getWrappedIndex(current + 1, normalizedImages.length);

        if (next !== current) {
          onIndexChange?.(next);
        }

        return next;
      });
    },
    [normalizedImages.length, onIndexChange],
  );

  const showPreviousWithDuration = useCallback(
    (nextDurationSeconds: number) => {
      setActiveDurationSeconds(nextDurationSeconds);
      setCurrentIndex((current) => {
        const next = getWrappedIndex(current - 1, normalizedImages.length);

        if (next !== current) {
          onIndexChange?.(next);
        }

        return next;
      });
    },
    [normalizedImages.length, onIndexChange],
  );

  useEffect(() => {
    setHasRendered(true);
  }, []);

  useEffect(() => {
    setCurrentIndex((current) =>
      getWrappedIndex(current, normalizedImages.length),
    );
  }, [normalizedImages.length]);

  useEffect(() => {
    if (!hasWindow()) {
      return;
    }

    for (const image of normalizedImages) {
      const preload = new window.Image();
      preload.src = image.src;
    }
  }, [normalizedImages]);

  useEffect(() => {
    if (!autoplay || !motionEnabled || !hasMultipleImages) {
      return;
    }

    const timer = window.setInterval(showNext, intervalMs);

    return () => window.clearInterval(timer);
  }, [autoplay, hasMultipleImages, intervalMs, motionEnabled, showNext]);

  useEffect(() => {
    if (!keyboardControls || !hasWindow() || !hasMultipleImages) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      const isEditableTarget =
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          ["INPUT", "SELECT", "TEXTAREA"].includes(target.tagName));

      if (event.defaultPrevented || isEditableTarget) {
        return;
      }

      if (event.key === "ArrowRight") {
        showNextWithDuration(keyboardDurationSeconds);
      } else if (event.key === "ArrowLeft") {
        showPreviousWithDuration(keyboardDurationSeconds);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    hasMultipleImages,
    keyboardControls,
    keyboardDurationSeconds,
    showNextWithDuration,
    showPreviousWithDuration,
  ]);

  const initialY = direction === "up" ? "100%" : "-100%";
  const exitY = direction === "up" ? "-100%" : "100%";

  return (
    <section
      aria-label={ariaLabel}
      className={cx("relative isolate overflow-hidden bg-black", className)}
      data-slot="images-slider"
    >
      {currentImage ? (
        <AnimatePresence initial={false}>
          <motion.img
            alt={currentImage.alt ?? ""}
            animate={{ opacity: 1, y: "0%" }}
            className={cx(
              "absolute inset-0 h-full w-full object-cover",
              imageClassName,
            )}
            data-slot="images-slider-image"
            exit={
              motionEnabled
                ? {
                    opacity: 0,
                    y: exitY,
                  }
                : undefined
            }
            initial={
              motionEnabled && hasRendered
                ? {
                    opacity: 0,
                    y: initialY,
                  }
                : false
            }
            key={`${currentImage.src}-${currentIndex}`}
            src={currentImage.src}
            transition={{
              duration: motionEnabled ? activeDurationSeconds : 0,
              ease: "easeInOut",
            }}
          />
        </AnimatePresence>
      ) : (
        <div
          className="absolute inset-0 bg-muted"
          data-slot="images-slider-empty"
        />
      )}

      {overlay ? (
        typeof overlay === "boolean" ? (
          <div
            className={cx(
              "absolute inset-0 z-10 bg-black/50",
              overlayClassName,
            )}
            data-slot="images-slider-overlay"
          />
        ) : (
          <div
            className={cx("absolute inset-0 z-10", overlayClassName)}
            data-slot="images-slider-overlay"
          >
            {overlay}
          </div>
        )
      ) : null}

      {children ? (
        <div className="relative z-20 h-full" data-slot="images-slider-content">
          {children}
        </div>
      ) : null}

      {showIndicators && hasMultipleImages ? (
        <div
          className={cx(
            "absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 gap-2",
            indicatorClassName,
          )}
          data-slot="images-slider-indicators"
        >
          {normalizedImages.map((image, index) => (
            <button
              aria-current={index === currentIndex ? "true" : undefined}
              aria-label={`Show image ${index + 1}`}
              data-active={index === currentIndex ? "true" : "false"}
              className={cx(
                "h-1.5 w-6 border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-black",
                index === currentIndex
                  ? "border-primary bg-primary hover:bg-primary"
                  : "border-white/45 bg-white/35 hover:bg-white/70",
                indicatorButtonClassName,
                index === currentIndex && activeIndicatorClassName,
              )}
              key={`${image.src}-${index}`}
              onClick={() => showIndex(index)}
              type="button"
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
