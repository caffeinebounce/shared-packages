"use client";

import { cn } from "@caffeinebounce/ui";
import type { ComponentType } from "react";

export interface AuthHeaderProps {
  /** Logo configuration */
  logo?: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
  };
  /** Title text (e.g., "Sign in to {appName}") */
  title: string;
  /** Image component to use (e.g., Next.js Image) */
  ImageComponent?: ComponentType<{
    src: string;
    alt: string;
    width: number;
    height: number;
    className?: string;
  }>;
  /** Whether to show the logo inside the card. Default: true */
  showLogo?: boolean;
  /** Additional className */
  className?: string;
}

/**
 * AuthHeader - Shared header component for auth forms with logo and title
 */
export function AuthHeader({
  logo,
  title,
  ImageComponent = "img" as unknown as ComponentType<{
    src: string;
    alt: string;
    width: number;
    height: number;
    className?: string;
  }>,
  className,
}: AuthHeaderProps) {
  const Image = ImageComponent;

  return (
    <div className={cn("text-center space-y-2", className)}>
      {logo && (
        <div className="flex justify-center mb-6">
          <Image
            src={logo.src}
            alt={logo.alt}
            width={logo.width ?? 48}
            height={logo.height ?? 48}
            className="rounded-xl"
          />
        </div>
      )}
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        {title}
      </h1>
    </div>
  );
}
