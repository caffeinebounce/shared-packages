"use client";

import { useEffect, useRef } from "react";

/**
 * Keyboard shortcut definition
 */
export interface KeyboardShortcutDefinition {
  /** Key to press (case-sensitive for letters) */
  key: string;
  /** Require Ctrl/Cmd key */
  ctrl?: boolean;
  /** Require Shift key */
  shift?: boolean;
  /** Require Alt/Option key */
  alt?: boolean;
  /** Require Meta/Cmd key (Mac) */
  meta?: boolean;
  /** Whether the shortcut is currently enabled */
  enabled?: boolean;
}

/**
 * Options for the useKeyboardShortcut hook
 */
export interface UseKeyboardShortcutOptions {
  /** Whether the shortcut is enabled (default: true) */
  enabled?: boolean;
  /** Target element to attach listener to (default: document) */
  target?: HTMLElement | Document | null;
  /** Event phase to use (default: false for bubble phase) */
  capture?: boolean;
  /** Prevent default browser behavior when shortcut is triggered */
  preventDefault?: boolean;
  /** Stop event propagation when shortcut is triggered */
  stopPropagation?: boolean;
}

/**
 * Check if a keyboard event matches a shortcut definition.
 * Uses boolean logic: `shortcut.ctrl ? event.ctrlKey : !event.ctrlKey`
 *
 * @param event - The keyboard event
 * @param shortcut - The shortcut definition to match against
 * @returns Whether the event matches the shortcut
 */
export function matchesShortcut(
  event: KeyboardEvent,
  shortcut: KeyboardShortcutDefinition,
): boolean {
  if (shortcut.enabled === false) return false;

  const ctrlMatch = shortcut.ctrl ? event.ctrlKey : !event.ctrlKey;
  const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
  const altMatch = shortcut.alt ? event.altKey : !event.altKey;
  const metaMatch = shortcut.meta ? event.metaKey : !event.metaKey;
  const keyMatch = event.key === shortcut.key;

  return ctrlMatch && shiftMatch && altMatch && metaMatch && keyMatch;
}

/**
 * Hook for handling keyboard shortcuts with SSR safety.
 * Automatically manages event listeners and cleanup.
 *
 * @param shortcut - The keyboard shortcut definition
 * @param callback - Function to call when shortcut is triggered
 * @param options - Additional options for the shortcut
 *
 * @example
 * ```tsx
 * // Simple shortcut
 * useKeyboardShortcut(
 *   { key: "k", ctrl: true },
 *   () => setSearchOpen(true)
 * );
 *
 * // With options
 * useKeyboardShortcut(
 *   { key: "Escape" },
 *   () => setModalOpen(false),
 *   { preventDefault: true, enabled: modalOpen }
 * );
 *
 * // Multiple modifier keys
 * useKeyboardShortcut(
 *   { key: "L", ctrl: true, shift: true },
 *   () => toggleTheme()
 * );
 * ```
 */
export function useKeyboardShortcut(
  shortcut: KeyboardShortcutDefinition,
  callback: (event: KeyboardEvent) => void,
  options: UseKeyboardShortcutOptions = {},
): void {
  const {
    enabled = true,
    target = typeof document !== "undefined" ? document : null,
    capture = false,
    preventDefault = false,
    stopPropagation = false,
  } = options;

  // Use ref to avoid re-creating listener on every callback change
  const callbackRef = useRef(callback);

  // Update ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    // SSR safety check
    if (typeof window === "undefined") {
      return;
    }

    // Don't attach listener if disabled or no target
    if (!enabled || !target) {
      return;
    }

    const handler = (event: Event) => {
      const keyboardEvent = event as KeyboardEvent;
      // Ignore if typing in input/textarea/contenteditable
      const target = keyboardEvent.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      if (matchesShortcut(keyboardEvent, shortcut)) {
        if (preventDefault) {
          keyboardEvent.preventDefault();
        }
        if (stopPropagation) {
          keyboardEvent.stopPropagation();
        }
        callbackRef.current(keyboardEvent);
      }
    };

    target.addEventListener("keydown", handler, capture);

    return () => {
      target.removeEventListener("keydown", handler, capture);
    };
  }, [shortcut, enabled, target, capture, preventDefault, stopPropagation]);
}

/**
 * Format a shortcut for display (e.g., "Ctrl+Shift+L" or "⌘K").
 * Uses platform-specific symbols when available.
 *
 * @param shortcut - The shortcut to format
 * @param usePlatformSymbols - Whether to use platform symbols (⌘, ⌥, ⇧, ⌃) on Mac
 * @returns Formatted shortcut string
 *
 * @example
 * ```tsx
 * formatShortcut({ key: "K", ctrl: true }) // "Ctrl+K"
 * formatShortcut({ key: "K", meta: true }, true) // "⌘K" on Mac
 * formatShortcut({ key: "L", ctrl: true, shift: true }) // "Ctrl+Shift+L"
 * ```
 */
export function formatShortcut(
  shortcut: KeyboardShortcutDefinition,
  usePlatformSymbols = false,
): string {
  const parts: string[] = [];
  // Check for Mac using userAgent as platform is deprecated
  const isMac =
    typeof navigator !== "undefined" &&
    /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);

  if (shortcut.ctrl) {
    parts.push(usePlatformSymbols && isMac ? "⌃" : "Ctrl");
  }
  if (shortcut.alt) {
    parts.push(usePlatformSymbols && isMac ? "⌥" : "Alt");
  }
  if (shortcut.shift) {
    parts.push(usePlatformSymbols && isMac ? "⇧" : "Shift");
  }
  if (shortcut.meta) {
    parts.push(usePlatformSymbols && isMac ? "⌘" : "Meta");
  }

  // Only uppercase single character keys, preserve special key names
  const keyDisplay =
    shortcut.key.length === 1 ? shortcut.key.toUpperCase() : shortcut.key;
  parts.push(keyDisplay);

  return parts.join(usePlatformSymbols ? "" : "+");
}
