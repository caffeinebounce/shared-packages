"use client";

import { cn } from "@caffeinebounce/ui";
import { ArrowLeft } from "lucide-react";
import type { ComponentType, ReactNode } from "react";

export interface AuthFormLayoutProps {
  /** Form content (inside the card) */
  children: ReactNode;
  /** Footer content (outside the card, e.g., terms/privacy) */
  footer?: ReactNode;
  /** Home link URL */
  homeUrl?: string;
  /** Whether to show the home link */
  showHomeLink?: boolean;
  /** Link component to use (e.g., Next.js Link) */
  LinkComponent?: ComponentType<{
    href: string;
    className?: string;
    children: ReactNode;
  }>;
  /** Additional className for the card */
  className?: string;
}

/**
 * AuthFormLayout - Shared layout for auth form cards
 *
 * Provides consistent positioning, home link, and card styling for all auth forms.
 */
export function AuthFormLayout({
  children,
  footer,
  homeUrl = "/",
  showHomeLink = true,
  LinkComponent = "a" as unknown as ComponentType<{
    href: string;
    className?: string;
    children: ReactNode;
  }>,
  className,
}: AuthFormLayoutProps) {
  const Link = LinkComponent;

  return (
    <>
      {/* Home link - needs pointer-events-auto since parent has pointer-events-none */}
      {showHomeLink && (
        <div className="absolute top-0 left-0 p-4 z-50 pointer-events-auto">
          <Link
            href={homeUrl}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            Home
          </Link>
        </div>
      )}

      {/* Centering container */}
      <div className="relative z-20 flex min-h-svh flex-col items-center justify-center px-6 py-12 pointer-events-none">
        <div className="w-full max-w-sm pointer-events-auto">
          {/* Form card */}
          <div
            className={cn(
              "relative z-30 rounded-2xl border border-border bg-card/95 dark:bg-zinc-900/95 backdrop-blur-xl p-8 shadow-2xl",
              className,
            )}
          >
            <div className="flex flex-col gap-6 w-full">{children}</div>
          </div>

          {/* Footer (outside card) */}
          {footer}
        </div>
      </div>
    </>
  );
}
