"use client";

import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  type ColorScheme,
  defaultThemes,
  getColorScheme,
  SYSTEM_THEME_KEY,
  THEME_STORAGE_KEY,
  type Theme,
  type ThemeContextValue,
  type ThemeName,
} from "../../config/themes";

// =============================================================================
// CONTEXT
// =============================================================================

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// =============================================================================
// PROVIDER PROPS
// =============================================================================

export interface ThemeProviderProps {
  /** Child components */
  children: ReactNode;

  /** Default theme when no preference is saved (default: "light") */
  defaultTheme?: ThemeName;

  /** Whether to respect system color scheme preference (default: true) */
  enableSystem?: boolean;

  /** Custom themes to merge with defaults */
  themes?: Record<string, Theme>;

  /** Storage key for theme preference (default: "theme") */
  storageKey?: string;

  /** Attribute to set on html element (default: "class" for backward compat) */
  attribute?: "class" | "data-theme";

  /** Disable all transitions during theme switch to prevent flicker */
  disableTransitionOnChange?: boolean;
}

// =============================================================================
// PROVIDER COMPONENT
// =============================================================================

/**
 * ThemeProvider - Provides theme context and manages theme state.
 *
 * Features:
 * - System preference detection
 * - localStorage persistence
 * - Backward compatible with `.dark` class pattern
 * - Supports new `data-theme` attribute
 *
 * @example
 * // Basic usage (backward compatible)
 * <ThemeProvider defaultTheme="system">
 *   <App />
 * </ThemeProvider>
 *
 * @example
 * // With custom themes and data-theme attribute
 * <ThemeProvider
 *   themes={productThemes}
 *   attribute="data-theme"
 *   defaultTheme="light"
 * >
 *   <App />
 * </ThemeProvider>
 */
export function ThemeProvider({
  children,
  defaultTheme = "light",
  enableSystem = true,
  themes: customThemes,
  storageKey = THEME_STORAGE_KEY,
  attribute = "class",
  disableTransitionOnChange = false,
}: ThemeProviderProps) {
  // Merge custom themes with defaults
  const allThemes = useMemo(
    () => ({ ...defaultThemes, ...customThemes }),
    [customThemes],
  );

  const [theme, setThemeState] = useState<ThemeName>(() => {
    // Don't access localStorage during SSR
    if (typeof window === "undefined") {
      return defaultTheme;
    }

    const stored = localStorage.getItem(storageKey);
    const isSystem = localStorage.getItem(SYSTEM_THEME_KEY) === "true";

    if (isSystem && enableSystem) {
      return "system";
    }

    // Note: "system" is a valid ThemeName but doesn't exist in allThemes.
    // It's a special value that tells the provider to follow system preferences.
    // We check for it explicitly above rather than looking it up in allThemes.
    if (stored && stored in allThemes) {
      return stored as ThemeName;
    }

    return defaultTheme;
  });

  const [isSystemTheme, setIsSystemTheme] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(SYSTEM_THEME_KEY) === "true";
  });

  // Resolve the actual theme (handles "system" value)
  const resolvedThemeName = useMemo(() => {
    if (theme === "system" && enableSystem && typeof window !== "undefined") {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      return prefersDark ? "dark" : "light";
    }
    return theme;
  }, [theme, enableSystem]);

  const resolvedTheme = allThemes[resolvedThemeName];
  const colorScheme = getColorScheme(resolvedThemeName);

  // Apply theme to document
  const applyTheme = useCallback(
    (themeName: ThemeName) => {
      // SSR guard - only run on client
      if (typeof window === "undefined") return;

      const root = document.documentElement;
      const resolvedName =
        themeName === "system"
          ? window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light"
          : themeName;

      const scheme = getColorScheme(resolvedName);

      // Optionally disable transitions during theme change
      if (disableTransitionOnChange) {
        root.style.setProperty("transition", "none");
      }

      // Apply using the specified attribute
      if (attribute === "class") {
        // Backward compatible: use .dark class
        if (scheme === "dark") {
          root.classList.add("dark");
        } else {
          root.classList.remove("dark");
        }
      } else {
        // New pattern: use data-theme attribute
        root.setAttribute("data-theme", resolvedName);

        // Also set class for backward compatibility with existing CSS
        if (scheme === "dark") {
          root.classList.add("dark");
        } else {
          root.classList.remove("dark");
        }
      }

      // Set color-scheme for browser UI
      root.style.colorScheme = scheme;

      // Re-enable transitions after a frame
      if (disableTransitionOnChange) {
        requestAnimationFrame(() => {
          root.style.removeProperty("transition");
        });
      }
    },
    [attribute, disableTransitionOnChange],
  );

  // Set theme and persist to storage
  const setTheme = useCallback(
    (newTheme: ThemeName) => {
      // SSR guard - only run on client
      if (typeof window === "undefined") return;

      setThemeState(newTheme);

      if (newTheme === "system") {
        localStorage.setItem(SYSTEM_THEME_KEY, "true");
        localStorage.removeItem(storageKey);
        setIsSystemTheme(true);
      } else {
        localStorage.setItem(storageKey, newTheme);
        localStorage.removeItem(SYSTEM_THEME_KEY);
        setIsSystemTheme(false);
      }

      applyTheme(newTheme);
    },
    [storageKey, applyTheme],
  );

  // Toggle between light and dark
  const toggleTheme = useCallback(() => {
    const current = resolvedThemeName;
    const next = getColorScheme(current) === "light" ? "dark" : "light";
    setTheme(next);
  }, [resolvedThemeName, setTheme]);

  // Set to system preference
  const setSystemTheme = useCallback(() => {
    setTheme("system");
  }, [setTheme]);

  // Apply theme on mount and listen for system preference changes
  useEffect(() => {
    applyTheme(theme);

    if (enableSystem) {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

      const handleChange = () => {
        if (isSystemTheme) {
          applyTheme("system");
        }
      };

      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [theme, isSystemTheme, enableSystem, applyTheme]);

  // Listen for prefers-contrast for accessibility
  useEffect(() => {
    // SSR guard
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-contrast: more)");

    const handleContrastChange = (_e: MediaQueryListEvent) => {
      // Products can listen to this event and switch to high-contrast theme
      // For now, products can handle this if needed
    };

    mediaQuery.addEventListener("change", handleContrastChange);
    return () => mediaQuery.removeEventListener("change", handleContrastChange);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      colorScheme,
      setTheme,
      toggleTheme,
      themes: Object.keys(allThemes) as ThemeName[],
      isSystemTheme,
      setSystemTheme,
      resolvedTheme,
    }),
    [
      theme,
      colorScheme,
      setTheme,
      toggleTheme,
      allThemes,
      isSystemTheme,
      setSystemTheme,
      resolvedTheme,
    ],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

// =============================================================================
// HOOK
// =============================================================================

/**
 * useThemeContext - Access the full theme context.
 *
 * Must be used within a ThemeProvider.
 *
 * @example
 * const { theme, setTheme, toggleTheme } = useThemeContext();
 */
export function useThemeContext(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error("useThemeContext must be used within a ThemeProvider");
  }

  return context;
}

/**
 * useThemeContextOptional - Access theme context if available.
 *
 * Returns undefined if not within a ThemeProvider.
 * Useful for components that should work with or without theming.
 */
export function useThemeContextOptional(): ThemeContextValue | undefined {
  return useContext(ThemeContext);
}

// Re-export for convenience
export type { ThemeContextValue, ColorScheme, ThemeName };
