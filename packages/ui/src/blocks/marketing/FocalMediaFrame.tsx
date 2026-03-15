"use client";

import type { CSSProperties, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

import { cn } from "../../utils";

interface FocalPoint {
  x: number;
  y: number;
}

interface FocalMediaFrameProps {
  alt: string;
  children?: ReactNode;
  className?: string;
  focalPoint?: FocalPoint;
  height: number;
  imageClassName?: string;
  src: string;
  width: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function FocalMediaFrame({
  alt,
  children,
  className,
  focalPoint = { x: 0.5, y: 0.5 },
  height,
  imageClassName,
  src,
  width,
}: FocalMediaFrameProps) {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const [frameSize, setFrameSize] = useState<{
    height: number;
    width: number;
  } | null>(null);

  useEffect(() => {
    const node = frameRef.current;
    if (!node) {
      return;
    }

    const measureFrame = () => {
      const nextWidth = Math.round(node.clientWidth);
      const nextHeight = Math.round(node.clientHeight);

      if (nextWidth > 0 && nextHeight > 0) {
        setFrameSize({ width: nextWidth, height: nextHeight });
      }
    };

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) {
        return;
      }

      const nextWidth = Math.round(entry.contentRect.width);
      const nextHeight = Math.round(entry.contentRect.height);

      if (nextWidth > 0 && nextHeight > 0) {
        setFrameSize({ width: nextWidth, height: nextHeight });
      }
    });

    measureFrame();
    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  let imageStyle: CSSProperties = {
    backgroundImage: `url("${src}")`,
    backgroundPosition: `${focalPoint.x * 100}% ${focalPoint.y * 100}%`,
    backgroundSize: "cover",
  };
  let computedImageClassName =
    "absolute inset-0 bg-cover bg-no-repeat select-none";

  if (frameSize) {
    const scale = Math.max(frameSize.width / width, frameSize.height / height);
    const renderedWidth = width * scale;
    const renderedHeight = height * scale;
    const minLeft = frameSize.width - renderedWidth;
    const minTop = frameSize.height - renderedHeight;
    const left = clamp(
      frameSize.width / 2 - focalPoint.x * renderedWidth,
      minLeft,
      0,
    );
    const top = clamp(
      frameSize.height / 2 - focalPoint.y * renderedHeight,
      minTop,
      0,
    );

    computedImageClassName = "absolute bg-no-repeat select-none";
    imageStyle = {
      backgroundImage: `url("${src}")`,
      backgroundPosition: "center",
      backgroundSize: "100% 100%",
      height: renderedHeight,
      left,
      top,
      width: renderedWidth,
    };
  }

  return (
    <div
      ref={frameRef}
      aria-label={alt}
      className={cn("relative overflow-hidden", className)}
      data-slot="focal-media-frame"
      role="img"
    >
      <div
        aria-hidden="true"
        className={cn(computedImageClassName, imageClassName)}
        data-slot="focal-media-image"
        style={imageStyle}
      />
      {children}
    </div>
  );
}
