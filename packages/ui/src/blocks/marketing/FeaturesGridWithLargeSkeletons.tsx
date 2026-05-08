"use client";

import {
  AlertCircle,
  Check,
  Clock,
  LoaderCircle,
  Plus,
  Radio,
  ShieldCheck,
} from "lucide-react";
import type { CSSProperties, MouseEventHandler, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { cn } from "../../utils";

export interface FeaturesGridWithLargeSkeletonsItem {
  id: string;
  title: ReactNode;
  skeleton?: ReactNode;
  actionIcon?: ReactNode;
  actionLabel?: string;
  onActionClick?: MouseEventHandler<HTMLButtonElement>;
  cardClassName?: string;
  skeletonClassName?: string;
  contentClassName?: string;
  titleClassName?: string;
}

export interface FeaturesGridWithLargeSkeletonsProps {
  heading: ReactNode;
  description?: ReactNode;
  items: FeaturesGridWithLargeSkeletonsItem[];
  className?: string;
  containerClassName?: string;
  headerClassName?: string;
  headingClassName?: string;
  descriptionClassName?: string;
  gridClassName?: string;
}

export interface FeatureSkeletonCardData {
  icon?: ReactNode;
  title: ReactNode;
  description: ReactNode;
  badge?: ReactNode;
  tags?: ReactNode[];
  className?: string;
}

export interface FeatureStackSkeletonProps {
  cards?: FeatureSkeletonCardData[];
  className?: string;
}

export interface FeatureWorkflowSkeletonRowData {
  icon?: ReactNode;
  text: ReactNode;
  time?: ReactNode;
  variant?: "success" | "warning" | "danger";
}

export interface FeatureWorkflowSkeletonProps {
  title?: ReactNode;
  rows?: FeatureWorkflowSkeletonRowData[];
  className?: string;
}

export interface FeatureShieldSkeletonProps {
  icon?: ReactNode;
  className?: string;
}

export interface DottedGlowBackgroundProps {
  className?: string;
  gap?: number;
  radius?: number;
  color?: string;
  darkColor?: string;
  glowColor?: string;
  darkGlowColor?: string;
  colorLightVar?: string;
  colorDarkVar?: string;
  glowColorLightVar?: string;
  glowColorDarkVar?: string;
  opacity?: number;
  backgroundOpacity?: number;
  speedMin?: number;
  speedMax?: number;
  speedScale?: number;
}

const defaultStackCards: FeatureSkeletonCardData[] = [
  {
    icon: <Check className="size-4" />,
    title: "Planning Layer",
    description: "Coordinates strategy, context, and next steps into one view.",
    badge: <FeatureSkeletonBadge text="120s" variant="danger" />,
    tags: ["Strategy", "Teams", "Ops"],
    className: "absolute bottom-0 left-12 z-30 max-w-[90%]",
  },
  {
    icon: <AlertCircle className="size-4" />,
    title: "Signal Review",
    description: "Surfaces important changes before they become bottlenecks.",
    badge: <FeatureSkeletonBadge text="10s" variant="success" />,
    tags: ["Review", "Risk", "Data"],
    className: "absolute bottom-8 left-8 z-20",
  },
  {
    icon: <ShieldCheck className="size-4" />,
    title: "Guardrail Check",
    description: "Keeps decisions aligned with policy, brand, and process.",
    badge: <FeatureSkeletonBadge text="40s" variant="warning" />,
    tags: ["Policy", "Access", "Trace"],
    className: "absolute bottom-20 left-4 z-10 max-w-[80%]",
  },
];

const defaultWorkflowRows: FeatureWorkflowSkeletonRowData[] = [
  {
    icon: <Check className="size-3" />,
    text: "Gathering context",
    time: "10s",
  },
  {
    icon: <Check className="size-3" />,
    text: "Mapping stakeholders",
    time: "20s",
  },
  {
    icon: <Check className="size-3" />,
    text: "Preparing handoff",
    time: "30s",
  },
  {
    icon: <Check className="size-3" />,
    text: "Waiting for approval",
    time: "40s",
  },
  {
    icon: <LoaderCircle className="size-3 animate-spin" />,
    text: "Generating report",
    time: "50s",
    variant: "warning",
  },
];

const defaultSkeletons = [
  <FeatureStackSkeleton key="stack" />,
  <FeatureWorkflowSkeleton key="workflow" />,
  <FeatureShieldSkeleton key="shield" />,
];

function getDefaultSkeleton(index: number) {
  return defaultSkeletons[index % defaultSkeletons.length];
}

function renderText(value: ReactNode) {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  return "feature";
}

export function FeaturesGridWithLargeSkeletons({
  heading,
  description,
  items,
  className,
  containerClassName,
  headerClassName,
  headingClassName,
  descriptionClassName,
  gridClassName,
}: FeaturesGridWithLargeSkeletonsProps) {
  return (
    <section className={cn("py-10 md:py-20 lg:py-32", className)}>
      <div className={cn("mx-auto max-w-7xl px-4 md:px-8", containerClassName)}>
        <div
          className={cn(
            "flex flex-col justify-start gap-10 xl:flex-row xl:items-end",
            headerClassName,
          )}
        >
          <h2
            className={cn(
              "text-2xl font-bold tracking-tight md:text-4xl lg:text-5xl",
              headingClassName,
            )}
          >
            {heading}
          </h2>
          {description ? (
            <p
              className={cn(
                "max-w-sm text-base text-neutral-500 md:text-lg dark:text-neutral-400",
                descriptionClassName,
              )}
            >
              {description}
            </p>
          ) : null}
        </div>
        <div
          className={cn(
            "my-10 grid grid-cols-1 gap-4 md:my-20 lg:grid-cols-3",
            gridClassName,
          )}
        >
          {items.map((item, index) => (
            <FeatureGridLargeSkeletonCard
              className={cn(
                index === 0 && "lg:rounded-l-3xl",
                index === items.length - 1 && "lg:rounded-r-3xl",
                item.cardClassName,
              )}
              key={item.id}
            >
              <FeatureGridLargeSkeletonFrame className={item.skeletonClassName}>
                {item.skeleton ?? getDefaultSkeleton(index)}
              </FeatureGridLargeSkeletonFrame>
              <FeatureGridLargeSkeletonContent
                className={item.contentClassName}
              >
                <FeatureGridLargeSkeletonTitle className={item.titleClassName}>
                  {item.title}
                </FeatureGridLargeSkeletonTitle>
                <FeatureGridLargeSkeletonAction
                  aria-label={
                    item.actionLabel ?? `View ${renderText(item.title)}`
                  }
                  onClick={item.onActionClick}
                >
                  {item.actionIcon ?? <Plus className="size-4" />}
                </FeatureGridLargeSkeletonAction>
              </FeatureGridLargeSkeletonContent>
            </FeatureGridLargeSkeletonCard>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FeatureGridLargeSkeletonCard({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <article
      className={cn(
        "overflow-hidden rounded-lg bg-neutral-50 dark:bg-neutral-900",
        className,
      )}
      data-slot="features-grid-large-skeleton-card"
    >
      {children}
    </article>
  );
}

export function FeatureGridLargeSkeletonContent({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-5 px-4 pb-6 md:px-8 md:pb-12",
        className,
      )}
      data-slot="features-grid-large-skeleton-content"
    >
      {children}
    </div>
  );
}

export function FeatureGridLargeSkeletonAction({
  className,
  children,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      className={cn(
        "hidden size-5 shrink-0 items-center justify-center rounded-full border border-neutral-200 transition duration-200 active:scale-[0.98] md:size-10 lg:flex dark:border-neutral-800",
        className,
      )}
      data-slot="features-grid-large-skeleton-action"
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}

export function FeatureGridLargeSkeletonTitle({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <h3
      className={cn("font-display text-lg font-bold md:text-xl", className)}
      data-slot="features-grid-large-skeleton-title"
    >
      {children}
    </h3>
  );
}

export function FeatureGridLargeSkeletonFrame({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cn("relative h-60 overflow-hidden md:h-80", className)}
      data-slot="features-grid-large-skeleton-frame"
    >
      {children}
    </div>
  );
}

export function FeatureStackSkeleton({
  cards = defaultStackCards,
  className,
}: FeatureStackSkeletonProps) {
  return (
    <div
      className={cn("relative h-full w-full", className)}
      data-slot="feature-stack-skeleton"
      style={{
        maskImage:
          "radial-gradient(circle at 40% 55%, black 42%, transparent 78%)",
        transform:
          "translateY(-2.5rem) scale(1.16) perspective(900px) rotateX(30deg) rotateY(-20deg) rotateZ(15deg)",
        transformStyle: "preserve-3d",
      }}
    >
      {cards.map((card, index) => (
        <FeatureSkeletonCard
          {...card}
          className={cn(card.className, !card.className && "absolute left-8")}
          key={`${renderText(card.title)}-${index}`}
        />
      ))}
    </div>
  );
}

export function FeatureSkeletonCard({
  icon,
  title,
  description,
  badge,
  tags = ["Data", "Workflow", "Review"],
  className,
}: FeatureSkeletonCardData) {
  return (
    <div
      className={cn(
        "mx-auto my-auto h-fit w-full max-w-[85%] rounded-2xl border border-neutral-200 bg-neutral-100 p-3 shadow-2xl dark:border-neutral-700 dark:bg-neutral-800",
        className,
      )}
      data-slot="feature-skeleton-card"
    >
      <div className="flex items-center gap-3">
        {icon ? <span aria-hidden="true">{icon}</span> : null}
        <p className="text-sm font-normal text-black dark:text-white">
          {title}
        </p>
        {badge}
      </div>
      <p className="mt-3 text-sm font-normal text-neutral-400">{description}</p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {tags.map((tag, index) => (
          <FeatureSkeletonTag key={`${renderText(tag)}-${index}`}>
            {tag}
          </FeatureSkeletonTag>
        ))}
      </div>
    </div>
  );
}

export function FeatureSkeletonTag({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-sm bg-neutral-200 px-2 py-1 text-xs dark:bg-neutral-700">
      {children}
    </div>
  );
}

export function FeatureSkeletonBadge({
  variant = "success",
  text,
}: {
  variant?: "danger" | "success" | "warning";
  text: string;
}) {
  return (
    <div
      className={cn(
        "ml-auto flex w-fit items-center gap-1 rounded-full border px-1 py-0.5",
        variant === "danger" && "border-red-300 bg-red-300/10 text-red-500",
        variant === "warning" &&
          "border-yellow-300 bg-yellow-300/10 text-yellow-500",
        variant === "success" &&
          "border-green-300 bg-green-300/10 text-green-500",
      )}
      data-slot="feature-skeleton-badge"
    >
      <Clock className="size-3" />
      <Radio className="size-3" />
      <p className="text-[10px] font-bold">{text}</p>
    </div>
  );
}

export function FeatureWorkflowSkeleton({
  title = "Workflow",
  rows = defaultWorkflowRows,
  className,
}: FeatureWorkflowSkeletonProps) {
  return (
    <div
      className={cn(
        "group/bento-skeleton mx-auto my-auto flex h-full w-full max-w-[85%] flex-col rounded-2xl border border-neutral-300 bg-neutral-100 p-3 shadow-2xl [--pattern-bento:rgba(10,10,10,0.05)] dark:border-neutral-700 dark:bg-neutral-800 dark:[--pattern-bento:rgba(255,255,255,0.1)]",
        className,
      )}
      data-slot="feature-workflow-skeleton"
      style={{
        maskImage:
          "radial-gradient(circle at 45% 45%, black 48%, transparent 82%)",
        transform:
          "translateX(2.5rem) rotateY(20deg) rotateX(20deg) rotateZ(-20deg)",
        transformStyle: "preserve-3d",
      }}
    >
      <div className="flex items-center gap-3">
        <Check className="size-4" />
        <p className="text-sm font-normal text-black dark:text-white">
          {title}
        </p>
      </div>
      <div className="relative mt-4 flex-1 overflow-visible rounded-2xl border border-neutral-200 bg-neutral-200 dark:border-neutral-700 dark:bg-neutral-800">
        <FeatureSkeletonPattern />
        <div className="absolute inset-0 h-full w-full translate-x-4 -translate-y-4 rounded-2xl bg-white transition-all duration-300 group-hover/bento-skeleton:translate-x-0 group-hover/bento-skeleton:translate-y-0 dark:bg-neutral-700">
          {rows.map((row, index) => (
            <div key={`${renderText(row.text)}-${index}`}>
              <FeatureWorkflowSkeletonRow {...row} />
              {index < rows.length - 1 ? <FeatureSkeletonDivider /> : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function FeatureSkeletonDivider() {
  return (
    <div
      className="h-px w-full bg-linear-to-r from-transparent via-neutral-200 to-transparent dark:via-neutral-600"
      data-slot="feature-skeleton-divider"
    />
  );
}

export function FeatureWorkflowSkeletonRow({
  icon,
  text,
  time,
  variant = "success",
}: FeatureWorkflowSkeletonRowData) {
  return (
    <div className="flex items-center justify-between px-4 py-2">
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "flex size-4 items-center justify-center rounded-full text-white",
            variant === "success" && "bg-green-500",
            variant === "warning" && "bg-yellow-500",
            variant === "danger" && "bg-red-500",
          )}
        >
          {icon ?? <Check className="size-3" />}
        </div>
        <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
          {text}
        </p>
      </div>
      {time ? (
        <div className="flex items-center gap-1 text-neutral-400">
          <Radio className="size-3" />
          <p className="text-[10px] font-bold">{time}</p>
        </div>
      ) : null}
    </div>
  );
}

export function FeatureSkeletonPattern() {
  return (
    <div
      className="absolute inset-0 bg-[repeating-linear-gradient(315deg,var(--pattern-bento)_0,var(--pattern-bento)_1px,transparent_0,transparent_50%)] bg-size-[10px_10px] bg-fixed"
      data-slot="feature-skeleton-pattern"
    />
  );
}

export function FeatureShieldSkeleton({
  icon,
  className,
}: FeatureShieldSkeletonProps) {
  return (
    <div
      className={cn(
        "relative flex h-full w-full items-center justify-center",
        className,
      )}
      data-slot="feature-shield-skeleton"
    >
      <div className="relative z-20 flex size-24 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-900 shadow-2xl md:size-40 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white">
        {icon ?? <ShieldCheck className="size-12 md:size-20" />}
      </div>
      <DottedGlowBackground
        backgroundOpacity={0}
        className="pointer-events-none"
        colorDarkVar="--color-neutral-500"
        colorLightVar="--color-neutral-500"
        gap={10}
        glowColorDarkVar="--color-sky-800"
        glowColorLightVar="--color-neutral-600"
        opacity={1}
        radius={1.6}
        speedMax={1.6}
        speedMin={0.3}
        speedScale={1}
      />
    </div>
  );
}

function resolveCssVariable(el: Element, variableName?: string): string | null {
  if (!variableName) {
    return null;
  }

  const normalized = variableName.startsWith("--")
    ? variableName
    : `--${variableName}`;
  const fromEl = getComputedStyle(el).getPropertyValue(normalized).trim();

  if (fromEl) {
    return fromEl;
  }

  const fromRoot = getComputedStyle(document.documentElement)
    .getPropertyValue(normalized)
    .trim();

  return fromRoot || null;
}

function detectDarkMode() {
  const root = document.documentElement;

  if (root.classList.contains("dark")) {
    return true;
  }

  if (root.classList.contains("light")) {
    return false;
  }

  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
}

export function DottedGlowBackground({
  className,
  gap = 12,
  radius = 2,
  color = "rgba(0,0,0,0.7)",
  darkColor,
  glowColor = "rgba(0, 170, 255, 0.85)",
  darkGlowColor,
  colorLightVar,
  colorDarkVar,
  glowColorLightVar,
  glowColorDarkVar,
  opacity = 0.6,
  backgroundOpacity = 0,
  speedMin = 0.4,
  speedMax = 1.3,
  speedScale = 1,
}: DottedGlowBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [resolvedColor, setResolvedColor] = useState(color);
  const [resolvedGlowColor, setResolvedGlowColor] = useState(glowColor);

  useEffect(() => {
    const container = containerRef.current ?? document.documentElement;

    const compute = () => {
      const isDark = detectDarkMode();
      let nextColor = color;
      let nextGlow = glowColor;

      if (isDark) {
        nextColor =
          resolveCssVariable(container, colorDarkVar) ?? darkColor ?? nextColor;
        nextGlow =
          resolveCssVariable(container, glowColorDarkVar) ??
          darkGlowColor ??
          nextGlow;
      } else {
        nextColor = resolveCssVariable(container, colorLightVar) ?? nextColor;
        nextGlow = resolveCssVariable(container, glowColorLightVar) ?? nextGlow;
      }

      setResolvedColor(nextColor);
      setResolvedGlowColor(nextGlow);
    };

    compute();

    const mediaQuery = window.matchMedia?.("(prefers-color-scheme: dark)");
    mediaQuery?.addEventListener?.("change", compute);

    const mutationObserver =
      typeof MutationObserver !== "undefined"
        ? new MutationObserver(compute)
        : null;
    mutationObserver?.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style"],
    });
    if (container !== document.documentElement) {
      mutationObserver?.observe(container, {
        attributes: true,
        attributeFilter: ["class", "style"],
      });
    }

    return () => {
      mediaQuery?.removeEventListener?.("change", compute);
      mutationObserver?.disconnect();
    };
  }, [
    color,
    darkColor,
    glowColor,
    darkGlowColor,
    colorLightVar,
    colorDarkVar,
    glowColorLightVar,
    glowColorDarkVar,
  ]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;

    if (!canvas || !container) {
      return;
    }

    let canvasContext: CanvasRenderingContext2D | null = null;

    try {
      canvasContext = canvas.getContext("2d");
    } catch {
      return;
    }

    if (!canvasContext) {
      return;
    }

    const context = canvasContext;
    let frame: number | null = null;
    let stopped = false;
    let isVisible = true;
    let dots: Array<{ x: number; y: number; phase: number; speed: number }> =
      [];
    const dpr = Math.min(Math.max(1, window.devicePixelRatio || 1), 2);

    const resize = () => {
      const { width, height } = container.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = `${Math.floor(width)}px`;
      canvas.style.height = `${Math.floor(height)}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const regenerateDots = () => {
      dots = [];
      const { width, height } = container.getBoundingClientRect();
      const cols = Math.ceil(width / gap) + 2;
      const rows = Math.ceil(height / gap) + 2;
      const min = Math.min(speedMin, speedMax);
      const max = Math.max(speedMin, speedMax);
      const span = Math.max(max - min, 0);

      for (let xIndex = -1; xIndex < cols; xIndex++) {
        for (let yIndex = -1; yIndex < rows; yIndex++) {
          dots.push({
            x: xIndex * gap + (yIndex % 2 === 0 ? 0 : gap * 0.5),
            y: yIndex * gap,
            phase: Math.random() * Math.PI * 2,
            speed: min + Math.random() * span,
          });
        }
      }
    };

    const handleResize = () => {
      resize();
      regenerateDots();
    };

    resize();
    regenerateDots();

    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(handleResize)
        : null;
    resizeObserver?.observe(container);

    const cancelFrame = () => {
      if (frame === null) {
        return;
      }

      cancelAnimationFrame(frame);
      frame = null;
    };

    const scheduleFrame = () => {
      if (stopped || !isVisible || frame !== null) {
        return;
      }

      frame = requestAnimationFrame(draw);
    };

    const draw = (now: number) => {
      frame = null;

      if (stopped) {
        return;
      }

      if (!isVisible) {
        return;
      }

      const { width, height } = container.getBoundingClientRect();

      context.clearRect(0, 0, canvas.width, canvas.height);
      context.globalAlpha = opacity;

      if (backgroundOpacity > 0) {
        const gradient = context.createRadialGradient(
          width * 0.5,
          height * 0.4,
          Math.min(width, height) * 0.1,
          width * 0.5,
          height * 0.5,
          Math.max(width, height) * 0.7,
        );
        gradient.addColorStop(0, "rgba(0,0,0,0)");
        gradient.addColorStop(
          1,
          `rgba(0,0,0,${Math.min(Math.max(backgroundOpacity, 0), 1)})`,
        );
        context.fillStyle = gradient;
        context.fillRect(0, 0, width, height);
      }

      context.save();
      context.fillStyle = resolvedColor;

      const time = (now / 1000) * Math.max(speedScale, 0);

      for (const dot of dots) {
        const mod = (time * dot.speed + dot.phase) % 2;
        const linear = mod < 1 ? mod : 2 - mod;
        const alpha = 0.25 + 0.55 * linear;
        const glow = alpha > 0.6 ? (alpha - 0.6) / 0.4 : 0;

        context.globalAlpha = alpha * opacity;
        context.shadowColor = glow > 0 ? resolvedGlowColor : "transparent";
        context.shadowBlur = 6 * glow;
        context.beginPath();
        context.arc(dot.x, dot.y, radius, 0, Math.PI * 2);
        context.fill();
      }

      context.restore();
      scheduleFrame();
    };

    const intersectionObserver =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(
            (entries) => {
              const nextIsVisible = entries[0]?.isIntersecting ?? true;

              if (nextIsVisible === isVisible) {
                return;
              }

              isVisible = nextIsVisible;

              if (isVisible) {
                scheduleFrame();
              } else {
                cancelFrame();
              }
            },
            { threshold: 0.1 },
          )
        : null;
    intersectionObserver?.observe(container);

    window.addEventListener("resize", handleResize);
    scheduleFrame();

    return () => {
      stopped = true;
      cancelFrame();
      window.removeEventListener("resize", handleResize);
      intersectionObserver?.disconnect();
      resizeObserver?.disconnect();
    };
  }, [
    gap,
    radius,
    resolvedColor,
    resolvedGlowColor,
    opacity,
    backgroundOpacity,
    speedMin,
    speedMax,
    speedScale,
  ]);

  return (
    <div
      className={className}
      data-slot="dotted-glow-background"
      ref={containerRef}
      style={{ position: "absolute", inset: 0 } satisfies CSSProperties}
    >
      <canvas
        ref={canvasRef}
        style={{ display: "block", height: "100%", width: "100%" }}
      />
    </div>
  );
}
