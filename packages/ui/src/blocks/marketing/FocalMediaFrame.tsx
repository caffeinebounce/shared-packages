"use client";

import type { CSSProperties, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

import type { PixelatedCanvasProps } from "../../components/ui/pixelated-canvas";
import { PixelatedCanvas } from "../../components/ui/pixelated-canvas";
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
  pixelatedCanvas?: boolean;
  pixelatedCanvasProps?: Partial<
    Omit<PixelatedCanvasProps, "alt" | "height" | "src" | "width">
  >;
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
  pixelatedCanvas = false,
  pixelatedCanvasProps,
  src,
  width,
}: FocalMediaFrameProps) {
  const { className: pixelatedCanvasClassName, ...pixelatedCanvasOptions } =
    pixelatedCanvasProps ?? {};
  const frameRef = useRef<HTMLDivElement | null>(null);
  const [isCanvasReady, setIsCanvasReady] = useState(false);
  const [frameSize, setFrameSize] = useState<{
    height: number;
    width: number;
  } | null>(null);
  const canvasRenderKey = pixelatedCanvas
    ? `${src}:${frameSize?.width ?? 0}:${frameSize?.height ?? 0}`
    : null;

  useEffect(() => {
    if (canvasRenderKey) {
      setIsCanvasReady(false);
    }
  }, [canvasRenderKey]);

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
  let renderedImageWidth = width;
  let renderedImageHeight = height;

  if (frameSize) {
    const scale = Math.max(frameSize.width / width, frameSize.height / height);
    renderedImageWidth = width * scale;
    renderedImageHeight = height * scale;
    const minLeft = frameSize.width - renderedImageWidth;
    const minTop = frameSize.height - renderedImageHeight;
    const left = clamp(
      frameSize.width / 2 - focalPoint.x * renderedImageWidth,
      minLeft,
      0,
    );
    const top = clamp(
      frameSize.height / 2 - focalPoint.y * renderedImageHeight,
      minTop,
      0,
    );

    computedImageClassName = "absolute bg-no-repeat select-none";
    imageStyle = {
      backgroundImage: pixelatedCanvas ? undefined : `url("${src}")`,
      backgroundPosition: pixelatedCanvas ? undefined : "center",
      backgroundSize: pixelatedCanvas ? undefined : "100% 100%",
      height: renderedImageHeight,
      left,
      top,
      width: renderedImageWidth,
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
      {pixelatedCanvas ? (
        <>
          <div
            aria-hidden="true"
            className={cn(
              "absolute inset-0 bg-black/30 transition-opacity duration-300",
              isCanvasReady && frameSize ? "opacity-0" : "opacity-100",
            )}
            data-slot="focal-media-placeholder"
          />
          {frameSize ? (
            <div
              aria-hidden="true"
              className={cn(
                computedImageClassName,
                "transition-opacity duration-300",
                isCanvasReady ? "opacity-100" : "opacity-0",
                imageClassName,
              )}
              data-slot="focal-media-canvas-frame"
              style={imageStyle}
            >
              <PixelatedCanvas
                alt={alt}
                aria-hidden="true"
                backgroundColor="transparent"
                className={cn("block h-full w-full", pixelatedCanvasClassName)}
                data-slot="focal-media-canvas"
                height={Math.round(renderedImageHeight)}
                key={canvasRenderKey}
                objectFit="fill"
                onReady={() => setIsCanvasReady(true)}
                src={src}
                width={Math.round(renderedImageWidth)}
                {...pixelatedCanvasOptions}
              />
            </div>
          ) : null}
        </>
      ) : (
        <div
          aria-hidden="true"
          className={cn(computedImageClassName, imageClassName)}
          data-slot="focal-media-image"
          style={imageStyle}
        />
      )}
      {children}
    </div>
  );
}
