"use client";

import {
  animate,
  motion,
  useAnimation,
  useMotionValue,
  useTransform,
} from "motion/react";
import type { ReactNode } from "react";
import { useEffect, useRef } from "react";

export interface RollingBackgroundProps {
  /** Primary accent color. Default: "#FF4628" */
  accentColor?: string;
  /** Muted accent color for decorative circle. Default: "#D9563F" */
  mutedAccentColor?: string;
  /** Logo element to display after animation completes */
  logo?: ReactNode;
  /** Additional className */
  className?: string;
}

/**
 * RollingBackground - Animated background for the "rolling" auth variant.
 *
 * Animation sequence:
 * 1. Orange dot enters from left edge at ~15% from top
 * 2. Dot moves rightward with subtle bounce oscillation
 * 3. Orange line trails behind, drawing left-to-right
 * 4. Dot settles ~40px from right edge
 * 5. Large decorative circle fades in at bottom-right
 * 6. Logo watermark fades in at bottom-left
 */
export function RollingBackground({
  accentColor = "#FF4628",
  mutedAccentColor = "#D9563F",
  logo,
  className,
}: RollingBackgroundProps) {
  const dotControls = useAnimation();
  const lineControls = useAnimation();
  const circleControls = useAnimation();
  const logoControls = useAnimation();

  const dotX = useMotionValue(-64);
  const lineWidth = useTransform(dotX, (v) => Math.max(0, v - 80));

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const runAnimation = async () => {
      const vw = containerRef.current?.offsetWidth ?? window.innerWidth;
      const targetX = vw - 100; // 100px padding from right edge

      // Smooth horizontal glide — no bounce
      // Animate dotX directly so line derives from same value
      animate(dotX, targetX, { duration: 2, ease: [0.25, 0.1, 0.25, 1] });
      dotControls.start({
        filter: ["blur(6px)", "blur(3px)", "blur(0px)"],
        transition: { duration: 2, ease: "easeOut" },
      });

      // Decorative circle + logo start fading in early (while dot is still rolling)
      await new Promise((r) => setTimeout(r, 400));
      circleControls.start({
        opacity: 0.15,
        transition: { duration: 0.8, ease: "easeOut" },
      });
      logoControls.start({
        opacity: 1,
        transition: { duration: 0.8, ease: "easeOut" },
      });
    };

    runAnimation();
  }, [dotControls, circleControls, logoControls, lineWidth]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden pointer-events-none${className ? ` ${className}` : ""}`}
    >
      {/* Trailing line — thin, well-detached from dot */}
      <motion.div
        style={{
          position: "absolute",
          top: "calc(15% + 30px)",
          left: 0,
          height: 1,
          backgroundColor: accentColor,
          width: lineWidth,
          originX: 0,
        }}
      />

      {/* Rolling dot — 64px, starts blurry */}
      <motion.div
        initial={{ filter: "blur(8px)" }}
        animate={dotControls}
        style={{
          position: "absolute",
          top: "calc(15% - 0px)",
          left: 0,
          x: dotX,
          width: 64,
          height: 64,
          borderRadius: "50%",
          backgroundColor: accentColor,
        }}
      />

      {/* Decorative circle - bottom right, partially off screen */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={circleControls}
        style={{
          position: "absolute",
          bottom: -100,
          right: -100,
          width: 340,
          height: 340,
          borderRadius: "50%",
          backgroundColor: mutedAccentColor,
          opacity: 0,
        }}
      />

      {/* Logo watermark - bottom left, large and faint */}
      {logo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={logoControls}
          style={{
            position: "absolute",
            bottom: "5%",
            left: "3%",
            opacity: 0,
            fontSize: "clamp(120px, 20vw, 240px)",
            lineHeight: 1,
            filter: "grayscale(0.3)",
          }}
          className="[&>*]:opacity-10"
        >
          {logo}
        </motion.div>
      )}
    </div>
  );
}
