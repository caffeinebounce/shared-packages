"use client";

import React, { useState } from "react";

import { cn } from "../../utils";

export interface FocusCard {
  /** Title displayed as overlay on the focused card */
  title: string;
  /** Image source URL (remote or local) */
  src: string;
}

export interface FocusCardsProps {
  /** Array of focus cards to render (typically 3-6 for best visual impact) */
  cards: FocusCard[];
  /** Additional classes for the root grid container. Use to override cols/gap e.g. "md:grid-cols-4 gap-6" */
  className?: string;
}

export const FocusCardItem = React.memo(
  ({
    card,
    index,
    hovered,
    setHovered,
  }: {
    card: FocusCard;
    index: number;
    hovered: number | null;
    setHovered: React.Dispatch<React.SetStateAction<number | null>>;
  }) => {
    return (
      <button
        type="button"
        onMouseEnter={() => setHovered(index)}
        onMouseLeave={() => setHovered(null)}
        onFocus={() => setHovered(index)}
        onBlur={() => setHovered(null)}
        className={cn(
          "block rounded-lg relative bg-gray-100 dark:bg-neutral-900 overflow-hidden h-60 md:h-96 w-full border-0 p-0 text-left appearance-none transition-all duration-300 ease-out cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4426] focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          hovered !== null && hovered !== index && "blur-sm scale-[0.98]",
          hovered === index &&
            "ring-1 ring-[#FF4426]/40 shadow-[0_0_0_1px_rgba(255,68,38,0.15)]",
        )}
        aria-label={card.title}
        data-slot="focus-card"
      >
        <img
          src={card.src}
          alt={card.title}
          className={cn(
            "object-cover absolute inset-0 w-full h-full transition-[filter] duration-300",
            hovered === index && "brightness-[1.08] contrast-[1.1]",
          )}
          loading="lazy"
        />

        {/* Factory orange chrome highlight layer: metallic sheen / highlight that appears on the focused card.
            Base images are grayscale photoreal; on hover the active card gets factory-orange (#FF4426) chrome reflections. */}
        <div
          className={cn(
            "absolute inset-0 pointer-events-none transition-opacity duration-300 mix-blend-screen",
            hovered === index ? "opacity-75" : "opacity-0",
            "bg-[linear-gradient(135deg,rgba(255,68,38,0.12)_0%,rgba(255,68,38,0.45)_18%,rgba(255,68,38,0.18)_42%,transparent_68%),radial-gradient(circle_at_25%_30%,rgba(255,68,38,0.22)_0%,transparent_55%)]",
          )}
        />

        <div
          className={cn(
            "absolute inset-0 bg-black/50 flex items-end py-8 px-4 transition-opacity duration-300",
            hovered === index ? "opacity-100" : "opacity-0",
          )}
        >
          <div className="text-xl md:text-2xl font-medium bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-200">
            {card.title}
          </div>
        </div>
      </button>
    );
  },
);

FocusCardItem.displayName = "FocusCardItem";

/**
 * FocusCards - Aceternity-style image grid where hovering or focusing a card brings it into focus
 * (sharp, full opacity) while blurring + scaling down sibling cards.
 *
 * Intended aesthetic: base images in grayscale (B&W photoreal), on hover the focused card
 * receives a subtle factory-orange chrome/metallic highlight sheen + ring.
 *
 * Titles are revealed on the focused card only.
 *
 * @example
 * ```tsx
 * import { FocusCards } from "@caffeinebounce/ui/marketing";
 *
 * const cards = [
 *   {
 *     title: "Fast-moving wealth",
 *     src: "/marketing/factory/pressures/fast-moving-wealth.webp",
 *   },
 *   // ... more cards
 * ];
 *
 * <FocusCards cards={cards} className="md:grid-cols-2 lg:grid-cols-4 gap-6" />
 * ```
 */
export function FocusCards({ cards, className }: FocusCardsProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div
      className={cn("grid grid-cols-1 md:grid-cols-3 gap-10 w-full", className)}
      data-slot="focus-cards"
    >
      {cards.map((card, index) => (
        <FocusCardItem
          key={`${card.title}-${index}`}
          card={card}
          index={index}
          hovered={hovered}
          setHovered={setHovered}
        />
      ))}
    </div>
  );
}
