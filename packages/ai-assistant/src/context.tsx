"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type {
  AiAssistantConfig,
  AiAssistantContextValue,
  AiCapability,
  AiMessage,
} from "./types";

const AiAssistantContext = createContext<AiAssistantContextValue | null>(null);

export function useAiAssistant(): AiAssistantContextValue {
  const context = useContext(AiAssistantContext);
  if (!context) {
    throw new Error(
      "useAiAssistant must be used within an AiAssistantProvider",
    );
  }
  return context;
}

interface AiAssistantProviderProps {
  children: React.ReactNode;
  config?: Partial<AiAssistantConfig>;
}

export function AiAssistantProvider({
  children,
  config,
}: AiAssistantProviderProps) {
  const [isOpen, setIsOpen] = useState(config?.defaultOpen ?? false);
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [capabilities, setCapabilities] = useState<AiCapability[]>(
    config?.capabilities ?? [],
  );
  const [activeCapabilityId, setActiveCapabilityId] = useState<string | null>(
    config?.defaultCapability ?? null,
  );
  // TODO: Implement processing state management
  const [isProcessing, _setIsProcessing] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  const addMessage = useCallback(
    (message: Omit<AiMessage, "id" | "timestamp">) => {
      const newMessage: AiMessage = {
        ...message,
        id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, newMessage]);
    },
    [],
  );

  const clearMessages = useCallback(() => setMessages([]), []);

  const activeCapability = useMemo(
    () => capabilities.find((c) => c.id === activeCapabilityId) ?? null,
    [capabilities, activeCapabilityId],
  );

  const setActiveCapability = useCallback((id: string) => {
    setActiveCapabilityId(id);
  }, []);

  const registerCapability = useCallback((capability: AiCapability) => {
    setCapabilities((prev) => {
      // Replace if exists, otherwise add
      const exists = prev.some((c) => c.id === capability.id);
      if (exists) {
        return prev.map((c) => (c.id === capability.id ? capability : c));
      }
      return [...prev, capability];
    });
  }, []);

  const unregisterCapability = useCallback((id: string) => {
    setCapabilities((prev) => prev.filter((c) => c.id !== id));
    setActiveCapabilityId((current) => (current === id ? null : current));
  }, []);

  const value = useMemo<AiAssistantContextValue>(
    () => ({
      isOpen,
      open,
      close,
      toggle,
      messages,
      addMessage,
      clearMessages,
      activeCapability,
      setActiveCapability,
      capabilities,
      registerCapability,
      unregisterCapability,
      isProcessing,
    }),
    [
      isOpen,
      open,
      close,
      toggle,
      messages,
      addMessage,
      clearMessages,
      activeCapability,
      setActiveCapability,
      capabilities,
      registerCapability,
      unregisterCapability,
      isProcessing,
    ],
  );

  return (
    <AiAssistantContext.Provider value={value}>
      {children}
    </AiAssistantContext.Provider>
  );
}
