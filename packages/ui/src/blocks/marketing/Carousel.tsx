"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import type { CSSProperties, KeyboardEvent, ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cx } from "./aceternity/shared";

export type CarouselNavigationMode = "bounded" | "wrap";
export type CarouselControlPlacement = "top" | "bottom" | "none";

export interface CarouselSlideImage {
  src: string;
  alt?: string;
}

export interface CarouselSlide {
  id?: string;
  title: ReactNode;
  description?: ReactNode;
  image?: CarouselSlideImage;
  badge?: ReactNode;
  footer?: ReactNode;
  ctaLabel?: ReactNode;
  href?: string;
  ariaLabel?: string;
}

export interface CarouselRenderContext<TItem> {
  index: number;
  currentIndex: number;
  isActive: boolean;
  isPrevious: boolean;
  isNext: boolean;
  item: TItem;
  goTo: (index: number) => void;
}

export interface CarouselProps<TItem extends CarouselSlide = CarouselSlide> {
  items: TItem[];
  renderItem?: (
    item: TItem,
    context: CarouselRenderContext<TItem>,
  ) => ReactNode;
  getItemKey?: (item: TItem, index: number) => string;
  ariaLabel?: string;
  emptyState?: ReactNode;
  initialIndex?: number;
  navigationMode?: CarouselNavigationMode;
  controlPlacement?: CarouselControlPlacement;
  showControls?: boolean;
  showIndicators?: boolean;
  showProgress?: boolean;
  keyboardControls?: boolean;
  onIndexChange?: (index: number, item: TItem) => void;
  previousLabel?: string;
  nextLabel?: string;
  slideLabel?: (item: TItem, index: number) => string;
  className?: string;
  headerClassName?: string;
  viewportClassName?: string;
  trackClassName?: string;
  itemClassName?: string;
  cardClassName?: string;
  imageClassName?: string;
  contentClassName?: string;
  controlsClassName?: string;
  controlButtonClassName?: string;
  indicatorsClassName?: string;
  indicatorButtonClassName?: string;
  activeIndicatorButtonClassName?: string;
  progressClassName?: string;
  progressTrackClassName?: string;
  progressIndicatorClassName?: string;
  slideWidth?: string;
  slideGap?: string;
}

function getBoundedIndex(index: number, length: number) {
  if (length <= 0) {
    return 0;
  }

  return Math.min(Math.max(index, 0), length - 1);
}

function getWrappedIndex(index: number, length: number) {
  if (length <= 0) {
    return 0;
  }

  return ((index % length) + length) % length;
}

function getNormalizedIndex(
  index: number,
  length: number,
  navigationMode: CarouselNavigationMode,
) {
  return navigationMode === "wrap"
    ? getWrappedIndex(index, length)
    : getBoundedIndex(index, length);
}

function isEditableKeyboardTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      ["INPUT", "SELECT", "TEXTAREA"].includes(target.tagName))
  );
}

function DefaultCarouselSlide({
  item,
  cardClassName,
  imageClassName,
  contentClassName,
}: {
  item: CarouselSlide;
  cardClassName?: string;
  imageClassName?: string;
  contentClassName?: string;
}) {
  const action = item.ctaLabel ? (
    item.href ? (
      <a
        className="mt-5 inline-flex w-fit items-center justify-center border border-white/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:border-white hover:bg-white hover:text-black"
        href={item.href}
      >
        {item.ctaLabel}
      </a>
    ) : (
      <button
        className="mt-5 inline-flex w-fit items-center justify-center border border-white/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:border-white hover:bg-white hover:text-black"
        type="button"
      >
        {item.ctaLabel}
      </button>
    )
  ) : null;

  return (
    <article
      aria-label={item.ariaLabel}
      className={cx(
        "relative flex min-h-[28rem] overflow-hidden bg-neutral-950 text-white",
        cardClassName,
      )}
      data-slot="carousel-card"
    >
      {item.image ? (
        <img
          alt={item.image.alt ?? ""}
          className={cx(
            "absolute inset-0 h-full w-full object-cover",
            imageClassName,
          )}
          data-slot="carousel-card-image"
          src={item.image.src}
        />
      ) : (
        <div
          className="absolute inset-0 bg-linear-to-br from-neutral-800 via-neutral-950 to-black"
          data-slot="carousel-card-image"
        />
      )}
      <div
        className="absolute inset-0 bg-linear-to-t from-black/80 via-black/15 to-black/10"
        data-slot="carousel-card-overlay"
      />
      {item.badge ? (
        <div
          className="absolute left-6 top-0 z-10 bg-primary px-5 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-primary-foreground"
          data-slot="carousel-card-badge"
        >
          {item.badge}
        </div>
      ) : null}
      <div
        className={cx(
          "relative z-10 mt-auto flex w-full flex-col items-center p-6 text-center",
          contentClassName,
        )}
        data-slot="carousel-card-content"
      >
        <h3 className="max-w-[14ch] text-3xl font-semibold leading-tight tracking-normal">
          {item.title}
        </h3>
        {item.description ? (
          <p className="mt-4 text-sm leading-6 text-white/85">
            {item.description}
          </p>
        ) : null}
        {item.footer ? (
          <p className="mt-1 text-sm font-semibold text-white">{item.footer}</p>
        ) : null}
        {action}
      </div>
    </article>
  );
}

export function Carousel<TItem extends CarouselSlide = CarouselSlide>({
  items,
  renderItem,
  getItemKey,
  ariaLabel = "Carousel",
  emptyState = null,
  initialIndex = 0,
  navigationMode = "bounded",
  controlPlacement = "bottom",
  showControls = true,
  showIndicators = true,
  showProgress = true,
  keyboardControls = true,
  onIndexChange,
  previousLabel = "Previous slide",
  nextLabel = "Next slide",
  slideLabel = (_item, index) => `Slide ${index + 1}`,
  className,
  headerClassName,
  viewportClassName,
  trackClassName,
  itemClassName,
  cardClassName,
  imageClassName,
  contentClassName,
  controlsClassName,
  controlButtonClassName,
  indicatorsClassName,
  indicatorButtonClassName,
  activeIndicatorButtonClassName,
  progressClassName,
  progressTrackClassName,
  progressIndicatorClassName,
  slideWidth = "min(28rem, 82vw)",
  slideGap = "2rem",
}: CarouselProps<TItem>) {
  const [currentIndex, setCurrentIndex] = useState(() =>
    getNormalizedIndex(initialIndex, items.length, navigationMode),
  );
  const lastNotifiedIndexRef = useRef(currentIndex);
  const hasItems = items.length > 0;
  const hasMultipleItems = items.length > 1;
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === items.length - 1;

  const resolveIndex = useCallback(
    (index: number) => getNormalizedIndex(index, items.length, navigationMode),
    [items.length, navigationMode],
  );

  const goTo = useCallback(
    (index: number) => {
      if (!hasItems) {
        return;
      }

      setCurrentIndex(resolveIndex(index));
    },
    [hasItems, resolveIndex],
  );

  const goPrevious = useCallback(() => {
    goTo(currentIndex - 1);
  }, [currentIndex, goTo]);

  const goNext = useCallback(() => {
    goTo(currentIndex + 1);
  }, [currentIndex, goTo]);

  useEffect(() => {
    setCurrentIndex((index) =>
      getNormalizedIndex(index, items.length, navigationMode),
    );
  }, [items.length, navigationMode]);

  useEffect(() => {
    if (!hasItems) {
      return;
    }

    if (lastNotifiedIndexRef.current === currentIndex) {
      return;
    }

    lastNotifiedIndexRef.current = currentIndex;
    onIndexChange?.(currentIndex, items[currentIndex]);
  }, [currentIndex, hasItems, items, onIndexChange]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      if (!keyboardControls || !hasMultipleItems) {
        return;
      }

      if (event.defaultPrevented || isEditableKeyboardTarget(event.target)) {
        return;
      }

      if (
        event.key !== "ArrowLeft" &&
        event.key !== "ArrowRight" &&
        event.key !== "Home" &&
        event.key !== "End"
      ) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      if (event.key === "ArrowLeft") {
        goPrevious();
      } else if (event.key === "ArrowRight") {
        goNext();
      } else if (event.key === "Home") {
        goTo(0);
      } else {
        goTo(items.length - 1);
      }
    },
    [
      goNext,
      goPrevious,
      goTo,
      items.length,
      hasMultipleItems,
      keyboardControls,
    ],
  );

  const canGoPrevious = navigationMode === "wrap" || !isFirst;
  const canGoNext = navigationMode === "wrap" || !isLast;
  const progressPercent = hasItems
    ? ((currentIndex + 1) / items.length) * 100
    : 0;
  const carouselStyle = useMemo(
    () =>
      ({
        "--carousel-active-index": currentIndex,
        "--carousel-slide-width": slideWidth,
        "--carousel-slide-gap": slideGap,
      }) as CSSProperties,
    [currentIndex, slideGap, slideWidth],
  );

  const controls =
    showControls && hasMultipleItems && controlPlacement !== "none" ? (
      <div
        className={cx("flex items-center gap-2", controlsClassName)}
        data-slot="carousel-controls"
      >
        <button
          aria-label={previousLabel}
          className={cx(
            "inline-flex size-10 items-center justify-center border border-border bg-background text-foreground transition hover:border-primary hover:text-primary disabled:pointer-events-none disabled:opacity-40",
            controlButtonClassName,
          )}
          disabled={!canGoPrevious}
          onClick={goPrevious}
          type="button"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
        </button>
        <button
          aria-label={nextLabel}
          className={cx(
            "inline-flex size-10 items-center justify-center border border-border bg-background text-foreground transition hover:border-primary hover:text-primary disabled:pointer-events-none disabled:opacity-40",
            controlButtonClassName,
          )}
          disabled={!canGoNext}
          onClick={goNext}
          type="button"
        >
          <ArrowRight aria-hidden="true" className="size-4" />
        </button>
      </div>
    ) : null;

  return (
    <section
      aria-label={ariaLabel}
      className={cx("relative", className)}
      data-slot="carousel"
      onKeyDown={handleKeyDown}
      style={carouselStyle}
      tabIndex={keyboardControls && hasMultipleItems ? 0 : undefined}
    >
      {controlPlacement === "top" && controls ? (
        <div
          className={cx("mb-6 flex justify-end", headerClassName)}
          data-slot="carousel-header"
        >
          {controls}
        </div>
      ) : null}

      {hasItems ? (
        <>
          <div
            className={cx("overflow-hidden", viewportClassName)}
            data-slot="carousel-viewport"
          >
            <div
              className={cx(
                "flex gap-[var(--carousel-slide-gap)] transition-transform duration-500 ease-out",
                trackClassName,
              )}
              data-slot="carousel-track"
              style={{
                transform:
                  "translateX(calc(var(--carousel-active-index) * (var(--carousel-slide-width) + var(--carousel-slide-gap)) * -1))",
              }}
            >
              {items.map((item, index) => {
                const key =
                  getItemKey?.(item, index) ?? item.id ?? String(index);
                const previousIndex =
                  navigationMode === "wrap"
                    ? getWrappedIndex(currentIndex - 1, items.length)
                    : currentIndex - 1;
                const nextIndex =
                  navigationMode === "wrap"
                    ? getWrappedIndex(currentIndex + 1, items.length)
                    : currentIndex + 1;
                const context: CarouselRenderContext<TItem> = {
                  index,
                  currentIndex,
                  isActive: index === currentIndex,
                  isPrevious: hasMultipleItems && index === previousIndex,
                  isNext: hasMultipleItems && index === nextIndex,
                  item,
                  goTo,
                };

                return (
                  <div
                    className={cx(
                      "min-w-[var(--carousel-slide-width)] shrink-0",
                      itemClassName,
                    )}
                    data-active={index === currentIndex ? "true" : "false"}
                    data-slot="carousel-item"
                    key={key}
                  >
                    {renderItem ? (
                      renderItem(item, context)
                    ) : (
                      <DefaultCarouselSlide
                        cardClassName={cardClassName}
                        contentClassName={contentClassName}
                        imageClassName={imageClassName}
                        item={item}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {showProgress && hasMultipleItems ? (
            <div
              className={cx("mt-8", progressClassName)}
              data-slot="carousel-progress"
            >
              <div
                className={cx("h-px bg-border", progressTrackClassName)}
                data-slot="carousel-progress-track"
              >
                <div
                  className={cx(
                    "h-full bg-primary transition-all duration-500 ease-out",
                    progressIndicatorClassName,
                  )}
                  data-slot="carousel-progress-indicator"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="sr-only" aria-live="polite">
                {slideLabel(items[currentIndex], currentIndex)} of{" "}
                {items.length}
              </div>
            </div>
          ) : null}

          {showIndicators && hasMultipleItems ? (
            <div
              className={cx(
                "mt-4 flex items-center gap-2",
                indicatorsClassName,
              )}
              data-slot="carousel-indicators"
            >
              {items.map((item, index) => {
                const isActive = index === currentIndex;

                return (
                  <button
                    aria-current={isActive ? "true" : undefined}
                    aria-label={slideLabel(item, index)}
                    className={cx(
                      "h-1.5 w-8 border border-border bg-muted transition hover:border-primary hover:bg-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                      isActive && "border-primary bg-primary",
                      indicatorButtonClassName,
                      isActive && activeIndicatorButtonClassName,
                    )}
                    data-active={isActive ? "true" : "false"}
                    data-slot="carousel-indicator"
                    key={getItemKey?.(item, index) ?? item.id ?? String(index)}
                    onClick={() => goTo(index)}
                    type="button"
                  />
                );
              })}
            </div>
          ) : null}
        </>
      ) : (
        <div data-slot="carousel-empty">{emptyState}</div>
      )}

      {controlPlacement === "bottom" && controls ? (
        <div
          className={cx("mt-6 flex justify-end", headerClassName)}
          data-slot="carousel-footer"
        >
          {controls}
        </div>
      ) : null}
    </section>
  );
}
