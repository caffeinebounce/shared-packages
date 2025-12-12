"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    clarity?: (...args: unknown[]) => void;
  }
}

export interface ClarityAnalyticsProps {
  /**
   * Microsoft Clarity project ID.
   * Get your project ID from https://clarity.microsoft.com/
   */
  projectId?: string;
}

/**
 * Microsoft Clarity Analytics Component
 *
 * Loads the Microsoft Clarity script for user behavior analytics including:
 * - Session recordings
 * - Heatmaps
 * - User interaction insights
 *
 * @example
 * ```tsx
 * // In your root layout
 * import { ClarityAnalytics } from "@caffeinebounce/ui";
 *
 * <ClarityAnalytics projectId={process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID} />
 * ```
 */
export function ClarityAnalytics({ projectId }: ClarityAnalyticsProps) {
  useEffect(() => {
    // Only load Clarity if project ID is configured
    if (!projectId) {
      return;
    }

    // Check if Clarity is already loaded
    if (window.clarity) {
      return;
    }

    // Load Clarity script (standard Microsoft Clarity initialization pattern)
    ((
      c: Window & typeof globalThis,
      l: Document,
      a: string,
      r: string,
      i: string,
      t?: HTMLScriptElement,
      y?: Element | null,
    ) => {
      // biome-ignore lint/suspicious/noExplicitAny: Clarity API requires dynamic property access
      (c as any)[a] =
        // biome-ignore lint/suspicious/noExplicitAny: Clarity API requires dynamic property access
        (c as any)[a] ||
        ((...args: unknown[]) => {
          // biome-ignore lint/suspicious/noExplicitAny: Clarity API requires dynamic property access
          // biome-ignore lint/suspicious/noAssignInExpressions: Standard Clarity initialization pattern
          ((c as any)[a].q = (c as any)[a].q || []).push(args);
        });
      t = l.createElement(r) as HTMLScriptElement;
      t.async = true;
      t.src = `https://www.clarity.ms/tag/${i}`;
      y = l.getElementsByTagName(r)[0];
      if (y?.parentNode) {
        y.parentNode.insertBefore(t, y);
      }
    })(window, document, "clarity", "script", projectId);
  }, [projectId]);

  return null;
}
