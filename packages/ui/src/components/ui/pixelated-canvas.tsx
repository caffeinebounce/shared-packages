"use client";

import React from "react";

export type PixelatedCanvasProps = Omit<
  React.CanvasHTMLAttributes<HTMLCanvasElement>,
  "height" | "width"
> & {
  alt?: string;
  onReady?: () => void;
  src: string;
  width?: number;
  height?: number;
  cellSize?: number;
  dotScale?: number;
  shape?: "circle" | "square";
  backgroundColor?: string;
  grayscale?: boolean;
  responsive?: boolean;
  dropoutStrength?: number;
  interactive?: boolean;
  distortionStrength?: number;
  distortionRadius?: number;
  distortionMode?: "repel" | "attract" | "swirl";
  followSpeed?: number;
  sampleAverage?: boolean;
  tintColor?: string;
  tintStrength?: number;
  maxFps?: number;
  objectFit?: "cover" | "contain" | "fill" | "none";
  jitterStrength?: number;
  jitterSpeed?: number;
  fadeOnLeave?: boolean;
  fadeSpeed?: number;
  imageCrossOrigin?: "" | "anonymous" | "use-credentials" | null;
};

export function PixelatedCanvas({
  alt,
  src,
  onReady,
  width = 400,
  height = 500,
  cellSize = 3,
  dotScale = 0.9,
  shape = "square",
  backgroundColor = "#000000",
  grayscale = false,
  className,
  responsive = false,
  dropoutStrength = 0.4,
  interactive = true,
  distortionStrength = 3,
  distortionRadius = 80,
  distortionMode = "swirl",
  followSpeed = 0.2,
  sampleAverage = true,
  tintColor = "#FFFFFF",
  tintStrength = 0.2,
  maxFps = 60,
  objectFit = "cover",
  jitterStrength = 4,
  jitterSpeed = 4,
  fadeOnLeave = true,
  fadeSpeed = 0.1,
  imageCrossOrigin = "anonymous",
  ...canvasProps
}: PixelatedCanvasProps) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const samplesRef = React.useRef<
    Array<{
      x: number;
      y: number;
      r: number;
      g: number;
      b: number;
      a: number;
      drop: boolean;
      seed: number;
    }>
  >([]);
  const dimsRef = React.useRef<{
    width: number;
    height: number;
    dot: number;
  } | null>(null);
  const targetMouseRef = React.useRef({ x: -9999, y: -9999 });
  const animatedMouseRef = React.useRef({ x: -9999, y: -9999 });
  const rafRef = React.useRef<number | null>(null);
  const lastFrameRef = React.useRef(0);
  const pointerInsideRef = React.useRef(false);
  const activityRef = React.useRef(0);
  const activityTargetRef = React.useRef(0);

  React.useEffect(() => {
    let isCancelled = false;
    let cleanupInteraction = () => {};
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const image = new Image();
    image.crossOrigin = imageCrossOrigin;
    let retriedWithoutCrossOrigin = false;

    const compute = () => {
      if (!canvas) {
        return;
      }

      const dpr =
        typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
      const displayWidth = width;
      const displayHeight = height;

      canvas.width = Math.max(1, Math.floor(displayWidth * dpr));
      canvas.height = Math.max(1, Math.floor(displayHeight * dpr));
      canvas.style.width = `${displayWidth}px`;
      canvas.style.height = `${displayHeight}px`;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return;
      }

      ctx.resetTransform();
      ctx.scale(dpr, dpr);

      if (backgroundColor) {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, displayWidth, displayHeight);
      } else {
        ctx.clearRect(0, 0, displayWidth, displayHeight);
      }

      const offscreen = document.createElement("canvas");
      offscreen.width = Math.max(1, Math.floor(displayWidth));
      offscreen.height = Math.max(1, Math.floor(displayHeight));

      const offscreenContext = offscreen.getContext("2d");
      if (!offscreenContext) {
        return;
      }

      const imageWidth = image.naturalWidth || displayWidth;
      const imageHeight = image.naturalHeight || displayHeight;
      let drawWidth = displayWidth;
      let drawHeight = displayHeight;
      let drawLeft = 0;
      let drawTop = 0;

      if (objectFit === "cover") {
        const scale = Math.max(
          displayWidth / imageWidth,
          displayHeight / imageHeight,
        );
        drawWidth = Math.ceil(imageWidth * scale);
        drawHeight = Math.ceil(imageHeight * scale);
        drawLeft = Math.floor((displayWidth - drawWidth) / 2);
        drawTop = Math.floor((displayHeight - drawHeight) / 2);
      } else if (objectFit === "contain") {
        const scale = Math.min(
          displayWidth / imageWidth,
          displayHeight / imageHeight,
        );
        drawWidth = Math.ceil(imageWidth * scale);
        drawHeight = Math.ceil(imageHeight * scale);
        drawLeft = Math.floor((displayWidth - drawWidth) / 2);
        drawTop = Math.floor((displayHeight - drawHeight) / 2);
      } else if (objectFit === "fill") {
        drawWidth = displayWidth;
        drawHeight = displayHeight;
      } else {
        drawWidth = imageWidth;
        drawHeight = imageHeight;
        drawLeft = Math.floor((displayWidth - drawWidth) / 2);
        drawTop = Math.floor((displayHeight - drawHeight) / 2);
      }

      offscreenContext.drawImage(
        image,
        drawLeft,
        drawTop,
        drawWidth,
        drawHeight,
      );

      let imageData: ImageData;
      try {
        imageData = offscreenContext.getImageData(
          0,
          0,
          offscreen.width,
          offscreen.height,
        );
      } catch {
        ctx.drawImage(image, 0, 0, displayWidth, displayHeight);
        return;
      }

      const data = imageData.data;
      const stride = offscreen.width * 4;
      const effectiveDotSize = Math.max(1, Math.floor(cellSize * dotScale));

      dimsRef.current = {
        width: displayWidth,
        height: displayHeight,
        dot: effectiveDotSize,
      };

      const luminanceAt = (pixelX: number, pixelY: number) => {
        const safeX = Math.max(0, Math.min(offscreen.width - 1, pixelX));
        const safeY = Math.max(0, Math.min(offscreen.height - 1, pixelY));
        const index = safeY * stride + safeX * 4;
        const red = data[index];
        const green = data[index + 1];
        const blue = data[index + 2];

        return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
      };

      const hash2D = (pixelX: number, pixelY: number) => {
        const seed =
          Math.sin(pixelX * 12.9898 + pixelY * 78.233) * 43758.5453123;
        return seed - Math.floor(seed);
      };

      let tintRgb: [number, number, number] | null = null;

      if (tintColor && tintStrength > 0) {
        const parseTintColor = (
          color: string,
        ): [number, number, number] | null => {
          if (color.startsWith("#")) {
            const hex = color.slice(1);

            if (hex.length === 3) {
              return [
                parseInt(hex[0] + hex[0], 16),
                parseInt(hex[1] + hex[1], 16),
                parseInt(hex[2] + hex[2], 16),
              ];
            }

            if (hex.length === 6) {
              return [
                parseInt(hex.slice(0, 2), 16),
                parseInt(hex.slice(2, 4), 16),
                parseInt(hex.slice(4, 6), 16),
              ];
            }
          }

          const rgbMatch = color.match(/rgb\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)\)/i);
          if (rgbMatch) {
            return [
              parseInt(rgbMatch[1], 10),
              parseInt(rgbMatch[2], 10),
              parseInt(rgbMatch[3], 10),
            ];
          }

          return null;
        };

        tintRgb = parseTintColor(tintColor);
      }

      const samples: Array<{
        x: number;
        y: number;
        r: number;
        g: number;
        b: number;
        a: number;
        drop: boolean;
        seed: number;
      }> = [];

      for (let sampleY = 0; sampleY < offscreen.height; sampleY += cellSize) {
        const centerY = Math.min(
          offscreen.height - 1,
          sampleY + Math.floor(cellSize / 2),
        );

        for (let sampleX = 0; sampleX < offscreen.width; sampleX += cellSize) {
          const centerX = Math.min(
            offscreen.width - 1,
            sampleX + Math.floor(cellSize / 2),
          );

          let red = 0;
          let green = 0;
          let blue = 0;
          let alpha = 0;

          if (!sampleAverage) {
            const sampleIndex = centerY * stride + centerX * 4;
            red = data[sampleIndex];
            green = data[sampleIndex + 1];
            blue = data[sampleIndex + 2];
            alpha = data[sampleIndex + 3] / 255;
          } else {
            let count = 0;

            for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
              for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
                const pointX = Math.max(
                  0,
                  Math.min(offscreen.width - 1, centerX + offsetX),
                );
                const pointY = Math.max(
                  0,
                  Math.min(offscreen.height - 1, centerY + offsetY),
                );
                const sampleIndex = pointY * stride + pointX * 4;

                red += data[sampleIndex];
                green += data[sampleIndex + 1];
                blue += data[sampleIndex + 2];
                alpha += data[sampleIndex + 3] / 255;
                count += 1;
              }
            }

            red = Math.round(red / count);
            green = Math.round(green / count);
            blue = Math.round(blue / count);
            alpha /= count;
          }

          if (grayscale) {
            const luminance = Math.round(
              0.2126 * red + 0.7152 * green + 0.0722 * blue,
            );
            red = luminance;
            green = luminance;
            blue = luminance;
          } else if (tintRgb && tintStrength > 0) {
            const mixAmount = Math.max(0, Math.min(1, tintStrength));
            red = Math.round(red * (1 - mixAmount) + tintRgb[0] * mixAmount);
            green = Math.round(
              green * (1 - mixAmount) + tintRgb[1] * mixAmount,
            );
            blue = Math.round(blue * (1 - mixAmount) + tintRgb[2] * mixAmount);
          }

          const centerLuminance = luminanceAt(centerX, centerY);
          const leftLuminance = luminanceAt(centerX - 1, centerY);
          const rightLuminance = luminanceAt(centerX + 1, centerY);
          const topLuminance = luminanceAt(centerX, centerY - 1);
          const bottomLuminance = luminanceAt(centerX, centerY + 1);
          const gradient =
            Math.abs(rightLuminance - leftLuminance) +
            Math.abs(bottomLuminance - topLuminance) +
            Math.abs(
              centerLuminance -
                (leftLuminance +
                  rightLuminance +
                  topLuminance +
                  bottomLuminance) /
                  4,
            );
          const gradientNorm = Math.max(0, Math.min(1, gradient / 255));
          const dropoutProbability = Math.max(
            0,
            Math.min(1, (1 - gradientNorm) * dropoutStrength),
          );
          const drop = hash2D(centerX, centerY) < dropoutProbability;

          samples.push({
            x: sampleX,
            y: sampleY,
            r: red,
            g: green,
            b: blue,
            a: alpha,
            drop,
            seed: hash2D(centerX, centerY),
          });
        }
      }

      samplesRef.current = samples;
    };

    const drawSamples = () => {
      const ctx = canvas.getContext("2d");
      const dims = dimsRef.current;
      const samples = samplesRef.current;

      if (!ctx || !dims || !samples) {
        return;
      }

      if (backgroundColor) {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, dims.width, dims.height);
      } else {
        ctx.clearRect(0, 0, dims.width, dims.height);
      }

      for (const sample of samples) {
        if (sample.drop || sample.a <= 0) {
          continue;
        }

        ctx.globalAlpha = sample.a;
        ctx.fillStyle = `rgb(${sample.r}, ${sample.g}, ${sample.b})`;

        if (shape === "circle") {
          const radius = dims.dot / 2;
          ctx.beginPath();
          ctx.arc(
            sample.x + cellSize / 2,
            sample.y + cellSize / 2,
            radius,
            0,
            Math.PI * 2,
          );
          ctx.fill();
        } else {
          ctx.fillRect(
            sample.x + cellSize / 2 - dims.dot / 2,
            sample.y + cellSize / 2 - dims.dot / 2,
            dims.dot,
            dims.dot,
          );
        }
      }

      ctx.globalAlpha = 1;
    };

    image.onload = () => {
      if (isCancelled) {
        return;
      }

      compute();
      drawSamples();
      onReady?.();

      if (!interactive) {
        return;
      }

      const stopAnimation = () => {
        if (rafRef.current !== null) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
      };

      const animate = () => {
        const now = performance.now();
        const minimumDelta = 1000 / Math.max(1, maxFps);

        if (now - lastFrameRef.current < minimumDelta) {
          rafRef.current = requestAnimationFrame(animate);
          return;
        }

        lastFrameRef.current = now;

        const ctx = canvas.getContext("2d");
        const dims = dimsRef.current;
        const samples = samplesRef.current;

        if (!ctx || !dims || !samples) {
          rafRef.current = requestAnimationFrame(animate);
          return;
        }

        animatedMouseRef.current.x +=
          (targetMouseRef.current.x - animatedMouseRef.current.x) * followSpeed;
        animatedMouseRef.current.y +=
          (targetMouseRef.current.y - animatedMouseRef.current.y) * followSpeed;

        if (fadeOnLeave) {
          activityRef.current +=
            (activityTargetRef.current - activityRef.current) * fadeSpeed;
        } else {
          activityRef.current = pointerInsideRef.current ? 1 : 0;
        }

        if (backgroundColor) {
          ctx.fillStyle = backgroundColor;
          ctx.fillRect(0, 0, dims.width, dims.height);
        } else {
          ctx.clearRect(0, 0, dims.width, dims.height);
        }

        const mouseX = animatedMouseRef.current.x;
        const mouseY = animatedMouseRef.current.y;
        const sigma = Math.max(1, distortionRadius * 0.5);
        const time = now * 0.001 * jitterSpeed;
        const activity = Math.max(0, Math.min(1, activityRef.current));

        for (const sample of samples) {
          if (sample.drop || sample.a <= 0) {
            continue;
          }

          let drawX = sample.x + cellSize / 2;
          let drawY = sample.y + cellSize / 2;
          const deltaX = drawX - mouseX;
          const deltaY = drawY - mouseY;
          const distanceSquared = deltaX * deltaX + deltaY * deltaY;
          const falloff = Math.exp(-distanceSquared / (2 * sigma * sigma));
          const influence = falloff * activity;

          if (influence > 0.0005) {
            if (distortionMode === "repel") {
              const distance = Math.sqrt(distanceSquared) + 0.0001;
              drawX += (deltaX / distance) * distortionStrength * influence;
              drawY += (deltaY / distance) * distortionStrength * influence;
            } else if (distortionMode === "attract") {
              const distance = Math.sqrt(distanceSquared) + 0.0001;
              drawX -= (deltaX / distance) * distortionStrength * influence;
              drawY -= (deltaY / distance) * distortionStrength * influence;
            } else {
              const angle = distortionStrength * 0.05 * influence;
              const cosAngle = Math.cos(angle);
              const sinAngle = Math.sin(angle);
              const rotatedX = cosAngle * deltaX - sinAngle * deltaY;
              const rotatedY = sinAngle * deltaX + cosAngle * deltaY;
              drawX = mouseX + rotatedX;
              drawY = mouseY + rotatedY;
            }

            if (jitterStrength > 0) {
              const jitterSeed = sample.seed * 43758.5453;
              drawX += Math.sin(time + jitterSeed) * jitterStrength * influence;
              drawY +=
                Math.cos(time + jitterSeed * 1.13) * jitterStrength * influence;
            }
          }

          ctx.globalAlpha = sample.a;
          ctx.fillStyle = `rgb(${sample.r}, ${sample.g}, ${sample.b})`;

          if (shape === "circle") {
            const radius = dims.dot / 2;
            ctx.beginPath();
            ctx.arc(drawX, drawY, radius, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillRect(
              drawX - dims.dot / 2,
              drawY - dims.dot / 2,
              dims.dot,
              dims.dot,
            );
          }
        }

        ctx.globalAlpha = 1;

        if (fadeOnLeave && !pointerInsideRef.current && activity <= 0.01) {
          activityRef.current = 0;
          targetMouseRef.current.x = -9999;
          targetMouseRef.current.y = -9999;
          animatedMouseRef.current.x = -9999;
          animatedMouseRef.current.y = -9999;
          drawSamples();
          stopAnimation();
          return;
        }

        rafRef.current = requestAnimationFrame(animate);
      };

      const startAnimation = () => {
        if (rafRef.current !== null) {
          return;
        }

        lastFrameRef.current = 0;
        rafRef.current = requestAnimationFrame(animate);
      };

      const handlePointerMove = (event: PointerEvent) => {
        const rect = canvas.getBoundingClientRect();
        targetMouseRef.current.x = event.clientX - rect.left;
        targetMouseRef.current.y = event.clientY - rect.top;
        pointerInsideRef.current = true;
        activityTargetRef.current = 1;
        startAnimation();
      };

      const handlePointerEnter = () => {
        pointerInsideRef.current = true;
        activityTargetRef.current = 1;
        startAnimation();
      };

      const handlePointerLeave = () => {
        pointerInsideRef.current = false;

        if (fadeOnLeave) {
          activityTargetRef.current = 0;
        } else {
          activityTargetRef.current = 0;
          activityRef.current = 0;
          targetMouseRef.current.x = -9999;
          targetMouseRef.current.y = -9999;
          animatedMouseRef.current.x = -9999;
          animatedMouseRef.current.y = -9999;
          drawSamples();
          stopAnimation();
        }
      };

      canvas.addEventListener("pointermove", handlePointerMove);
      canvas.addEventListener("pointerenter", handlePointerEnter);
      canvas.addEventListener("pointerleave", handlePointerLeave);

      cleanupInteraction = () => {
        canvas.removeEventListener("pointermove", handlePointerMove);
        canvas.removeEventListener("pointerenter", handlePointerEnter);
        canvas.removeEventListener("pointerleave", handlePointerLeave);
        stopAnimation();
      };
    };

    image.onerror = () => {
      if (!retriedWithoutCrossOrigin && image.crossOrigin !== null) {
        retriedWithoutCrossOrigin = true;
        image.crossOrigin = null;
        image.src = "";
        image.src = src;
        return;
      }

      console.error("Failed to load image for PixelatedCanvas:", src);
    };

    image.src = src;

    const handleResize = () => {
      if (image.complete && image.naturalWidth) {
        compute();
        drawSamples();
      }
    };

    if (responsive) {
      window.addEventListener("resize", handleResize);
    }

    return () => {
      isCancelled = true;

      if (responsive) {
        window.removeEventListener("resize", handleResize);
      }

      cleanupInteraction();
    };
  }, [
    src,
    width,
    height,
    cellSize,
    dotScale,
    shape,
    backgroundColor,
    grayscale,
    responsive,
    dropoutStrength,
    interactive,
    distortionStrength,
    distortionRadius,
    distortionMode,
    followSpeed,
    sampleAverage,
    tintColor,
    tintStrength,
    maxFps,
    objectFit,
    jitterStrength,
    jitterSpeed,
    fadeOnLeave,
    fadeSpeed,
    imageCrossOrigin,
    onReady,
  ]);

  const accessibilityProps =
    canvasProps["aria-hidden"] === true
      ? {}
      : {
          role: canvasProps.role ?? "img",
          "aria-label":
            canvasProps["aria-label"] ??
            alt ??
            "Pixelated rendering of source image",
        };

  return (
    <canvas
      ref={canvasRef}
      className={className}
      {...accessibilityProps}
      {...canvasProps}
    />
  );
}
