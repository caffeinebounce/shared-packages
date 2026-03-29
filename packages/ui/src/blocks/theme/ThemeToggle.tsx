"use client";

import { type LucideIcon, Monitor, Moon, Sun } from "lucide-react";
import { useTheme as useNextTheme } from "next-themes";
import { type ReactNode, useCallback, useEffect, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../components/ui/tooltip";
import { KeyboardShortcut } from "../keyboard/KeyboardShortcut";

export type ThemeMode = "light" | "dark";
type ThemeSelection = ThemeMode | "system";

function getResolvedTheme(resolvedTheme: string | undefined): ThemeMode {
  return resolvedTheme === "dark" ? "dark" : "light";
}

function getDocumentTheme(): ThemeMode {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function prefersDarkMode(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

function getCurrentSelection(
  includeSystem: boolean,
  theme: string | undefined,
  resolvedTheme: ThemeMode,
): ThemeSelection {
  if (includeSystem && theme === "system") {
    return "system";
  }

  return resolvedTheme;
}

function getNextThemeSelection(
  currentSelection: ThemeSelection,
  includeSystem: boolean,
): ThemeSelection {
  if (!includeSystem) {
    return currentSelection === "dark" ? "light" : "dark";
  }

  if (currentSelection === "light") {
    return "dark";
  }

  if (currentSelection === "dark") {
    return "system";
  }

  return "light";
}

function getThemeToggleLabel(nextTheme: ThemeSelection): string {
  return `Switch theme to ${nextTheme}`;
}

function getThemeIcon(nextTheme: ThemeSelection): LucideIcon {
  if (nextTheme === "light") {
    return Sun;
  }

  if (nextTheme === "dark") {
    return Moon;
  }

  return Monitor;
}

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
  /** Whether to include a system theme option in the toggle cycle */
  includeSystem?: boolean;
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
 * Theme toggle component with light/dark switching, plus optional system mode.
 * Uses next-themes for persistence and DOM updates.
 */
export function ThemeToggle({
  includeSystem = false,
  shortcut,
  shortcutDisplay,
  showShortcut = true,
  shortcutsVisible,
  tooltip,
  className,
}: ThemeToggleProps) {
  const { resolvedTheme, setTheme, theme } = useNextTheme();
  const [mounted, setMounted] = useState(false);

  // Determine if shortcut should be shown: shortcutsVisible overrides showShortcut when provided
  const shouldShowShortcut = shortcutsVisible ?? showShortcut;

  const renderedTheme: ThemeMode =
    mounted && typeof document !== "undefined"
      ? getDocumentTheme()
      : getResolvedTheme(resolvedTheme);

  const currentSelection = getCurrentSelection(
    includeSystem,
    theme,
    renderedTheme,
  );
  const nextTheme = getNextThemeSelection(currentSelection, includeSystem);
  const ariaLabel = getThemeToggleLabel(nextTheme);
  const Icon = getThemeIcon(nextTheme);

  const toggleTheme = useCallback(() => {
    // Primary path: next-themes
    setTheme(nextTheme);

    // Fallback path: direct DOM/localStorage update to avoid no-op toggles
    if (typeof document !== "undefined") {
      const nextIsDark =
        nextTheme === "dark" || (nextTheme === "system" && prefersDarkMode());

      document.documentElement.classList.toggle("dark", nextIsDark);
      try {
        localStorage.setItem("theme", nextTheme);
      } catch {
        // Ignore storage errors
      }
    }
  }, [nextTheme, setTheme]);

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

  // Prevent hydration mismatch by not rendering the interactive state until mounted.
  // The opt-in system variant uses a neutral placeholder icon before mount so it
  // doesn't guess whether the saved preference was explicitly "system".
  if (!mounted) {
    if (includeSystem) {
      return (
        <button
          type="button"
          className={`inline-flex h-8 w-8 items-center justify-center text-icon transition-colors ${className ?? ""}`}
          aria-label="Toggle theme"
        >
          <Monitor className="h-4 w-4" />
        </button>
      );
    }

    return (
      <button
        type="button"
        className={`inline-flex h-8 w-8 items-center justify-center text-icon transition-colors ${className ?? ""}`}
        aria-label="Toggle theme"
      >
        <div className="relative h-4 w-4">
          <Sun className="absolute inset-0 h-4 w-4 opacity-0 dark:opacity-100 transition-opacity duration-150" />
          <Moon className="absolute inset-0 h-4 w-4 opacity-100 dark:opacity-0 transition-opacity duration-150" />
        </div>
      </button>
    );
  }

  const tooltipContent = tooltip ?? (
    <>
      <span>{ariaLabel}</span>
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
          aria-label={ariaLabel}
        >
          <Icon className="h-4 w-4 transition-transform duration-150 group-hover:rotate-12" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom">{tooltipContent}</TooltipContent>
    </Tooltip>
  );
}
