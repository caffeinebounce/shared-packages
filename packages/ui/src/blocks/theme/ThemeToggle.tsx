"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme as useNextTheme } from "next-themes";
import { type ReactNode, useCallback, useEffect } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../components/ui/tooltip";
import { KeyboardShortcut } from "../keyboard/KeyboardShortcut";

export type ThemeMode = "light" | "dark";

/**
 * Hook to get the current theme.
 * Uses next-themes under the hood.
 */
export function useTheme(): ThemeMode {
  const { resolvedTheme } = useNextTheme();
  if (typeof document !== "undefined") {
    return document.documentElement.classList.contains("dark")
      ? "dark"
      : "light";
  }
  return (resolvedTheme === "dark" ? "dark" : "light") as ThemeMode;
}

export interface ShortcutDefinition {
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
}

export interface ThemeToggleProps {
  /** Keyboard shortcut definition */
  shortcut?: ShortcutDefinition;
  /** Display string for the keyboard shortcut (e.g., "⌃⇧L") */
  shortcutDisplay?: string;
  /** Whether to show the keyboard shortcut in tooltip (default: true, can be overridden by shortcutsVisible) */
  showShortcut?: boolean;
  /** Whether shortcuts are visible based on user preference (overrides showShortcut when provided) */
  shortcutsVisible?: boolean;
  /** Custom tooltip content (overrides default) */
  tooltip?: ReactNode;
  /** Class name for styling */
  className?: string;
}

/**
 * Check if a keyboard event matches a shortcut definition
 */
function matchesShortcut(
  event: KeyboardEvent,
  shortcut: ShortcutDefinition,
): boolean {
  const ctrlMatch = shortcut.ctrl ? event.ctrlKey : !event.ctrlKey;
  const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
  const altMatch = shortcut.alt ? event.altKey : !event.altKey;
  const metaMatch = shortcut.meta ? event.metaKey : !event.metaKey;
  const keyMatch = event.key === shortcut.key;

  return ctrlMatch && shiftMatch && altMatch && metaMatch && keyMatch;
}

/**
 * Theme toggle component with light/dark mode switching.
 * Uses next-themes for persistence and DOM updates.
 */
export function ThemeToggle({
  shortcut,
  shortcutDisplay,
  showShortcut = true,
  shortcutsVisible,
  tooltip,
  className,
}: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useNextTheme();
  // Determine if shortcut should be shown: shortcutsVisible overrides showShortcut when provided
  const shouldShowShortcut = shortcutsVisible ?? showShortcut;

  const toggleTheme = useCallback(() => {
    const currentlyDark =
      typeof document !== "undefined" &&
      document.documentElement.classList.contains("dark");
    const nextTheme: ThemeMode = currentlyDark ? "light" : "dark";

    // Primary path: next-themes
    setTheme(nextTheme);

    // Fallback path: direct DOM/localStorage update to avoid no-op toggles
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", nextTheme === "dark");
      try {
        localStorage.setItem("theme", nextTheme);
      } catch {
        // Ignore storage errors
      }
    }
  }, [setTheme]);

  // Keyboard shortcut to toggle theme
  useEffect(() => {
    if (!shortcut) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (matchesShortcut(e, shortcut)) {
        e.preventDefault();
        toggleTheme();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcut, toggleTheme]);

  // Render eagerly with resolved theme to avoid layout shift.
  // suppressHydrationWarning on the icon container handles any
  // server/client mismatch (dark-mode class may differ).

  const tooltipContent = tooltip ?? (
    <>
      <span>Toggle theme</span>
      {shouldShowShortcut && shortcutDisplay && (
        <KeyboardShortcut className="ml-2 text-xs">
          {shortcutDisplay}
        </KeyboardShortcut>
      )}
    </>
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={toggleTheme}
          className={`group inline-flex h-8 w-8 items-center justify-center text-icon hover:text-icon-hover transition-colors ${className ?? ""}`}
          aria-label="Toggle theme"
        >
          <div className="relative h-4 w-4">
            {/* Sun shows in dark mode (click to go light). CSS-driven to avoid flash. */}
            <Sun
              className="absolute inset-0 h-4 w-4 transition-all duration-150 group-hover:rotate-12 rotate-90 scale-0 opacity-0 dark:rotate-0 dark:scale-100 dark:opacity-100"
            />
            {/* Moon shows in light mode (click to go dark). CSS-driven to avoid flash. */}
            <Moon
              className="absolute inset-0 h-4 w-4 transition-all duration-150 group-hover:-rotate-12 rotate-0 scale-100 opacity-100 dark:-rotate-90 dark:scale-0 dark:opacity-0"
            />
          </div>
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom">{tooltipContent}</TooltipContent>
    </Tooltip>
  );
}
