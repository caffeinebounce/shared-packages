"use client";

import type { ReactNode } from "react";

import { cn } from "../../utils";

/**
 * Props for the MarketingLayout component
 */
export interface MarketingLayoutProps {
  /** Navigation bar element */
  navbar: ReactNode;
  /** Main page content */
  children: ReactNode;
  /** Footer element */
  footer?: ReactNode;
  /** Additional className for the main content area */
  mainClassName?: string;
  /** Additional className for the root container */
  className?: string;
}

/**
 * A layout component for marketing/public pages with navbar, main content, and footer.
 *
 * @example
 * ```tsx
 * <MarketingLayout
 *   navbar={<Navbar />}
 *   footer={<Footer />}
 * >
 *   <HeroSection />
 *   <FeaturesSection />
 * </MarketingLayout>
 * ```
 */
export function MarketingLayout({
  navbar,
  children,
  footer,
  mainClassName,
  className,
}: MarketingLayoutProps) {
  return (
    <div className={cn("flex min-h-screen flex-col", className)}>
      {navbar}
      <main className={cn("flex-1", mainClassName)}>{children}</main>
      {footer}
    </div>
  );
}
