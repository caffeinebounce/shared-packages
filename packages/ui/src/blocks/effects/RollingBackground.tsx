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

  const lineWidth = useMotionValue(0);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const runAnimation = async () => {
      const vw = containerRef.current?.offsetWidth ?? window.innerWidth;
      const targetX = vw - 50;

      // Bounce keyframes for Y (subtle sine oscillation)
      const topY = 0;
      const bounceAmp = 8;
      const bounceY = [
        topY,
        topY - bounceAmp,
        topY,
        topY - bounceAmp * 0.6,
        topY,
        topY - bounceAmp * 0.3,
        topY,
        topY,
      ];

      // Animate dot x + y simultaneously
      dotControls.start({
        x: targetX,
        y: bounceY,
        transition: {
          x: { duration: 1.8, ease: "easeOut" },
          y: {
            duration: 1.8,
            ease: "easeInOut",
            times: [0, 0.2, 0.4, 0.55, 0.7, 0.82, 0.92, 1],
          },
        },
      });

      // Animate line width to follow dot
      animate(lineWidth, targetX, { duration: 1.8, ease: "easeOut" });

      // Decorative circle fades in around same time dot settles
      await new Promise((r) => setTimeout(r, 1600));
      circleControls.start({
        opacity: 0.15,
        transition: { duration: 0.6, ease: "easeOut" },
      });

      // Logo watermark fades in after animation completes
      await new Promise((r) => setTimeout(r, 400));
      logoControls.start({
        opacity: 1,
        transition: { duration: 0.5, ease: "easeOut" },
      });
    };

    runAnimation();
  }, [dotControls, circleControls, logoControls, lineWidth]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden pointer-events-none${className ? ` ${className}` : ""}`}
    >
      {/* Trailing line — thinner, stops short of the dot */}
      <motion.div
        style={{
          position: "absolute",
          top: "calc(15% + 14px)",
          left: 0,
          height: 1,
          backgroundColor: accentColor,
          width: useTransform(lineWidth, (v) => Math.max(0, v - 40)),
          originX: 0,
        }}
      />

      {/* Rolling dot — 2x bigger (32px) */}
      <motion.div
        initial={{ x: -32, y: 0 }}
        animate={dotControls}
        style={{
          position: "absolute",
          top: "calc(15% - 0px)",
          left: 0,
          width: 32,
          height: 32,
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
