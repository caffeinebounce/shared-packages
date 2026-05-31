"use client";

import { ArrowLeft, ArrowRight, X } from "lucide-react";
import type { ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cx } from "./aceternity/shared";

export interface AppleCardsCarouselCard {
  id?: string;
  src: string;
  title: ReactNode;
  category: ReactNode;
  content: ReactNode;
  imageAlt?: string;
  ariaLabel?: string;
}

export interface AppleCardsCarouselProps {
  items: ReactNode[];
  initialScroll?: number;
  scrollAmount?: number;
  ariaLabel?: string;
  showControls?: boolean;
  previousLabel?: string;
  nextLabel?: string;
  className?: string;
  viewportClassName?: string;
  trackClassName?: string;
  controlsClassName?: string;
  controlButtonClassName?: string;
}

export interface AppleCardProps {
  card: AppleCardsCarouselCard;
  index: number;
  layout?: boolean;
  openLabel?: string;
  closeLabel?: string;
  onOpenChange?: (open: boolean, card: AppleCardsCarouselCard) => void;
  renderTriggerOverlay?: (
    card: AppleCardsCarouselCard,
    index: number,
  ) => ReactNode;
  renderContent?: (card: AppleCardsCarouselCard, index: number) => ReactNode;
  className?: string;
  imageClassName?: string;
  contentClassName?: string;
  modalClassName?: string;
  modalPanelClassName?: string;
  modalContentClassName?: string;
}

export function AppleCardsCarousel({
  items,
  initialScroll = 0,
  scrollAmount = 432,
  ariaLabel = "Apple cards carousel",
  showControls = true,
  previousLabel = "Scroll carousel left",
  nextLabel = "Scroll carousel right",
  className,
  viewportClassName,
  trackClassName,
  controlsClassName,
  controlButtonClassName,
}: AppleCardsCarouselProps) {
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!viewportRef.current) {
      return;
    }

    viewportRef.current.scrollLeft = initialScroll;
  }, [initialScroll]);

  const scrollByAmount = useCallback(
    (direction: -1 | 1) => {
      viewportRef.current?.scrollBy({
        behavior: "smooth",
        left: direction * scrollAmount,
      });
    },
    [scrollAmount],
  );

  return (
    <section
      aria-label={ariaLabel}
      className={cx("relative w-full", className)}
      data-slot="apple-cards-carousel"
    >
      <div
        className={cx(
          "overflow-x-auto overscroll-x-contain scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          viewportClassName,
        )}
        data-slot="apple-cards-viewport"
        ref={viewportRef}
      >
        <div
          className={cx("flex w-max gap-4 px-4 py-8 md:gap-6", trackClassName)}
          data-slot="apple-cards-track"
        >
          {items.map((item, index) => (
            <div data-slot="apple-cards-item" key={index}>
              {item}
            </div>
          ))}
        </div>
      </div>

      {showControls && items.length > 1 ? (
        <div
          className={cx("mt-4 flex justify-end gap-2 px-4", controlsClassName)}
          data-slot="apple-cards-controls"
        >
          <button
            aria-label={previousLabel}
            className={cx(
              "inline-flex size-10 items-center justify-center rounded-full bg-muted text-foreground transition hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              controlButtonClassName,
            )}
            onClick={() => scrollByAmount(-1)}
            type="button"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
          </button>
          <button
            aria-label={nextLabel}
            className={cx(
              "inline-flex size-10 items-center justify-center rounded-full bg-muted text-foreground transition hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              controlButtonClassName,
            )}
            onClick={() => scrollByAmount(1)}
            type="button"
          >
            <ArrowRight aria-hidden="true" className="size-4" />
          </button>
        </div>
      ) : null}
    </section>
  );
}

export function AppleCard({
  card,
  index,
  layout = false,
  openLabel,
  closeLabel = "Close card",
  onOpenChange,
  renderTriggerOverlay,
  renderContent,
  className,
  imageClassName,
  contentClassName,
  modalClassName,
  modalPanelClassName,
  modalContentClassName,
}: AppleCardProps) {
  const [open, setOpen] = useState(false);

  const setModalOpen = useCallback(
    (nextOpen: boolean) => {
      setOpen(nextOpen);
      onOpenChange?.(nextOpen, card);
    },
    [card, onOpenChange],
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setModalOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, setModalOpen]);

  const triggerLabel = openLabel ?? `Open ${card.ariaLabel ?? card.title}`;
  const content = renderContent?.(card, index) ?? card.content;

  return (
    <>
      <button
        aria-label={triggerLabel}
        className={cx(
          "group relative flex h-[28rem] w-80 shrink-0 overflow-hidden rounded-3xl bg-neutral-900 text-left text-white shadow-sm outline-none transition hover:scale-[1.01] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background md:h-[32rem] md:w-96",
          className,
        )}
        data-layout={layout ? "true" : "false"}
        data-slot="apple-card"
        onClick={() => setModalOpen(true)}
        type="button"
      >
        <img
          alt={card.imageAlt ?? String(card.title)}
          className={cx(
            "absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105",
            imageClassName,
          )}
          data-slot="apple-card-image"
          src={card.src}
        />
        <span
          className="absolute inset-0 bg-linear-to-b from-black/70 via-black/10 to-black/40"
          data-slot="apple-card-overlay"
        />
        <span
          className={cx(
            "relative z-10 flex h-full flex-col justify-between p-8",
            contentClassName,
          )}
          data-slot="apple-card-trigger-content"
        >
          <span>
            <span
              className="block text-sm font-medium text-white/80"
              data-slot="apple-card-category"
            >
              {card.category}
            </span>
            <span
              className="mt-2 block max-w-xs text-2xl font-semibold leading-tight tracking-normal text-white md:text-3xl"
              data-slot="apple-card-title"
            >
              {card.title}
            </span>
          </span>
          {renderTriggerOverlay?.(card, index)}
        </span>
      </button>

      {open ? (
        <div
          aria-modal="true"
          className={cx(
            "fixed inset-0 z-50 overflow-y-auto bg-black/65 p-4 backdrop-blur-sm md:p-8",
            modalClassName,
          )}
          data-slot="apple-card-modal"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setModalOpen(false);
            }
          }}
          role="dialog"
        >
          <div
            className={cx(
              "relative mx-auto max-w-5xl rounded-3xl bg-background p-6 text-foreground shadow-2xl md:p-10",
              modalPanelClassName,
            )}
            data-slot="apple-card-modal-panel"
          >
            <button
              aria-label={closeLabel}
              className="absolute right-4 top-4 inline-flex size-9 items-center justify-center rounded-full bg-muted text-foreground transition hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              onClick={() => setModalOpen(false)}
              type="button"
            >
              <X aria-hidden="true" className="size-4" />
            </button>
            <div className="pr-10">
              <p className="text-sm font-medium text-muted-foreground">
                {card.category}
              </p>
              <h2 className="mt-2 text-3xl font-semibold leading-tight tracking-normal md:text-5xl">
                {card.title}
              </h2>
            </div>
            <div
              className={cx("mt-8", modalContentClassName)}
              data-slot="apple-card-modal-content"
            >
              {content}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
