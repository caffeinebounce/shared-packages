"use client";

import { Moon, Sun } from "lucide-react";
import { type ReactNode, useCallback, useEffect, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../components/ui/tooltip";
import { KeyboardShortcut } from "../keyboard/KeyboardShortcut";

export type ThemeMode = "light" | "dark";

/**
 * Hook to get the current theme from the document.
 * Returns "dark" if the document has the "dark" class, otherwise "light".
 * Automatically updates when the theme changes.
 */
export function useTheme(): ThemeMode {
  const [theme, setTheme] = useState<ThemeMode>("light");

  useEffect(() => {
    // Initial check
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");

    // Listen for changes via MutationObserver
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "class"
        ) {
          const isDark = document.documentElement.classList.contains("dark");
          setTheme(isDark ? "dark" : "light");
        }
      }
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => observer.disconnect();
  }, []);

  return theme;
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
  /** Initial theme (defaults to 'system') */
  defaultTheme?: "light" | "dark" | "system";
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
 * Features system preference detection, localStorage persistence, and optional keyboard shortcut.
 */
export function ThemeToggle({
  defaultTheme = "system",
  shortcut,
  shortcutDisplay,
  showShortcut = true,
  shortcutsVisible,
  tooltip,
  className,
}: ThemeToggleProps) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  // Determine if shortcut should be shown: shortcutsVisible overrides showShortcut when provided
  const shouldShowShortcut = shortcutsVisible ?? showShortcut;

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const newTheme = prev === "light" ? "dark" : "light";
      localStorage.setItem("theme", newTheme);
      document.documentElement.classList.toggle("dark", newTheme === "dark");
      return newTheme;
    });
  }, []);

  useEffect(() => {
    setMounted(true);
    // Check for saved theme or system preference
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;

    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    } else if (
      defaultTheme === "dark" ||
      (defaultTheme === "system" && systemPrefersDark)
    ) {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    }
  }, [defaultTheme]);

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
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
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
