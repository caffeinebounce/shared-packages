/**
 * Theme Type Definitions
 *
 * Comprehensive theming system that supports:
 * - Brand differentiation between products (Compass, ZenBid)
 * - Multiple themes per product (light, dark, high-contrast, colorblind)
 * - Custom typography per product
 * - Component-level customization
 */

// =============================================================================
// COLOR SCHEME TYPES
// =============================================================================

/** Base color scheme - light or dark */
export type ColorScheme = "light" | "dark";

/** Built-in theme names */
export type BuiltInThemeName =
  | "light"
  | "dark"
  | "colorful"
  | "high-contrast"
  | "high-contrast-dark"
  | "deuteranopia"
  | "protanopia"
  | "tritanopia";

/** Theme name can be built-in or custom */
export type ThemeName = BuiltInThemeName | (string & {});

// =============================================================================
// THEME COLORS
// =============================================================================

/**
 * Complete color palette for a theme.
 * All values should be OKLCH color strings.
 */
export interface ThemeColors {
  /** Page/app background */
  background: string;
  /** Default text color */
  foreground: string;

  /** Card backgrounds */
  card: string;
  cardForeground: string;

  /** Popover/dropdown backgrounds */
  popover: string;
  popoverForeground: string;

  /** Primary brand color - buttons, links, accents */
  primary: string;
  primaryForeground: string;

  /** Secondary actions, less prominent UI */
  secondary: string;
  secondaryForeground: string;

  /** Accent color for highlights, selections */
  accent: string;
  accentForeground: string;

  /** Muted backgrounds and text */
  muted: string;
  mutedForeground: string;

  /** Destructive/danger actions */
  destructive: string;

  /** Success states */
  success: string;

  /** Warning states */
  warning: string;

  /** Borders */
  border: string;

  /** Input borders */
  input: string;

  /** Focus ring color */
  ring: string;

  /** Sidebar colors (optional, falls back to main colors) */
  sidebar?: string;
  sidebarForeground?: string;
  sidebarPrimary?: string;
  sidebarPrimaryForeground?: string;
  sidebarAccent?: string;
  sidebarAccentForeground?: string;
  sidebarBorder?: string;
  sidebarRing?: string;

  /** Chart colors for data visualizations */
  chart1?: string;
  chart2?: string;
  chart3?: string;
  chart4?: string;
  chart5?: string;
}

// =============================================================================
// THEME DEFINITION
// =============================================================================

/**
 * Complete theme definition.
 * Each theme contains all styling information needed to render the UI.
 */
export interface Theme {
  /** Theme identifier (e.g., "light", "dark", "high-contrast") */
  name: ThemeName;

  /** Display name for UI (e.g., "Light Mode", "High Contrast") */
  displayName: string;

  /** Base color scheme for system preference matching */
  colorScheme: ColorScheme;

  /** Complete color palette */
  colors: ThemeColors;

  /** Border radius scale base value (e.g., "0.625rem") */
  radius?: string;

  /** Shadow intensity multiplier (0.5 to 1.5, default 1) */
  shadowIntensity?: number;
}

// =============================================================================
// TYPOGRAPHY CONFIGURATION
// =============================================================================

/**
 * Typography configuration for a product.
 * Allows custom fonts per product.
 */
export interface ThemeFonts {
  /** Body text font family */
  body?: string;

  /** Header font family */
  headers?: string;

  /** Display/marketing font family */
  display?: string;

  /** Monospace font family */
  mono?: string;

  /** Header font weight (e.g., "600", "700") */
  headingWeight?: string;

  /** Header letter spacing (e.g., "-0.025em") */
  headingTracking?: string;
}

// =============================================================================
// PRODUCT THEME CONFIGURATION
// =============================================================================

/**
 * Complete theme configuration for a product.
 * Defines available themes and typography.
 */
export interface ProductThemeConfig {
  /** Product identifier (e.g., "compass", "zenbid") */
  productId: string;

  /** Display name for the product */
  productName: string;

  /** Default theme to use (must exist in themes) */
  defaultTheme: ThemeName;

  /** Available themes for this product */
  themes: Record<ThemeName, Theme>;

  /** Custom typography for this product */
  fonts?: ThemeFonts;
}

// =============================================================================
// THEME CONTEXT
// =============================================================================

/**
 * Theme context value provided to consumers.
 */
export interface ThemeContextValue {
  /** Current theme name */
  theme: ThemeName;

  /** Current color scheme (light/dark) */
  colorScheme: ColorScheme;

  /** Set the theme by name */
  setTheme: (theme: ThemeName) => void;

  /** Toggle between light and dark */
  toggleTheme: () => void;

  /** Available themes */
  themes: ThemeName[];

  /** Whether system preference is being used */
  isSystemTheme: boolean;

  /** Set to use system preference */
  setSystemTheme: () => void;

  /** Current theme definition */
  resolvedTheme: Theme | undefined;
}

// =============================================================================
// COMPONENT VARIANT PROPS
// =============================================================================

/**
 * Button hover effect variants.
 */
export type ButtonHoverEffect = "slide" | "glow" | "scale" | "none";

/**
 * Button corner variants.
 */
export type ButtonCorners = "default" | "pill" | "sharp";

/**
 * Card elevation variants.
 */
export type CardElevation = "flat" | "raised" | "floating";

/**
 * Card border variants.
 */
export type CardBorder = "default" | "subtle" | "none";

/**
 * Badge shape variants.
 */
export type BadgeShape = "pill" | "rounded" | "square";

/**
 * Badge size variants.
 */
export type BadgeSize = "sm" | "default" | "lg";

/**
 * Input style variants.
 */
export type InputVariant = "default" | "filled" | "underline";

// =============================================================================
// THEME STORAGE
// =============================================================================

/** Key for storing theme preference in localStorage */
export const THEME_STORAGE_KEY = "theme";

/** Key for storing system preference flag */
export const SYSTEM_THEME_KEY = "theme-system";
