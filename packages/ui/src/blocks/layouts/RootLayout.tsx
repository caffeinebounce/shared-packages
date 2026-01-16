"use client";

import type { ReactNode } from "react";

import { Toaster } from "../../components/ui/sonner";
import { ClarityAnalytics, GoogleAnalytics } from "../analytics";

/**
 * Script to prevent flash of unstyled content (FOUC) when using dark mode.
 * Runs immediately before React hydration.
 */
export const themeScript = `
  (function() {
    try {
      var theme = localStorage.getItem('theme');
      if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
      }
    } catch (e) {}
  })();
`;

/**
 * Font configuration for RootLayout.
 *
 * Next.js fonts provide two things:
 * - `.variable` - A CSS class that defines a CSS variable (e.g., `--font-geist-sans`)
 * - `.className` - A CSS class that applies the font directly
 *
 * This interface accepts CSS variable class names to define font variables,
 * and CSS variable references to apply specific fonts to elements.
 */
export interface RootLayoutFont {
  /**
   * Font variable classes to apply to the root element.
   * These classes define CSS variables that can be used throughout the app.
   * Pass Next.js font `.variable` properties here.
   * @example `${GeistSans.variable} ${GeistMono.variable}`
   */
  variables?: string;

  /**
   * CSS variable for body text font-family.
   * @example "var(--font-geist-sans)"
   * @default Uses Tailwind's font-sans
   */
  body?: string;

  /**
   * CSS variable for header text (h1-h6) font-family.
   * @example "var(--font-geist-mono)"
   * @default Inherits from body font
   */
  headers?: string;

  /**
   * CSS variable for monospace elements (code, pre, kbd, samp).
   * @example "var(--font-geist-mono)"
   * @default Uses Tailwind's font-mono
   */
  mono?: string;
}

/**
 * Analytics configuration for RootLayout.
 */
export interface RootLayoutAnalytics {
  /**
   * Microsoft Clarity project ID.
   * Get your project ID from https://clarity.microsoft.com/
   */
  clarityProjectId?: string;
  /**
   * Google Analytics (GA4) measurement ID.
   * Get your measurement ID from https://analytics.google.com/
   */
  googleAnalyticsId?: string;
}

/**
 * Toast configuration for RootLayout.
 */
export interface RootLayoutToast {
  /**
   * Show the Toaster component for notifications.
   * @default true
   */
  enabled?: boolean;

  /**
   * Position of the toaster.
   * @default "bottom-right"
   */
  position?:
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right"
    | "top-center"
    | "bottom-center";
}

export interface RootLayoutProps {
  /** Main page content */
  children: ReactNode;

  /**
   * Structured font configuration for different text types.
   * @example { body: GeistSans.variable, headers: GeistMono.variable, mono: GeistMono.variable }
   */
  font?: RootLayoutFont;

  /**
   * Font CSS variable classes to apply to body.
   * @deprecated Use font.body instead for better structure and flexibility
   * @example "font-sans" or "${GeistSans.variable} ${GeistMono.variable}"
   */
  fontClassName?: string;

  /**
   * Analytics configuration.
   * @example { clarityProjectId: process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID, googleAnalyticsId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID }
   */
  analytics?: RootLayoutAnalytics;

  /**
   * Toast notification configuration.
   * @default { enabled: true, position: "bottom-right" }
   */
  toast?: RootLayoutToast;

  /**
   * Additional className for the root container.
   */
  className?: string;
}

/**
 * Root layout body component providing consistent styling, theming, and common elements.
 *
 * This component handles:
 * - Base body styles (min-height, background, text, antialiasing)
 * - Font variable classes (body, headers, mono)
 * - Analytics integrations (Clarity, etc.)
 * - Toast notifications
 *
 * Note: This wraps the `<body>` content. The `<html>` tag, `<head>`, and metadata
 * should be handled by your Next.js app's layout.tsx file.
 *
 * @example
 * ```tsx
 * // In your app's layout.tsx - New API
 * import { RootLayout, themeScript } from "@caffeinebounce/ui";
 * import { GeistSans, GeistMono } from "geist/font";
 *
 * export default function Layout({ children }) {
 *   return (
 *     <html lang="en" suppressHydrationWarning>
 *       <head>
 *         <script dangerouslySetInnerHTML={{ __html: themeScript }} />
 *       </head>
 *       <body>
 *         <RootLayout
 *           font={{
 *             variables: `${GeistSans.variable} ${GeistMono.variable}`,
 *             headers: "var(--font-geist-sans)",
 *             mono: "var(--font-geist-mono)",
 *           }}
 *           analytics={{
 *             clarityProjectId: process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID,
 *             googleAnalyticsId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
 *           }}
 *         >
 *           {children}
 *         </RootLayout>
 *       </body>
 *     </html>
 *   );
 * }
 *
 * // Legacy API (still supported, but headers/mono won't be customizable)
 * <RootLayout
 *   fontClassName={`${GeistSans.variable} ${GeistMono.variable}`}
 *   analytics={{ clarityProjectId: process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID }}
 * >
 *   {children}
 * </RootLayout>
 * ```
 */
export function RootLayout({
  children,
  font,
  fontClassName = "",
  analytics,
  toast,
  className,
}: RootLayoutProps) {
  // min-h-dvh = minimum dynamic viewport height, allows content to grow beyond viewport
  // overflow-x-hidden prevents horizontal scroll from 100vw elements
  // App layouts (AppLayout, AdminLayout) handle their own internal scrolling with h-full
  // Marketing layouts can grow naturally beyond the viewport
  const baseClasses =
    "font-sans min-h-dvh bg-background text-foreground flex flex-col antialiased overflow-x-hidden";

  const showToaster = toast?.enabled !== false;
  const toasterPosition = toast?.position ?? "bottom-right";

  // Build font classes - prioritize new font prop, fallback to fontClassName for backward compatibility
  let fontClasses = "";
  const fontStyles: Record<string, string> = {};

  if (font) {
    // New structured font API
    // font.variables contains the CSS variable class names (e.g., GeistSans.variable)
    if (font.variables) {
      fontClasses = font.variables;
    }
    // font.body, font.headers, font.mono are CSS variable references (e.g., "var(--font-geist-sans)")
    if (font.body) {
      fontStyles["--font-body"] = font.body;
    }
    if (font.headers) {
      fontStyles["--font-headers"] = font.headers;
    }
    if (font.mono) {
      fontStyles["--font-mono"] = font.mono;
    }
  }

  // Fallback to legacy fontClassName if no font.variables was provided
  if (!font?.variables && fontClassName) {
    fontClasses = fontClassName;
  }

  // Combine all classes
  const combinedClassName = [fontClasses, baseClasses, className]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={combinedClassName}
      style={
        Object.keys(fontStyles).length > 0
          ? (fontStyles as React.CSSProperties)
          : undefined
      }
      // Suppress hydration warnings for font class names which may differ
      // slightly between server and client due to CSS module hash generation
      suppressHydrationWarning
    >
      {analytics?.clarityProjectId && (
        <ClarityAnalytics projectId={analytics.clarityProjectId} />
      )}
      {analytics?.googleAnalyticsId && (
        <GoogleAnalytics measurementId={analytics.googleAnalyticsId} />
      )}
      {children}
      {showToaster && <Toaster richColors position={toasterPosition} />}
    </div>
  );
}
