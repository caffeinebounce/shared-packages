"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme as useNextTheme } from "next-themes";
import { type ReactNode, useCallback, useEffect, useState } from "react";
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
  const [mounted, setMounted] = useState(false);

  // Determine if shortcut should be shown: shortcutsVisible overrides showShortcut when provided
  const shouldShowShortcut = shortcutsVisible ?? showShortcut;

  const theme: ThemeMode =
    mounted && typeof document !== "undefined"
      ? document.documentElement.classList.contains("dark")
        ? "dark"
        : "light"
      : resolvedTheme === "dark"
        ? "dark"
        : "light";

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

  useEffect(() => {
    setMounted(true);
  }, []);

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

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <button
        type="button"
        className={`inline-flex h-8 w-8 items-center justify-center text-icon transition-colors ${className ?? ""}`}
        aria-label="Toggle theme"
      >
        <div className="h-4 w-4" />
      </button>
    );
  }

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
            <Sun
              className={`absolute inset-0 h-4 w-4 transition-all duration-150 group-hover:rotate-12 ${
                theme === "dark"
                  ? "rotate-0 scale-100 opacity-100"
                  : "rotate-90 scale-0 opacity-0"
              }`}
            />
            <Moon
              className={`absolute inset-0 h-4 w-4 transition-all duration-150 group-hover:-rotate-12 ${
                theme === "light"
                  ? "rotate-0 scale-100 opacity-100"
                  : "-rotate-90 scale-0 opacity-0"
              }`}
            />
          </div>
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom">{tooltipContent}</TooltipContent>
    </Tooltip>
  );
}
