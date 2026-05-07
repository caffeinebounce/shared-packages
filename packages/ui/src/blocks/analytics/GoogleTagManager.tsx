"use client";

import {
  getGoogleTagManagerNoScriptUrl,
  getGoogleTagManagerScriptUrl,
  normalizeGoogleTagManagerContainerId,
} from "@caffeinebounce/shared-utils";
import { useEffect } from "react";

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

export interface GoogleTagManagerProps {
  /**
   * Google Tag Manager container ID.
   * @example "GTM-XXXXXXX"
   */
  containerId?: string;
  /**
   * Whether the GTM script should load.
   * @default true
   */
  enabled?: boolean;
  /**
   * Data layer name.
   * @default "dataLayer"
   */
  dataLayerName?: string;
}

/**
 * Google Tag Manager component for controlled marketing tag orchestration.
 */
export function GoogleTagManager({
  containerId,
  dataLayerName = "dataLayer",
  enabled = true,
}: GoogleTagManagerProps) {
  const normalizedContainerId =
    normalizeGoogleTagManagerContainerId(containerId);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    if (!normalizedContainerId) {
      if (containerId?.trim()) {
        console.warn(
          `Invalid Google Tag Manager container ID: ${containerId}. Expected format: GTM-XXXXXXX`,
        );
      }
      return;
    }

    if (
      document.querySelector(
        `[data-google-tag-manager="${normalizedContainerId}"]`,
      )
    ) {
      return;
    }

    const dataLayers = window as unknown as Record<
      string,
      unknown[] | undefined
    >;
    dataLayers[dataLayerName] ??= [];
    dataLayers[dataLayerName]?.push({
      "gtm.start": Date.now(),
      event: "gtm.js",
    });

    const script = document.createElement("script");
    script.async = true;
    script.dataset.googleTagManager = normalizedContainerId;
    script.src = getGoogleTagManagerScriptUrl(
      normalizedContainerId,
      dataLayerName,
    );
    const firstScript = document.getElementsByTagName("script")[0];
    if (firstScript?.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript);
    } else {
      document.head.appendChild(script);
    }
  }, [containerId, dataLayerName, enabled, normalizedContainerId]);

  if (!enabled || !normalizedContainerId) {
    return null;
  }

  return (
    <noscript>
      <iframe
        height="0"
        src={getGoogleTagManagerNoScriptUrl(
          normalizedContainerId,
          dataLayerName,
        )}
        style={{ display: "none", visibility: "hidden" }}
        title="Google Tag Manager"
        width="0"
      />
    </noscript>
  );
}
