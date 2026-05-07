"use client";

import { useEffect } from "react";
import {
  getMicrosoftClarityScriptUrl,
  normalizeMicrosoftClarityProjectId,
} from "./microsoftClarity";

declare global {
  interface Window {
    clarity?: (...args: unknown[]) => void;
  }
}

type ClarityQueueFn = ((...args: unknown[]) => void) & {
  q?: unknown[][];
};

export interface ClarityAnalyticsProps {
  /**
   * Microsoft Clarity project ID.
   * Get your project ID from https://clarity.microsoft.com/
   */
  projectId?: string;
  /**
   * Whether the Clarity script should load.
   * @default true
   */
  enabled?: boolean;
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
export function ClarityAnalytics({
  projectId,
  enabled = true,
}: ClarityAnalyticsProps) {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const normalizedProjectId = normalizeMicrosoftClarityProjectId(projectId);

    // Only load Clarity if project ID is configured
    if (!normalizedProjectId) {
      if (projectId?.trim()) {
        console.warn(
          `Invalid Microsoft Clarity project ID: ${projectId}. Expected letters, numbers, underscores, or dashes.`,
        );
      }
      return;
    }

    // Check if Clarity is already loaded
    if (window.clarity) {
      return;
    }

    // Load Clarity script (standard Microsoft Clarity initialization pattern)
    const queuedClarity: ClarityQueueFn = (...args: unknown[]) => {
      queuedClarity.q ??= [];
      queuedClarity.q.push(args);
    };

    window.clarity = queuedClarity;

    const script = document.createElement("script");
    script.async = true;
    script.src = getMicrosoftClarityScriptUrl(normalizedProjectId);
    const firstScript = document.getElementsByTagName("script")[0];
    if (firstScript?.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript);
    } else {
      document.head.appendChild(script);
    }
  }, [enabled, projectId]);

  return null;
}
