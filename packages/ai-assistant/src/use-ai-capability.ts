"use client";

import { useEffect } from "react";
import { useAiAssistant } from "./context";
import type { AiCapability } from "./types";

interface UseAiCapabilityOptions {
  /** Auto-activate this capability when registered */
  autoActivate?: boolean;
}

/**
 * Hook to register an AI capability from a component.
 * The capability will be automatically unregistered when the component unmounts.
 */
export function useAiCapability(
  capability: AiCapability,
  options: UseAiCapabilityOptions = {},
) {
  const { registerCapability, unregisterCapability, setActiveCapability } =
    useAiAssistant();

  useEffect(() => {
    registerCapability(capability);

    if (options.autoActivate) {
      setActiveCapability(capability.id);
    }

    return () => {
      unregisterCapability(capability.id);
    };
  }, [
    capability,
    registerCapability,
    unregisterCapability,
    setActiveCapability,
    options.autoActivate,
  ]);
}
