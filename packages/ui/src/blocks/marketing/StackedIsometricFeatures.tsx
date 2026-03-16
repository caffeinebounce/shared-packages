"use client";

import { motion, useReducedMotion } from "motion/react";
import type { KeyboardEvent, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

import { cn } from "../../utils";

export interface StackedIsometricFeatureItem {
  description: ReactNode;
  label?: ReactNode;
  title: ReactNode;
  visualCaption?: ReactNode;
}

export interface StackedIsometricFeaturesProps {
  activeItemClassName?: string;
  autoplay?: boolean;
  autoplayIntervalMs?: number;
  className?: string;
  contentClassName?: string;
  defaultActiveIndex?: number;
  description?: ReactNode;
  eyebrow?: ReactNode;
  featureItemClassName?: string;
  featureListClassName?: string;
  heading?: ReactNode;
  items: StackedIsometricFeatureItem[];
  visualClassName?: string;
}

const TOP_FACE_PATH =
  "M100 40 Q108 40 155 68 Q162 72 155 76 Q108 104 100 104 Q92 104 45 76 Q38 72 45 68 Q92 40 100 40 Z";
const TOP_FACE_INNER_PATH =
  "M100 52 Q105 52 132 68 Q138 72 132 76 Q105 92 100 92 Q95 92 68 76 Q62 72 68 68 Q95 52 100 52 Z";
const LEFT_FACE_PATH =
  "M45 76 L100 104 L100 164 Q100 170 92 166 L45 140 Q38 136 38 128 L38 80 Q38 72 45 76 Z";
const RIGHT_FACE_PATH =
  "M155 76 L100 104 L100 164 Q100 170 108 166 L155 140 Q162 136 162 128 L162 80 Q162 72 155 76 Z";
const GUIDE_LINES = [
  "M55 86 L55 145",
  "M70 95 L70 155",
  "M85 104 L85 162",
  "M145 86 L145 145",
  "M130 95 L130 155",
  "M115 104 L115 162",
] as const;
const PEEL_DIRECTIONS = ["left", "right"] as const;

type PeelDirection = (typeof PEEL_DIRECTIONS)[number];

function clampIndex(value: number, length: number) {
  if (length <= 0) {
    return 0;
  }

  return Math.min(Math.max(value, 0), length - 1);
}

function getWrappedIndex(value: number, length: number) {
  if (length <= 0) {
    return 0;
  }

  return (value + length) % length;
}

function renderNode(
  value: ReactNode,
  className: string,
  Component: "div" | "h2" | "p" | "h3" = "div",
) {
  if (value === null || value === undefined) {
    return null;
  }

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return <Component className={className}>{value}</Component>;
  }

  return value;
}

function toTextLabel(value: ReactNode, fallback: string) {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  return fallback;
}

function getPeelDirection(index: number): PeelDirection {
  return PEEL_DIRECTIONS[index % PEEL_DIRECTIONS.length];
}

function getDetachedFaceOffset(direction: PeelDirection) {
  return direction === "left" ? { x: -16, y: 10 } : { x: 16, y: 10 };
}

function getBoxZIndex(index: number, activeIndex: number, total: number) {
  if (index === activeIndex) {
    return total + 10;
  }

  return total - index;
}

function StackedIsometricBox({
  isActive,
  peelDirection,
  visualCaption,
}: {
  isActive: boolean;
  peelDirection: PeelDirection;
  visualCaption?: ReactNode;
}) {
  const prefersReducedMotion = useReducedMotion();
  const detachedFaceOffset = getDetachedFaceOffset(peelDirection);
  const detachedFacePath =
    peelDirection === "left" ? LEFT_FACE_PATH : RIGHT_FACE_PATH;
  const detachedFaceTransition = prefersReducedMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 220, damping: 22 };

  return (
    <div
      className="relative"
      data-peel-direction={peelDirection}
      data-slot="stacked-isometric-box-shell"
      data-state={isActive ? "active" : "inactive"}
    >
      <svg
        aria-hidden="true"
        className="relative h-[15rem] w-[15rem] sm:h-[16rem] sm:w-[16rem] lg:h-[18rem] lg:w-[18rem]"
        viewBox="0 0 200 200"
      >
        <path
          d={TOP_FACE_PATH}
          fill={isActive ? "var(--muted)" : "var(--card)"}
          fillOpacity={isActive ? 1 : 0.02}
          stroke={isActive ? "var(--primary)" : "var(--foreground)"}
          strokeOpacity={isActive ? 0.96 : 0.18}
          strokeWidth="1.5"
        />
        <path
          d={TOP_FACE_INNER_PATH}
          data-slot={
            isActive ? "stacked-isometric-box-top-face-detail" : undefined
          }
          fill="transparent"
          fillOpacity="0"
          stroke={isActive ? "var(--primary)" : "transparent"}
          strokeOpacity={isActive ? 0.96 : 0}
          strokeWidth="1"
        />
        <path
          d={LEFT_FACE_PATH}
          fill="var(--card)"
          fillOpacity="0.03"
          stroke="var(--foreground)"
          strokeOpacity="0.18"
          strokeWidth="1.5"
        />
        <path
          d={RIGHT_FACE_PATH}
          fill="var(--card)"
          fillOpacity="0.02"
          stroke="var(--foreground)"
          strokeOpacity="0.18"
          strokeWidth="1.5"
        />

        {GUIDE_LINES.map((path) => (
          <path
            key={path}
            d={path}
            stroke="var(--foreground)"
            strokeDasharray="3 3"
            strokeLinecap="round"
            strokeOpacity="0.18"
            strokeWidth="1"
          />
        ))}

        <motion.path
          animate={{
            opacity: isActive ? 1 : 0,
            x: isActive ? detachedFaceOffset.x : 0,
            y: isActive ? detachedFaceOffset.y : 0,
          }}
          d={detachedFacePath}
          data-slot={
            isActive ? "stacked-isometric-box-detached-face" : undefined
          }
          data-state={isActive ? "active" : "inactive"}
          fill="var(--primary)"
          fillOpacity="0.12"
          initial={false}
          stroke="var(--primary)"
          strokeOpacity="0.94"
          strokeWidth="1.5"
          transition={detachedFaceTransition}
        />
      </svg>

      {isActive && visualCaption ? (
        <motion.div
          animate={{ opacity: 1, x: 0 }}
          className={cn(
            "pointer-events-none absolute top-[58%] z-10 w-[5rem] -translate-y-1/2 text-[0.62rem] font-light leading-relaxed text-muted-foreground/82 sm:w-[7rem] sm:text-[0.68rem] lg:w-[8.5rem]",
            peelDirection === "left"
              ? "right-[calc(100%+0.35rem)] text-right sm:right-[calc(100%+0.75rem)]"
              : "left-[calc(100%+0.35rem)] text-left sm:left-[calc(100%+0.75rem)]",
          )}
          data-slot="stacked-isometric-visual-caption"
          initial={false}
          transition={detachedFaceTransition}
        >
          {renderNode(visualCaption, "", "div")}
        </motion.div>
      ) : null}
    </div>
  );
}

function StackedIsometricVisual({
  activeIndex,
  items,
  className,
}: {
  activeIndex: number;
  className?: string;
  items: StackedIsometricFeatureItem[];
}) {
  const prefersReducedMotion = useReducedMotion();
  const transition = prefersReducedMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 240, damping: 26 };
  const activeItem = items[activeIndex];
  const hasVisualCaption = activeItem?.visualCaption !== undefined;
  const activePeelDirection = getPeelDirection(activeIndex);
  const stackOffsetX = hasVisualCaption
    ? activePeelDirection === "left"
      ? 42
      : -42
    : 0;

  return (
    <div
      className={cn(
        "relative flex min-h-[28rem] items-center justify-center overflow-visible rounded-box px-[3.25rem] py-4 sm:min-h-[32rem] sm:px-[4.5rem] sm:py-8 lg:px-[5.5rem]",
        className,
      )}
      data-slot="stacked-isometric-visual"
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:32px_32px] opacity-14" />

      <motion.div
        animate={{ x: stackOffsetX }}
        className="relative z-10 flex w-full flex-col items-center justify-center overflow-visible py-4 sm:py-8"
        initial={false}
        transition={transition}
      >
        {items.map((item, index) => {
          const isActive = index === activeIndex;

          return (
            <motion.div
              key={`${toTextLabel(item.title, `item-${index}`)}-${index}`}
              animate={{
                opacity: isActive ? 1 : 0.7,
                scale: isActive ? 1 : 0.985,
              }}
              className={cn(
                "relative flex h-[5.25rem] items-center justify-center overflow-visible sm:h-[5.75rem] lg:h-[6.25rem]",
                index === 0 ? "" : "mt-4",
              )}
              data-peel-direction={getPeelDirection(index)}
              data-slot="stacked-isometric-box"
              data-state={isActive ? "active" : "inactive"}
              initial={false}
              style={{ zIndex: getBoxZIndex(index, activeIndex, items.length) }}
              transition={transition}
            >
              <StackedIsometricBox
                isActive={isActive}
                peelDirection={getPeelDirection(index)}
                visualCaption={item.visualCaption}
              />
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}

export function StackedIsometricFeatures({
  activeItemClassName,
  autoplay = true,
  autoplayIntervalMs = 5000,
  className,
  contentClassName,
  defaultActiveIndex = 0,
  description,
  eyebrow,
  featureItemClassName,
  featureListClassName,
  heading,
  items,
  visualClassName,
}: StackedIsometricFeaturesProps) {
  const prefersReducedMotion = useReducedMotion();
  const featureButtonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [activeIndex, setActiveIndex] = useState(() =>
    clampIndex(defaultActiveIndex, items.length),
  );
  const [autoplayResetToken, setAutoplayResetToken] = useState(0);

  useEffect(() => {
    setActiveIndex((current) => clampIndex(current, items.length));
  }, [items.length]);

  useEffect(() => {
    if (!autoplay || items.length <= 1) {
      return;
    }

    void autoplayResetToken;

    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % items.length);
    }, autoplayIntervalMs);

    return () => window.clearInterval(intervalId);
  }, [autoplay, autoplayIntervalMs, autoplayResetToken, items.length]);

  const transitionClassName = prefersReducedMotion ? "" : "duration-300";

  function activateItem(index: number, shouldFocus = false) {
    const nextIndex = clampIndex(index, items.length);

    setActiveIndex(nextIndex);
    setAutoplayResetToken((current) => current + 1);

    if (shouldFocus) {
      featureButtonRefs.current[nextIndex]?.focus();
    }
  }

  function handleFeatureKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    if (items.length <= 1) {
      return;
    }

    let nextIndex: number | null = null;

    switch (event.key) {
      case "ArrowDown":
        nextIndex = getWrappedIndex(index + 1, items.length);
        break;
      case "ArrowUp":
        nextIndex = getWrappedIndex(index - 1, items.length);
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = items.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    activateItem(nextIndex, true);
  }

  return (
    <div
      className={cn("space-y-10", className)}
      data-slot="stacked-isometric-features"
    >
      {eyebrow || heading || description ? (
        <div
          className={cn(
            "flex flex-col gap-4 md:flex-row md:items-end md:justify-between",
            contentClassName,
          )}
          data-slot="stacked-isometric-features-header"
        >
          <div className="space-y-4">
            {renderNode(
              eyebrow,
              "text-sm font-medium uppercase tracking-[0.24em] text-primary/80",
              "p",
            )}
            {renderNode(
              heading,
              "max-w-4xl text-4xl font-semibold leading-tight text-foreground md:text-5xl",
              "h2",
            )}
          </div>

          {renderNode(
            description,
            "max-w-md text-sm leading-relaxed text-muted-foreground",
            "p",
          )}
        </div>
      ) : null}

      <div
        className="grid gap-8 lg:grid-cols-2 lg:items-center"
        data-slot="stacked-isometric-features-content"
      >
        <div
          className={cn("grid gap-3", featureListClassName)}
          data-slot="stacked-isometric-features-list"
        >
          {items.map((item, index) => {
            const isActive = index === activeIndex;
            const label = item.label ?? `0${index + 1}`;

            return (
              <button
                key={`${toTextLabel(item.title, `item-${index}`)}-${index}`}
                aria-pressed={isActive}
                className={cn(
                  "w-full rounded-box border border-border/70 bg-card/70 p-5 text-left shadow-sm transition-[transform,background-color,border-color,color,box-shadow]",
                  transitionClassName,
                  "hover:-translate-y-0.5 hover:border-border",
                  isActive &&
                    "border-primary/50 bg-primary/10 shadow-[0_18px_55px_rgba(0,0,0,0.18)]",
                  featureItemClassName,
                  isActive && activeItemClassName,
                )}
                data-slot="stacked-isometric-feature"
                data-state={isActive ? "active" : "inactive"}
                onClick={() => activateItem(index)}
                onKeyDown={(event) => handleFeatureKeyDown(event, index)}
                onMouseEnter={() => activateItem(index)}
                ref={(node) => {
                  featureButtonRefs.current[index] = node;
                }}
                type="button"
              >
                {renderNode(
                  label,
                  cn(
                    "text-[0.68rem] font-semibold uppercase tracking-[0.24em]",
                    isActive ? "text-primary/80" : "text-muted-foreground",
                  ),
                  "p",
                )}
                {renderNode(
                  item.title,
                  "mt-4 text-2xl leading-tight text-foreground",
                  "h3",
                )}
                {renderNode(
                  item.description,
                  cn(
                    "mt-3 text-sm leading-relaxed",
                    isActive ? "text-foreground/78" : "text-muted-foreground",
                  ),
                  "div",
                )}
              </button>
            );
          })}
        </div>

        <div data-slot="stacked-isometric-features-visual-wrapper">
          <StackedIsometricVisual
            activeIndex={activeIndex}
            className={visualClassName}
            items={items}
          />
        </div>
      </div>
    </div>
  );
}
