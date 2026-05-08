"use client";

import { AnimatePresence, motion } from "motion/react";
import type { KeyboardEvent, ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  const [activeDurationSeconds, setActiveDurationSeconds] =
    useState(durationSeconds);
  const lastNotifiedIndexRef = useRef(currentIndex);
  const currentImage = normalizedImages[currentIndex] ?? null;
  const hasMultipleImages = normalizedImages.length > 1;

  const showIndex = useCallback(
    (index: number, nextDurationSeconds = durationSeconds) => {
      setActiveDurationSeconds(nextDurationSeconds);
      setCurrentIndex(getWrappedIndex(index, normalizedImages.length));
    },
    [durationSeconds, normalizedImages.length],
  );

  const showNext = useCallback(() => {
    setActiveDurationSeconds(durationSeconds);
    setCurrentIndex((current) =>
      getWrappedIndex(current + 1, normalizedImages.length),
    );
  }, [durationSeconds, normalizedImages.length]);

  const showNextWithDuration = useCallback(
    (nextDurationSeconds: number) => {
      setActiveDurationSeconds(nextDurationSeconds);
      setCurrentIndex((current) =>
        getWrappedIndex(current + 1, normalizedImages.length),
      );
    },
    [normalizedImages.length],
  );

  const showPreviousWithDuration = useCallback(
    (nextDurationSeconds: number) => {
      setActiveDurationSeconds(nextDurationSeconds);
      setCurrentIndex((current) =>
        getWrappedIndex(current - 1, normalizedImages.length),
      );
    },
    [normalizedImages.length],
  );

  useEffect(() => {
    setCurrentIndex((current) =>
      getWrappedIndex(current, normalizedImages.length),
    );
  }, [normalizedImages.length]);

  useEffect(() => {
    if (lastNotifiedIndexRef.current === currentIndex) {
      return;
    }

    lastNotifiedIndexRef.current = currentIndex;
    onIndexChange?.(currentIndex);
  }, [currentIndex, onIndexChange]);

  useEffect(() => {
    if (!hasWindow()) {
      return;
    }

    for (const image of normalizedImages) {
      const preload = new window.Image();
      preload.src = image.src;
    }
  }, [normalizedImages]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: currentIndex intentionally restarts autoplay after any navigation.
  useEffect(() => {
    if (!autoplay || !motionEnabled || !hasMultipleImages) {
      return;
    }

    const timer = window.setTimeout(showNext, intervalMs);

    return () => window.clearTimeout(timer);
  }, [
    autoplay,
    currentIndex,
    hasMultipleImages,
    intervalMs,
    motionEnabled,
    showNext,
  ]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      if (!keyboardControls || !hasMultipleImages) {
        return;
      }

      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      if (event.key === "ArrowRight") {
        showNextWithDuration(keyboardDurationSeconds);
      } else {
        showPreviousWithDuration(keyboardDurationSeconds);
      }
    },
    [
      hasMultipleImages,
      keyboardControls,
      keyboardDurationSeconds,
      showNextWithDuration,
      showPreviousWithDuration,
    ],
  );

  const handleSectionKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      const target = event.target;
      const isEditableTarget =
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          ["INPUT", "SELECT", "TEXTAREA"].includes(target.tagName));

      if (event.defaultPrevented || isEditableTarget) {
        return;
      }

      handleKeyDown(event);
    },
    [handleKeyDown],
  );

  const keyboardTabIndex =
    keyboardControls && hasMultipleImages ? 0 : undefined;

  const exitY = direction === "up" ? "-100%" : "100%";

  return (
    <section
      aria-label={ariaLabel}
      className={cx("relative isolate overflow-hidden bg-black", className)}
      data-slot="images-slider"
      onKeyDown={handleSectionKeyDown}
      tabIndex={keyboardTabIndex}
    >
      {currentImage ? (
        <AnimatePresence initial={false}>
          <motion.img
            alt={currentImage.alt ?? ""}
            animate={{ opacity: 1, y: "0%" }}
            className={cx(
              "absolute inset-0 z-0 h-full w-full object-cover",
              imageClassName,
            )}
            data-slot="images-slider-image"
            exit={
              motionEnabled
                ? {
                    opacity: 1,
                    y: exitY,
                    zIndex: 1,
                  }
                : undefined
            }
            initial={false}
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
