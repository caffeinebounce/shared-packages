/**
 * Theme Registry
 *
 * Default theme definitions for the theming system.
 * Products can extend or override these themes.
 */

// Re-export base themes
export {
  colorfulTheme,
  darkTheme,
  deuteranopiaTheme,
  highContrastDarkTheme,
  highContrastTheme,
  lightTheme,
  protanopiaTheme,
  tritanopiaTheme,
} from "./base";
// Re-export product configurations
export {
  compassThemeConfig,
  getProductThemeConfig,
  productThemeConfigs,
  zenbidThemeConfig,
} from "./products";
export * from "./types";

import {
  colorfulTheme,
  darkTheme,
  deuteranopiaTheme,
  highContrastDarkTheme,
  highContrastTheme,
  lightTheme,
  protanopiaTheme,
  tritanopiaTheme,
} from "./base";
import type { Theme } from "./types";

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
