/**
 * Theme Configuration Exports
 *
 * Re-exports all theme configuration for easy imports.
 */

export {
  type Animation,
  animation,
  type BorderRadius,
  type BrandDefaults,
  type BrandVariables,
  type Breakpoints,
  borderRadius,
  brandDefaults,
  brandVariables,
  breakpoints,
  type Layout,
  layout,
  type Shadows,
  type Spacing,
  shadows,
  spacing,
  type Theme,
  type Typography,
  theme,
  typography,
  type ZIndex,
  zIndex,
} from "./theme";
export {
  colorfulTheme,
  darkTheme,
  defaultThemes,
  deuteranopiaTheme,
  getColorScheme,
  getDefaultTheme,
  highContrastDarkTheme,
  highContrastTheme,
  lightTheme,
  protanopiaTheme,
  tritanopiaTheme,
} from "./themes";
export {
  compassThemeConfig,
  zenbidThemeConfig,
} from "./themes/products";
/**
 * Theme system types and configurations.
 *
 * NOTE: There are two "Theme" types with different purposes:
 *
 * - `Theme` (from config/theme.ts): The existing theme configuration object
 *   containing layout, typography, spacing, border radius, etc. design tokens.
 *   Used for general styling constants.
 *
 * - `ThemeConfig` (from config/themes/types.ts, aliased from Theme): The new
 *   theme definition containing colors, name, colorScheme, and display properties
 *   for the multi-theme system. Used by ThemeProvider for theme switching.
 */
// Note: Component variant types (BadgeShape, BadgeSize, ButtonCorners, ButtonHoverEffect,
// CardBorder, CardElevation, InputVariant) are exported from their respective component
// files, not from here, to avoid duplicate exports.
export type {
  BuiltInThemeName,
  ColorScheme,
  ProductThemeConfig,
  Theme as ThemeConfig,
  ThemeColors,
  ThemeFonts,
  ThemeName,
} from "./themes/types";
