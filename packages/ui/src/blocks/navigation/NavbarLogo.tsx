"use client";

import type { ComponentType, ReactNode } from "react";
import { cn } from "../../utils";

export interface NavbarLogoProps {
  /** Link destination (typically "/") */
  href?: string;
  /** Image source URL */
  imageSrc: string;
  /** Image alt text */
  imageAlt: string;
  /** Brand text to display next to image */
  text?: string;
  /** Image width in pixels */
  imageWidth?: number;
  /** Image height in pixels */
  imageHeight?: number;
  /** Whether to invert the image in dark mode */
  invertInDarkMode?: boolean;
  /** Additional className for the container */
  className?: string;
  /** Additional className for the image */
  imageClassName?: string;
  /** Additional className for the text */
  textClassName?: string;
  /** Link component for client-side navigation */
  LinkComponent?: ComponentType<{
    href: string;
    className?: string;
    children: ReactNode;
  }>;
  /** Image component (e.g., Next.js Image) */
  ImageComponent?: ComponentType<{
    src: string;
    alt: string;
    width: number;
    height: number;
    className?: string;
  }>;
}

/**
 * Navbar logo component with image and optional text.
 * Supports dark mode image inversion and custom Link/Image components.
 *
 * @example
 * ```tsx
 * // With Next.js
 * <NavbarLogo
 *   href="/"
 *   imageSrc="/logo.png"
 *   imageAlt="My Brand"
 *   text="My Brand"
 *   invertInDarkMode
 *   LinkComponent={Link}
 *   ImageComponent={Image}
 * />
 *
 * // Without framework components
 * <NavbarLogo
 *   href="/"
 *   imageSrc="/logo.png"
 *   imageAlt="My Brand"
 *   text="My Brand"
 * />
 * ```
 */
export function NavbarLogo({
  href = "/",
  imageSrc,
  imageAlt,
  text,
  imageWidth = 32,
  imageHeight = 32,
  invertInDarkMode = false,
  className,
  imageClassName,
  textClassName,
  LinkComponent,
  ImageComponent,
}: NavbarLogoProps) {
  const LinkEl = LinkComponent || "a";

  const content = (
    <>
      {ImageComponent ? (
        <ImageComponent
          src={imageSrc}
          alt={imageAlt}
          width={imageWidth}
          height={imageHeight}
          className={cn(
            "rounded-md",
            invertInDarkMode && "dark:invert dark:brightness-100",
            imageClassName,
          )}
        />
      ) : (
        <img
          src={imageSrc}
          alt={imageAlt}
          width={imageWidth}
          height={imageHeight}
          className={cn(
            "rounded-md",
            invertInDarkMode && "dark:invert dark:brightness-100",
            imageClassName,
          )}
        />
      )}
      {text && (
        <span
          className={cn(
            "text-sm text-foreground whitespace-nowrap uppercase",
            textClassName,
          )}
          style={{ letterSpacing: "0.12em", fontWeight: 800 }}
        >
          {text}
        </span>
      )}
    </>
  );

  return (
    <LinkEl
      href={href}
      className={cn(
        "flex items-center gap-2.5 transition-opacity hover:opacity-80 shrink-0",
        className,
      )}
    >
      {content}
    </LinkEl>
  );
}
