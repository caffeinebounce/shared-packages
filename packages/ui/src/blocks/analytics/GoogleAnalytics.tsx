"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export interface GoogleAnalyticsProps {
  /**
   * Google Analytics (GA4) measurement ID.
   * Get your measurement ID from https://analytics.google.com/
   */
  measurementId?: string;
}

/**
 * Google Analytics (GA4) Component
 *
 * Loads the Google Analytics gtag.js script for web analytics including:
 * - Page views
 * - User engagement metrics
 * - Conversion tracking
 * - Custom events
 *
 * @example
 * ```tsx
 * // In your root layout
 * import { GoogleAnalytics } from "@caffeinebounce/ui";
 *
 * <GoogleAnalytics measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
 * ```
 */
export function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  useEffect(() => {
    // Only load Google Analytics if measurement ID is configured
    if (!measurementId) {
      return;
    }

    // Validate GA4 measurement ID format
    if (!/^G-[A-Z0-9]+$/.test(measurementId)) {
      console.warn(
        `Invalid Google Analytics measurement ID: ${measurementId}. Expected format: G-XXXXXXXXXX`,
      );
      return;
    }

    // Check if gtag is already loaded
    if (window.gtag) {
      return;
    }

    // Initialize dataLayer and gtag function
    window.dataLayer = window.dataLayer || [];
    function gtag(..._args: unknown[]) {
      // Google dispatches Arguments objects as commands; arrays are model calls.
      // biome-ignore lint/complexity/noArguments: gtag requires the native Arguments object.
      window.dataLayer?.push(arguments);
    }
    window.gtag = gtag;

    // Load gtag.js script
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;

    // Initialize GA after script loads
    script.onload = () => {
      gtag("js", new Date());
      gtag("config", measurementId);
    };

    document.head.appendChild(script);
  }, [measurementId]);

  return null;
}
