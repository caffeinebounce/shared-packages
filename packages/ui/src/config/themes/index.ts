/**
 * Theme Registry
 *
 * Default theme definitions for the theming system.
 * Products can extend or override these themes.
 */

export * from "./products";
export * from "./types";

import type { Theme, ThemeColors } from "./types";

// =============================================================================
// BASE COLOR PALETTES
// =============================================================================

/**
 * Light mode base colors (neutral grayscale).
 * Used as the foundation for the light theme.
 */
const lightColors: ThemeColors = {
  background: "oklch(1 0 0)",
  foreground: "oklch(0.145 0 0)",

  card: "oklch(1 0 0)",
  cardForeground: "oklch(0.145 0 0)",

  popover: "oklch(1 0 0)",
  popoverForeground: "oklch(0.145 0 0)",

  primary: "oklch(0.205 0 0)",
  primaryForeground: "oklch(0.985 0 0)",

  secondary: "oklch(0.97 0 0)",
  secondaryForeground: "oklch(0.205 0 0)",

  accent: "oklch(0.97 0 0)",
  accentForeground: "oklch(0.205 0 0)",

  muted: "oklch(0.97 0 0)",
  mutedForeground: "oklch(0.556 0 0)",

  destructive: "oklch(0.577 0.245 27.325)",
  success: "oklch(0.527 0.154 150.069)",
  warning: "oklch(0.75 0.15 85)",

  border: "oklch(0.922 0 0)",
  input: "oklch(0.922 0 0)",
  ring: "oklch(0.708 0 0)",

  sidebar: "oklch(1 0 0)",
  sidebarForeground: "oklch(0.145 0 0)",
  sidebarPrimary: "oklch(0.205 0 0)",
  sidebarPrimaryForeground: "oklch(0.985 0 0)",
  sidebarAccent: "oklch(0.97 0 0)",
  sidebarAccentForeground: "oklch(0.205 0 0)",
  sidebarBorder: "oklch(0.922 0 0)",
  sidebarRing: "oklch(0.708 0 0)",

  chart1: "oklch(0.646 0.222 41.116)",
  chart2: "oklch(0.6 0.118 184.704)",
  chart3: "oklch(0.398 0.07 227.392)",
  chart4: "oklch(0.828 0.189 84.429)",
  chart5: "oklch(0.769 0.188 70.08)",
};

/**
 * Dark mode base colors.
 */
const darkColors: ThemeColors = {
  background: "oklch(0 0 0)",
  foreground: "oklch(1 0 0)",

  card: "oklch(0.145 0 0)",
  cardForeground: "oklch(1 0 0)",

  popover: "oklch(0.145 0 0)",
  popoverForeground: "oklch(1 0 0)",

  primary: "oklch(0.205 0 0)",
  primaryForeground: "oklch(0.985 0 0)",

  secondary: "oklch(0.205 0 0)",
  secondaryForeground: "oklch(1 0 0)",

  accent: "oklch(1 0 0 / 0.15)",
  accentForeground: "oklch(1 0 0)",

  muted: "oklch(0.205 0 0)",
  mutedForeground: "oklch(0.7 0 0)",

  destructive: "oklch(0.704 0.191 22.216)",
  success: "oklch(0.627 0.194 149.214)",
  warning: "oklch(0.8 0.15 85)",

  border: "oklch(1 0 0 / 0.15)",
  input: "oklch(1 0 0 / 0.15)",
  ring: "oklch(0.556 0 0)",

  sidebar: "oklch(0 0 0)",
  sidebarForeground: "oklch(1 0 0)",
  sidebarAccent: "oklch(1 0 0 / 0.1)",
  sidebarAccentForeground: "oklch(1 0 0)",
  sidebarBorder: "oklch(1 0 0 / 0.15)",
  sidebarRing: "oklch(0.556 0 0)",

  chart1: "oklch(0.488 0.243 264.376)",
  chart2: "oklch(0.696 0.17 162.48)",
  chart3: "oklch(0.769 0.188 70.08)",
  chart4: "oklch(0.627 0.265 303.9)",
  chart5: "oklch(0.645 0.246 16.439)",
};

// =============================================================================
// DEFAULT THEMES
// =============================================================================

/**
 * Default light theme.
 */
export const lightTheme: Theme = {
  name: "light",
  displayName: "Light",
  colorScheme: "light",
  colors: lightColors,
  radius: "0.625rem",
  shadowIntensity: 1,
};

/**
 * Default dark theme.
 */
export const darkTheme: Theme = {
  name: "dark",
  displayName: "Dark",
  colorScheme: "dark",
  colors: darkColors,
  radius: "0.625rem",
  shadowIntensity: 1,
};

/**
 * Colorful theme with vibrant, saturated colors.
 */
export const colorfulTheme: Theme = {
  name: "colorful",
  displayName: "Colorful",
  colorScheme: "light",
  colors: {
    ...lightColors,
    primary: "oklch(0.6 0.25 280)",
    primaryForeground: "oklch(1 0 0)",
    accent: "oklch(0.85 0.15 340)",
    accentForeground: "oklch(0.2 0 0)",
    success: "oklch(0.65 0.2 145)",
    destructive: "oklch(0.65 0.25 25)",
    warning: "oklch(0.8 0.18 80)",
  },
  radius: "0.75rem",
  shadowIntensity: 1.2,
};

/**
 * High contrast theme for accessibility (WCAG AAA).
 */
export const highContrastTheme: Theme = {
  name: "high-contrast",
  displayName: "High Contrast",
  colorScheme: "light",
  colors: {
    background: "oklch(1 0 0)",
    foreground: "oklch(0 0 0)",

    card: "oklch(1 0 0)",
    cardForeground: "oklch(0 0 0)",

    popover: "oklch(1 0 0)",
    popoverForeground: "oklch(0 0 0)",

    primary: "oklch(0 0 0)",
    primaryForeground: "oklch(1 0 0)",

    secondary: "oklch(0.95 0 0)",
    secondaryForeground: "oklch(0 0 0)",

    accent: "oklch(0.9 0 0)",
    accentForeground: "oklch(0 0 0)",

    muted: "oklch(0.95 0 0)",
    mutedForeground: "oklch(0.3 0 0)",

    destructive: "oklch(0.45 0.3 27)",
    success: "oklch(0.35 0.2 145)",
    warning: "oklch(0.5 0.2 85)",

    border: "oklch(0 0 0)",
    input: "oklch(0 0 0)",
    ring: "oklch(0 0 0)",
  },
  radius: "0.5rem",
  shadowIntensity: 1.5,
};

/**
 * High contrast dark theme.
 */
export const highContrastDarkTheme: Theme = {
  name: "high-contrast-dark",
  displayName: "High Contrast Dark",
  colorScheme: "dark",
  colors: {
    background: "oklch(0 0 0)",
    foreground: "oklch(1 0 0)",

    card: "oklch(0 0 0)",
    cardForeground: "oklch(1 0 0)",

    popover: "oklch(0 0 0)",
    popoverForeground: "oklch(1 0 0)",

    primary: "oklch(1 0 0)",
    primaryForeground: "oklch(0 0 0)",

    secondary: "oklch(0.15 0 0)",
    secondaryForeground: "oklch(1 0 0)",

    accent: "oklch(0.2 0 0)",
    accentForeground: "oklch(1 0 0)",

    muted: "oklch(0.15 0 0)",
    mutedForeground: "oklch(0.8 0 0)",

    destructive: "oklch(0.7 0.25 25)",
    success: "oklch(0.7 0.2 145)",
    warning: "oklch(0.8 0.2 85)",

    border: "oklch(1 0 0)",
    input: "oklch(1 0 0)",
    ring: "oklch(1 0 0)",
  },
  radius: "0.5rem",
  shadowIntensity: 1.5,
};

/**
 * Deuteranopia (red-green colorblind) accessible theme.
 * Avoids problematic red-green combinations.
 */
export const deuteranopiaTheme: Theme = {
  name: "deuteranopia",
  displayName: "Deuteranopia Safe",
  colorScheme: "light",
  colors: {
    ...lightColors,
    primary: "oklch(0.5 0.15 250)",
    primaryForeground: "oklch(1 0 0)",
    destructive: "oklch(0.5 0.2 25)",
    success: "oklch(0.5 0.15 250)",
    warning: "oklch(0.75 0.15 80)",
    chart1: "oklch(0.5 0.15 250)",
    chart2: "oklch(0.75 0.15 80)",
    chart3: "oklch(0.6 0.1 310)",
    chart4: "oklch(0.45 0.12 200)",
    chart5: "oklch(0.7 0.08 60)",
  },
};

/**
 * Protanopia (red colorblind) accessible theme.
 */
export const protanopiaTheme: Theme = {
  name: "protanopia",
  displayName: "Protanopia Safe",
  colorScheme: "light",
  colors: {
    ...lightColors,
    primary: "oklch(0.5 0.15 250)",
    primaryForeground: "oklch(1 0 0)",
    destructive: "oklch(0.5 0.2 25)",
    success: "oklch(0.5 0.15 250)",
    warning: "oklch(0.75 0.15 80)",
    chart1: "oklch(0.5 0.15 250)",
    chart2: "oklch(0.75 0.15 80)",
    chart3: "oklch(0.6 0.1 310)",
    chart4: "oklch(0.45 0.12 200)",
    chart5: "oklch(0.7 0.08 60)",
  },
};

/**
 * Tritanopia (blue-yellow colorblind) accessible theme.
 */
export const tritanopiaTheme: Theme = {
  name: "tritanopia",
  displayName: "Tritanopia Safe",
  colorScheme: "light",
  colors: {
    ...lightColors,
    primary: "oklch(0.55 0.2 10)",
    primaryForeground: "oklch(1 0 0)",
    destructive: "oklch(0.55 0.2 10)",
    success: "oklch(0.5 0.15 160)",
    warning: "oklch(0.6 0.15 40)",
    chart1: "oklch(0.55 0.2 10)",
    chart2: "oklch(0.5 0.15 160)",
    chart3: "oklch(0.6 0.15 40)",
    chart4: "oklch(0.7 0.1 320)",
    chart5: "oklch(0.5 0.12 280)",
  },
};

// =============================================================================
// THEME REGISTRY
// =============================================================================

/**
 * All default themes indexed by name.
 */
export const defaultThemes: Record<string, Theme> = {
  light: lightTheme,
  dark: darkTheme,
  colorful: colorfulTheme,
  "high-contrast": highContrastTheme,
  "high-contrast-dark": highContrastDarkTheme,
  deuteranopia: deuteranopiaTheme,
  protanopia: protanopiaTheme,
  tritanopia: tritanopiaTheme,
};

/**
 * Get a theme by name from the default themes.
 */
export function getDefaultTheme(name: string): Theme | undefined {
  return defaultThemes[name];
}

/**
 * Get the color scheme for a theme name.
 * Falls back to "light" if theme not found.
 */
export function getColorScheme(themeName: string): "light" | "dark" {
  const theme = defaultThemes[themeName];
  return theme?.colorScheme ?? "light";
}
