"use client";

import { AnimatePresence, motion } from "motion/react";
import type * as React from "react";
import { useState } from "react";

import { cn } from "../../utils";

export interface HoverEffectItem {
  /** Card title */
  title: string;
  /** Card description */
  description: string;
  /** Optional link URL - if provided, card becomes a link */
  link?: string;
}

export interface HoverEffectProps {
  /** Items to display in the grid */
  items: HoverEffectItem[];
  /** Additional className for the container */
  className?: string;
}

/**
 * HoverEffect - A grid of cards with an animated hover highlight effect.
 *
 * The highlight smoothly slides to whichever card is currently hovered,
 * creating a fluid, interactive experience.
 *
 * @example
 * ```tsx
 * <HoverEffect
 *   items={[
 *     { title: "Feature 1", description: "Description of feature 1", link: "/feature-1" },
 *     { title: "Feature 2", description: "Description of feature 2", link: "/feature-2" },
 *   ]}
 * />
 * ```
 */
export function HoverEffect({ items, className }: HoverEffectProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 py-10",
        className
      )}
    >
      {items.map((item, idx) => {
        const content = (
          <>
            <AnimatePresence>
              {hoveredIndex === idx && (
                <motion.span
                  className="absolute inset-0 h-full w-full bg-neutral-200 dark:bg-slate-800/[0.8] block rounded-3xl"
                  layoutId="hoverBackground"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: 1,
                    transition: { duration: 0.15 },
                  }}
                  exit={{
                    opacity: 0,
                    transition: { duration: 0.15, delay: 0.2 },
                  }}
                />
              )}
            </AnimatePresence>
            <HoverEffectCard>
              <HoverEffectCardTitle>{item.title}</HoverEffectCardTitle>
              <HoverEffectCardDescription>
                {item.description}
              </HoverEffectCardDescription>
            </HoverEffectCard>
          </>
        );

        const commonProps = {
          className: "relative group block p-2 h-full w-full",
          onMouseEnter: () => setHoveredIndex(idx),
          onMouseLeave: () => setHoveredIndex(null),
        };

        if (item.link) {
          return (
            <a key={item.link} href={item.link} {...commonProps}>
              {content}
            </a>
          );
        }

        return (
          <div key={idx} {...commonProps}>
            {content}
          </div>
        );
      })}
    </div>
  );
}

export interface HoverEffectCardProps {
  /** Additional className */
  className?: string;
  /** Card content */
  children: React.ReactNode;
}

/**
 * HoverEffectCard - The card container for HoverEffect items
 */
export function HoverEffectCard({ className, children }: HoverEffectCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl h-full w-full p-4 overflow-hidden bg-black border border-transparent dark:border-white/[0.2] group-hover:border-slate-700 relative z-20",
        className
      )}
    >
      <div className="relative z-50">
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

export interface HoverEffectCardTitleProps {
  /** Additional className */
  className?: string;
  /** Title content */
  children: React.ReactNode;
}

/**
 * HoverEffectCardTitle - Title component for HoverEffect cards
 */
export function HoverEffectCardTitle({
  className,
  children,
}: HoverEffectCardTitleProps) {
  return (
    <h4 className={cn("text-zinc-100 font-bold tracking-wide mt-4", className)}>
      {children}
    </h4>
  );
}

export interface HoverEffectCardDescriptionProps {
  /** Additional className */
  className?: string;
  /** Description content */
  children: React.ReactNode;
}

/**
 * HoverEffectCardDescription - Description component for HoverEffect cards
 */
export function HoverEffectCardDescription({
  className,
  children,
}: HoverEffectCardDescriptionProps) {
  return (
    <p
      className={cn(
        "mt-8 text-zinc-400 tracking-wide leading-relaxed text-sm",
        className
      )}
    >
      {children}
    </p>
  );
}
