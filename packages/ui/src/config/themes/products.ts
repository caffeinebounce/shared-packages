/**
 * Product Theme Definitions
 *
 * Pre-configured theme sets for each product.
 * Products can import and use these directly or as starting points.
 */

import {
  darkTheme,
  deuteranopiaTheme,
  highContrastDarkTheme,
  highContrastTheme,
  lightTheme,
  protanopiaTheme,
  tritanopiaTheme,
} from "./base";
import type { ProductThemeConfig, Theme, ThemeColors } from "./types";

// =============================================================================
// COMPASS THEMES
// =============================================================================

/**
 * Compass brand colors (teal/green)
 */
const compassPrimaryLight = "oklch(0.55 0.145 170)";
const compassPrimaryDark = "oklch(0.65 0.145 170)";

/**
 * Create Compass-branded light colors
 */
function createCompassLightColors(base: ThemeColors): ThemeColors {
  return {
    ...base,
    primary: compassPrimaryLight,
    primaryForeground: "oklch(1 0 0)",
    sidebarPrimary: compassPrimaryLight,
    sidebarPrimaryForeground: "oklch(1 0 0)",
  };
}

/**
 * Create Compass-branded dark colors
 */
function createCompassDarkColors(base: ThemeColors): ThemeColors {
  return {
    ...base,
    primary: compassPrimaryDark,
    primaryForeground: "oklch(1 0 0)",
    sidebarPrimary: compassPrimaryDark,
    sidebarPrimaryForeground: "oklch(1 0 0)",
  };
}

/**
 * Compass light theme
 */
export const compassLightTheme: Theme = {
  name: "light",
  displayName: "Light",
  colorScheme: "light",
  colors: createCompassLightColors(lightTheme.colors),
  radius: "0.625rem",
  shadowIntensity: 1,
};

/**
 * Compass dark theme
 */
export const compassDarkTheme: Theme = {
  name: "dark",
  displayName: "Dark",
  colorScheme: "dark",
  colors: createCompassDarkColors(darkTheme.colors),
  radius: "0.625rem",
  shadowIntensity: 1,
};

/**
 * Compass high contrast theme
 */
export const compassHighContrastTheme: Theme = {
  ...highContrastTheme,
  colors: {
    ...highContrastTheme.colors,
    primary: "oklch(0.3 0.1 170)",
    primaryForeground: "oklch(1 0 0)",
  },
};

/**
 * Complete Compass theme configuration
 */
export const compassThemeConfig: ProductThemeConfig = {
  productId: "compass",
  productName: "Compass",
  defaultTheme: "light",
  themes: {
    light: compassLightTheme,
    dark: compassDarkTheme,
    colorful: {
      name: "colorful",
      displayName: "Colorful",
      colorScheme: "light",
      colors: {
        ...createCompassLightColors(lightTheme.colors),
        accent: "oklch(0.85 0.15 140)",
        accentForeground: "oklch(0.2 0 0)",
      },
      radius: "0.75rem",
      shadowIntensity: 1.2,
    },
    "high-contrast": compassHighContrastTheme,
    "high-contrast-dark": {
      ...highContrastDarkTheme,
      colors: {
        ...highContrastDarkTheme.colors,
        primary: "oklch(0.8 0.12 170)",
        primaryForeground: "oklch(0 0 0)",
      },
    },
    deuteranopia: {
      ...deuteranopiaTheme,
      colors: createCompassLightColors(deuteranopiaTheme.colors),
    },
    protanopia: {
      ...protanopiaTheme,
      colors: createCompassLightColors(protanopiaTheme.colors),
    },
    tritanopia: {
      ...tritanopiaTheme,
      colors: createCompassLightColors(tritanopiaTheme.colors),
    },
  },
  fonts: {
    // Compass uses Geist fonts (default)
    body: "var(--font-geist-sans)",
    headers: "var(--font-geist-sans)",
    mono: "var(--font-geist-mono)",
    headingWeight: "600",
    headingTracking: "-0.025em",
  },
};

// =============================================================================
// ZENBID THEMES
// =============================================================================

/**
 * ZenBid brand colors (blue/teal)
 */
const zenbidPrimaryLight = "oklch(0.55 0.2 220)";
const zenbidPrimaryDark = "oklch(0.65 0.2 220)";

/**
 * Create ZenBid-branded light colors
 */
function createZenbidLightColors(base: ThemeColors): ThemeColors {
  return {
    ...base,
    primary: zenbidPrimaryLight,
    primaryForeground: "oklch(1 0 0)",
    sidebarPrimary: zenbidPrimaryLight,
    sidebarPrimaryForeground: "oklch(1 0 0)",
  };
}

/**
 * Create ZenBid-branded dark colors
 */
function createZenbidDarkColors(base: ThemeColors): ThemeColors {
  return {
    ...base,
    primary: zenbidPrimaryDark,
    primaryForeground: "oklch(1 0 0)",
    sidebarPrimary: zenbidPrimaryDark,
    sidebarPrimaryForeground: "oklch(1 0 0)",
  };
}

/**
 * ZenBid light theme
 */
export const zenbidLightTheme: Theme = {
  name: "light",
  displayName: "Light",
  colorScheme: "light",
  colors: createZenbidLightColors(lightTheme.colors),
  radius: "0.625rem",
  shadowIntensity: 1,
};

/**
 * ZenBid dark theme
 */
export const zenbidDarkTheme: Theme = {
  name: "dark",
  displayName: "Dark",
  colorScheme: "dark",
  colors: createZenbidDarkColors(darkTheme.colors),
  radius: "0.625rem",
  shadowIntensity: 1,
};

/**
 * ZenBid high contrast theme
 */
export const zenbidHighContrastTheme: Theme = {
  ...highContrastTheme,
  colors: {
    ...highContrastTheme.colors,
    primary: "oklch(0.35 0.15 220)",
    primaryForeground: "oklch(1 0 0)",
  },
};

/**
 * Complete ZenBid theme configuration
 */
export const zenbidThemeConfig: ProductThemeConfig = {
  productId: "zenbid",
  productName: "ZenBid",
  defaultTheme: "light",
  themes: {
    light: zenbidLightTheme,
    dark: zenbidDarkTheme,
    colorful: {
      name: "colorful",
      displayName: "Colorful",
      colorScheme: "light",
      colors: {
        ...createZenbidLightColors(lightTheme.colors),
        accent: "oklch(0.85 0.15 280)",
        accentForeground: "oklch(0.2 0 0)",
      },
      radius: "0.75rem",
      shadowIntensity: 1.2,
    },
    "high-contrast": zenbidHighContrastTheme,
    "high-contrast-dark": {
      ...highContrastDarkTheme,
      colors: {
        ...highContrastDarkTheme.colors,
        primary: "oklch(0.8 0.15 220)",
        primaryForeground: "oklch(0 0 0)",
      },
    },
    deuteranopia: {
      ...deuteranopiaTheme,
      colors: createZenbidLightColors(deuteranopiaTheme.colors),
    },
    protanopia: {
      ...protanopiaTheme,
      colors: createZenbidLightColors(protanopiaTheme.colors),
    },
    tritanopia: {
      ...tritanopiaTheme,
      colors: createZenbidLightColors(tritanopiaTheme.colors),
    },
  },
  fonts: {
    // ZenBid uses Geist fonts (default)
    body: "var(--font-geist-sans)",
    headers: "var(--font-geist-sans)",
    mono: "var(--font-geist-mono)",
    headingWeight: "600",
    headingTracking: "-0.025em",
  },
};

// =============================================================================
// PRODUCT REGISTRY
// =============================================================================

/**
 * All product theme configurations
 */
export const productThemeConfigs: Record<string, ProductThemeConfig> = {
  compass: compassThemeConfig,
  zenbid: zenbidThemeConfig,
};

/**
 * Get theme configuration for a product
 */
export function getProductThemeConfig(
  productId: string,
): ProductThemeConfig | undefined {
  return productThemeConfigs[productId];
}
