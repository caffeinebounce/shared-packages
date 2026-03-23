"use client";

import { motion, useMotionTemplate, useMotionValue } from "motion/react";
import type React from "react";
import { type MouseEvent as ReactMouseEvent, useEffect, useState } from "react";
import { cn } from "../../utils";
import { CanvasRevealEffect } from "./canvas-reveal-effect";

export const CardSpotlight = ({
  children,
  radius = 350,
  color,
  className,
  ...props
}: {
  radius?: number;
  /** Spotlight hover tint — defaults to theme-aware (light gray in light mode, dark gray in dark mode) */
  color?: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const html = document.documentElement;
    const check = () => setIsDark(html.classList.contains("dark"));
    check();
    const obs = new MutationObserver(check);
    obs.observe(html, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  function handleMouseMove({
    currentTarget,
    clientX,
    clientY,
  }: ReactMouseEvent<HTMLDivElement>) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const [isHovering, setIsHovering] = useState(false);
  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => setIsHovering(false);

  // Default spotlight tint: indigo glow matching LampHero default (rgba(129,140,248,...))
  const resolvedColor =
    color ?? (isDark ? "#262626" : "rgba(129,140,248,0.08)");
  const dotColors: [number, number, number][] = isDark
    ? [
        [59, 130, 246],
        [139, 92, 246],
      ]
    : [
        [129, 140, 248],
        [165, 148, 249],
      ];

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: spotlight effect requires mouse tracking on the card container
    <div
      className={cn("group/spotlight p-10 rounded-md relative", className)}
      style={{
        backgroundColor: "var(--color-card, hsl(var(--card)))",
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: "var(--color-border, hsl(var(--border)))",
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      <motion.div
        className="pointer-events-none absolute z-0 -inset-px rounded-md opacity-0 transition duration-300 group-hover/spotlight:opacity-100"
        style={{
          backgroundColor: resolvedColor,
          maskImage: useMotionTemplate`
            radial-gradient(
              ${radius}px circle at ${mouseX}px ${mouseY}px,
              white,
              transparent 80%
            )
          `,
        }}
      >
        {isHovering && (
          <CanvasRevealEffect
            animationSpeed={5}
            containerClassName="bg-transparent absolute inset-0 pointer-events-none"
            colors={dotColors}
            dotSize={3}
          />
        )}
      </motion.div>
      {children}
    </div>
  );
};
