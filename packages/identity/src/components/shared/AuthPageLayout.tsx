import { BackgroundRippleEffect } from "@caffeinebounce/ui";
import type { ReactNode } from "react";

export interface AuthPageLayoutProps {
  /** Page content */
  children: ReactNode;
  /** Show the interactive ripple effect (only on signin by default) */
  showRippleEffect?: boolean;
}

/**
 * AuthPageLayout - Full-page layout for auth pages with gradient background
 *
 * Provides a consistent gradient background with optional interactive ripple effect.
 *
 * @example
 * ```tsx
 * <AuthPageLayout showRippleEffect>
 *   <SigninForm ... />
 * </AuthPageLayout>
 * ```
 */
export function AuthPageLayout({
  children,
  showRippleEffect = false,
}: AuthPageLayoutProps) {
  return (
    <div className="relative min-h-svh w-full">
      {/* Full-page gradient background - light/dark aware, sticky to cover scroll */}
      <div className="fixed inset-0 bg-zinc-100 dark:bg-zinc-950 pointer-events-none">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-linear-to-br from-zinc-50 via-zinc-100 to-zinc-200 dark:from-zinc-900 dark:via-zinc-950 dark:to-black" />
      </div>

      {/* Easter egg: Interactive ripple effect - covers full page, clickable */}
      {showRippleEffect && (
        <div className="fixed inset-0 z-10">
          <BackgroundRippleEffect rows={20} cols={40} cellSize={56} />
        </div>
      )}

      {/* Content - positioned above the fixed background */}
      <div className="relative z-20">{children}</div>
    </div>
  );
}
