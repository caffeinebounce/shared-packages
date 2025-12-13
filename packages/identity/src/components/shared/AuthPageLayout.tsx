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
    <div className="relative min-h-svh w-full overflow-hidden">
      {/* Full-page gradient background - light/dark aware */}
      <div className="absolute inset-0 bg-zinc-100 dark:bg-zinc-950 pointer-events-none">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-linear-to-br from-zinc-50 via-zinc-100 to-zinc-200 dark:from-zinc-900 dark:via-zinc-950 dark:to-black" />

        {/* Gradient orbs - restored glow */}
        <div className="absolute top-0 left-1/4 h-[600px] w-[600px] rounded-full bg-primary/10 dark:bg-primary/15 blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 h-[500px] w-[500px] rounded-full bg-violet-500/8 dark:bg-violet-500/12 blur-[128px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-blue-500/5 dark:bg-blue-500/8 blur-[100px]" />
      </div>

      {/* Easter egg: Interactive ripple effect - covers full page */}
      {showRippleEffect && (
        <div className="absolute inset-0 z-10">
          <BackgroundRippleEffect rows={20} cols={40} cellSize={56} />
        </div>
      )}

      {/* Content */}
      {children}
    </div>
  );
}
