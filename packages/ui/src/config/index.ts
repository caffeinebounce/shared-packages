/**
 * Theme Configuration Exports
 *
 * Re-exports all theme configuration for easy imports.
 */

export {
  type Animation,
  animation,
  type BorderRadius,
  type Breakpoints,
  borderRadius,
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
// Theme system types and configurations
export type {
  BadgeShape,
  BadgeSize,
  BuiltInThemeName,
  ButtonCorners,
  ButtonHoverEffect,
  CardBorder,
  CardElevation,
  ColorScheme,
  InputVariant,
  ProductThemeConfig,
  Theme as ThemeConfig,
  ThemeColors,
  ThemeFonts,
  ThemeName,
} from "./themes/types";
