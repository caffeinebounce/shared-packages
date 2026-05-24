"use client";

import { animate, useReducedMotion } from "motion/react";
import type * as React from "react";
import { memo, useCallback, useEffect, useRef } from "react";
import { cn } from "../../utils";
import type { ButtonCorners } from "./button";

export type GlowingEffectCorners = ButtonCorners;
export type GlowingEffectVariant = "default" | "primary" | "white";

export interface GlowingEffectProps
  extends Omit<React.ComponentProps<"div">, "children"> {
  blur?: number;
  inactiveZone?: number;
  proximity?: number;
  spread?: number;
  variant?: GlowingEffectVariant;
  glow?: boolean;
  disabled?: boolean;
  movementDuration?: number;
  borderWidth?: number;
  corners?: GlowingEffectCorners;
}

const glowingEffectCornerClasses: Record<GlowingEffectCorners, string> = {
  default: "rounded-box",
  pill: "rounded-full",
  sharp: "rounded-none",
};

const glowingEffectColors: Record<
  GlowingEffectVariant,
  { accent: string; color: string }
> = {
  default: {
    accent: "#d79f1e",
    color: "#dd7bbb",
  },
  primary: {
    accent: "rgba(255,255,255,0.7)",
    color: "var(--primary)",
  },
  white: {
    accent: "rgba(255,255,255,0.42)",
    color: "rgba(255,255,255,0.92)",
  },
};

type GlowingEffectStyle = React.CSSProperties & {
  "--glowing-effect-accent-color": string;
  "--glowing-effect-active": string;
  "--glowing-effect-border-width": string;
  "--glowing-effect-blur": string;
  "--glowing-effect-color": string;
  "--glowing-effect-duration": string;
  "--glowing-effect-hotspot": string;
  "--glowing-effect-inactive-zone": number;
  "--glowing-effect-proximity": string;
  "--glowing-effect-radius": string;
  "--glowing-effect-spread": string;
  "--glowing-effect-start": string;
  "--glowing-effect-x": string;
  "--glowing-effect-y": string;
};

export const GlowingEffect = memo(function GlowingEffect({
  blur = 0,
  className,
  corners = "default",
  disabled = false,
  glow = false,
  inactiveZone = 0.7,
  movementDuration = 2,
  borderWidth = 1,
  proximity = 0,
  spread = 20,
  style,
  variant = "default",
  ...props
}: GlowingEffectProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastPositionRef = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number>(0);
  const angleAnimationRef = useRef<{ stop: () => void } | null>(null);
  const reducedMotion = useReducedMotion() ?? false;

  const handleMove = useCallback(
    (event?: MouseEvent | { x: number; y: number }) => {
      if (!containerRef.current) {
        return;
      }

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      animationFrameRef.current = requestAnimationFrame(() => {
        const element = containerRef.current;
        if (!element) {
          return;
        }

        const { height, left, top, width } = element.getBoundingClientRect();
        const mouseX = event?.x ?? lastPositionRef.current.x;
        const mouseY = event?.y ?? lastPositionRef.current.y;

        if (event) {
          lastPositionRef.current = { x: mouseX, y: mouseY };
        }

        const centerX = left + width * 0.5;
        const centerY = top + height * 0.5;
        const inactiveRadius = 0.5 * Math.min(width, height) * inactiveZone;
        const distanceFromCenter = Math.hypot(
          mouseX - centerX,
          mouseY - centerY,
        );

        if (distanceFromCenter < inactiveRadius) {
          element.style.setProperty("--glowing-effect-active", "0");
          return;
        }

        const isActive =
          mouseX > left - proximity &&
          mouseX < left + width + proximity &&
          mouseY > top - proximity &&
          mouseY < top + height + proximity;

        element.style.setProperty(
          "--glowing-effect-active",
          isActive ? "1" : "0",
        );

        if (!isActive) {
          return;
        }

        element.style.setProperty("--glowing-effect-x", `${mouseX - left}px`);
        element.style.setProperty("--glowing-effect-y", `${mouseY - top}px`);

        const currentAngle =
          Number.parseFloat(
            element.style.getPropertyValue("--glowing-effect-start"),
          ) || 0;
        const targetAngle =
          (180 * Math.atan2(mouseY - centerY, mouseX - centerX)) / Math.PI + 90;
        const angleDifference =
          ((((targetAngle - currentAngle + 180) % 360) + 360) % 360) - 180;
        const nextAngle = currentAngle + angleDifference;

        angleAnimationRef.current?.stop();
        angleAnimationRef.current = animate(currentAngle, nextAngle, {
          duration: movementDuration,
          ease: [0.16, 1, 0.3, 1],
          onUpdate: (value) => {
            element.style.setProperty("--glowing-effect-start", String(value));
          },
        });
      });
    },
    [inactiveZone, movementDuration, proximity],
  );

  useEffect(() => {
    if (disabled || reducedMotion) {
      return;
    }

    const handleScroll = () => handleMove();
    const handlePointerMove = (event: PointerEvent) => handleMove(event);

    window.addEventListener("scroll", handleScroll, { passive: true });
    document.body.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      angleAnimationRef.current?.stop();
      angleAnimationRef.current = null;
      window.removeEventListener("scroll", handleScroll);
      document.body.removeEventListener("pointermove", handlePointerMove);
    };
  }, [disabled, handleMove, reducedMotion]);

  const colors = glowingEffectColors[variant];
  const effectStyle: GlowingEffectStyle = {
    "--glowing-effect-accent-color": colors.accent,
    "--glowing-effect-active": "0",
    "--glowing-effect-border-width": `${borderWidth}px`,
    "--glowing-effect-blur": `${blur}px`,
    "--glowing-effect-color": colors.color,
    "--glowing-effect-duration": `${movementDuration}s`,
    "--glowing-effect-hotspot": `${Math.max(borderWidth * 3, 10)}px`,
    "--glowing-effect-inactive-zone": inactiveZone,
    "--glowing-effect-proximity": `${proximity}px`,
    "--glowing-effect-radius": `${Math.max(spread * 2.5, 48)}px`,
    "--glowing-effect-spread": String(spread),
    "--glowing-effect-start": "0",
    opacity: "var(--glowing-effect-active)",
    transitionDuration: "300ms",
    "--glowing-effect-x": "50%",
    "--glowing-effect-y": "50%",
    ...style,
  };
  const edgeStyle: React.CSSProperties = {
    background:
      "radial-gradient(circle at var(--glowing-effect-x) var(--glowing-effect-y), var(--glowing-effect-color) 0, var(--glowing-effect-accent-color) var(--glowing-effect-hotspot), transparent var(--glowing-effect-radius))",
    filter: "blur(var(--glowing-effect-blur))",
  };
  const ambientStyle: React.CSSProperties = {
    ...edgeStyle,
    opacity: 0.28,
  };
  const topEdgeStyle: React.CSSProperties = {
    ...edgeStyle,
    clipPath: `inset(0 0 calc(100% - ${borderWidth}px) 0)`,
  };
  const rightEdgeStyle: React.CSSProperties = {
    ...edgeStyle,
    clipPath: `inset(0 0 0 calc(100% - ${borderWidth}px))`,
  };
  const bottomEdgeStyle: React.CSSProperties = {
    ...edgeStyle,
    clipPath: `inset(calc(100% - ${borderWidth}px) 0 0 0)`,
  };
  const leftEdgeStyle: React.CSSProperties = {
    ...edgeStyle,
    clipPath: `inset(0 calc(100% - ${borderWidth}px) 0 0)`,
  };

  return (
    <div
      aria-hidden="true"
      data-disabled={disabled ? "true" : undefined}
      data-glow={glow ? "true" : undefined}
      data-slot="glowing-effect"
      ref={containerRef}
      className={cn(
        "pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-100 transition-opacity",
        glowingEffectCornerClasses[corners],
        disabled && "hidden",
        className,
      )}
      style={effectStyle}
      {...props}
    >
      <span
        aria-hidden="true"
        className="absolute inset-0"
        style={ambientStyle}
      />
      <span
        aria-hidden="true"
        className="absolute inset-0"
        style={topEdgeStyle}
      />
      <span
        aria-hidden="true"
        className="absolute inset-0"
        style={rightEdgeStyle}
      />
      <span
        aria-hidden="true"
        className="absolute inset-0"
        style={bottomEdgeStyle}
      />
      <span
        aria-hidden="true"
        className="absolute inset-0"
        style={leftEdgeStyle}
      />
    </div>
  );
});
