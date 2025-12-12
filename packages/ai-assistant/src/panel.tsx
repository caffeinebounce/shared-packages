"use client";

import { Button, Input } from "@caffeinebounce/ui";
import { Globe, Loader2, Send, Sparkles, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useAiAssistant } from "./context";

interface AiAssistantPanelProps {
  /** Position on screen */
  position?: "bottom-right" | "bottom-left";
}

/** Disabled state panel - shows "Coming Soon" */
function DisabledPanel({
  position,
}: {
  position: "bottom-right" | "bottom-left";
}) {
  const [mounted, setMounted] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const positionStyle =
    position === "bottom-right" ? { right: 24 } : { left: 24 };

  return createPortal(
    <div
      style={{
        position: "fixed",
        bottom: 24,
        zIndex: 9999,
        ...positionStyle,
      }}
      className="relative"
    >
      <button
        type="button"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground shadow-lg cursor-not-allowed opacity-60"
        aria-label="AI Assistant - Coming Soon"
      >
        <Sparkles className="h-5 w-5" />
      </button>
      {showTooltip && (
        <div className="absolute bottom-14 right-0 whitespace-nowrap rounded-md bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md border border-border">
          Coming Soon
        </div>
      )}
    </div>,
    document.body,
  );
}

/** Enabled state panel - full AI assistant functionality */
function EnabledPanel({
  position,
}: {
  position: "bottom-right" | "bottom-left";
}) {
  const {
    isOpen,
    open,
    close,
    messages,
    addMessage,
    activeCapability,
    capabilities,
    setActiveCapability,
  } = useAiAssistant();

  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const positionStyle =
    position === "bottom-right" ? { right: 24 } : { left: 24 };

  useEffect(() => {
    setMounted(true);
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: messages.length triggers scroll
  useEffect(() => {
    scrollToBottom();
  }, [messages.length, scrollToBottom]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (activeCapability && messages.length === 0) {
      addMessage({
        role: "assistant",
        content: `Hi! I can help you with ${activeCapability.name.toLowerCase()}. ${activeCapability.description}`,
      });
    }
  }, [activeCapability, messages.length, addMessage]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!input.trim() || isSubmitting || !activeCapability) return;

    const userInput = input.trim();
    setInput("");
    setIsSubmitting(true);

    addMessage({
      role: "user",
      content: userInput,
    });

    try {
      const result = await activeCapability.onSubmit(userInput);
      addMessage({
        role: "assistant",
        content: result.message,
      });
    } catch (error) {
      addMessage({
        role: "assistant",
        content:
          error instanceof Error
            ? error.message
            : "Sorry, something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) return null;

  const baseStyle: React.CSSProperties = {
    position: "fixed",
    bottom: 24,
    zIndex: 9999,
    ...positionStyle,
  };

  const content = isOpen ? (
    <div
      data-ai-assistant
      style={baseStyle}
      className="flex w-80 flex-col overflow-hidden rounded-xl border border-border bg-background shadow-2xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-muted/50 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-medium">AI Assistant</h3>
            {activeCapability && (
              <p className="text-xs text-muted-foreground">
                {activeCapability.name}
              </p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => close()}
          className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          aria-label="Close AI Assistant"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Capability selector (if multiple) */}
      {capabilities.length > 1 && (
        <div className="border-b border-border px-3 py-2">
          <div className="flex gap-1 overflow-x-auto">
            {capabilities.map((cap) => (
              <button
                key={cap.id}
                type="button"
                onClick={() => setActiveCapability(cap.id)}
                className={`whitespace-nowrap rounded-md px-2 py-1 text-xs transition-colors ${
                  activeCapability?.id === cap.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
              >
                {cap.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-64">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              {message.isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  {message.content}
                </span>
              ) : (
                message.content
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {activeCapability && (
        <form onSubmit={handleSubmit} className="border-t border-border p-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Globe className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={inputRef}
                type="text"
                placeholder={activeCapability.placeholder}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="h-9 pl-8 pr-3 text-sm"
                disabled={isSubmitting}
              />
            </div>
            <Button
              type="submit"
              size="sm"
              className="h-9 w-9 p-0"
              disabled={isSubmitting || !input.trim()}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
      )}

      {/* No capability selected */}
      {!activeCapability && capabilities.length === 0 && (
        <div className="p-4 text-center text-sm text-muted-foreground">
          No AI capabilities available in this context.
        </div>
      )}
    </div>
  ) : (
    <button
      type="button"
      data-ai-assistant
      onClick={() => open()}
      style={baseStyle}
      className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      aria-label="Open AI Assistant"
    >
      <Sparkles className="h-5 w-5" />
    </button>
  );

  return createPortal(content, document.body);
}

export function AiAssistantPanel({
  position = "bottom-right",
}: AiAssistantPanelProps) {
  const isEnabled = process.env.NEXT_PUBLIC_AI_ASSISTANT_ENABLED === "true";

  if (!isEnabled) {
    return <DisabledPanel position={position} />;
  }

  return <EnabledPanel position={position} />;
}
