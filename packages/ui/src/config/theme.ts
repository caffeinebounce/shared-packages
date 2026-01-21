/**
 * Centralized Theme Configuration
 *
 * This file contains all global design tokens and layout settings.
 * Import these values in components for type-safe, consistent styling.
 *
 * The values here should mirror what's in tailwind.config.ts and globals.css
 * to maintain a single source of truth.
 */

// =============================================================================
// LAYOUT
// =============================================================================

export const layout = {
  /** Maximum content width for the main app container */
  maxWidth: "1280px",
  /** Maximum width for narrow content (forms, auth pages) */
  maxWidthNarrow: "640px",
  /** Maximum width for wide content (dashboards, tables) */
  maxWidthWide: "1536px",
  /** Maximum width for full-bleed content */
  maxWidthFull: "100%",

  /** Standard horizontal padding for containers */
  containerPadding: {
    mobile: "1rem", // 16px
    tablet: "1.5rem", // 24px
    desktop: "2rem", // 32px
  },

  /** Navbar height */
  navbarHeight: "64px",

  /** Footer height */
  footerHeight: "80px",

  /** Sidebar width (for future admin/dashboard layouts) */
  sidebarWidth: "256px",
  sidebarWidthCollapsed: "64px",
} as const;

// =============================================================================
// TYPOGRAPHY
// =============================================================================

export const typography = {
  /** Font families */
  fontFamily: {
    sans: "var(--font-sans, ui-sans-serif, system-ui, sans-serif)",
    mono: "var(--font-mono, ui-monospace, monospace)",
  },

  /**
   * Font sizes with line heights
   * Format: [fontSize, lineHeight]
   */
  fontSize: {
    xs: ["0.75rem", "1rem"], // 12px / 16px
    sm: ["0.875rem", "1.25rem"], // 14px / 20px
    base: ["1rem", "1.5rem"], // 16px / 24px
    lg: ["1.125rem", "1.75rem"], // 18px / 28px
    xl: ["1.25rem", "1.75rem"], // 20px / 28px
    "2xl": ["1.5rem", "2rem"], // 24px / 32px
    "3xl": ["1.875rem", "2.25rem"], // 30px / 36px
    "4xl": ["2.25rem", "2.5rem"], // 36px / 40px
    "5xl": ["3rem", "1"], // 48px / 1
    "6xl": ["3.75rem", "1"], // 60px / 1
  },

  /** Font weights */
  fontWeight: {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },

  /**
   * Heading styles - use these for consistent heading typography
   * Each includes: fontSize, lineHeight, fontWeight, letterSpacing
   */
  headings: {
    h1: {
      fontSize: "2.25rem", // 36px
      lineHeight: "2.5rem", // 40px
      fontWeight: "700",
      letterSpacing: "-0.025em",
      // Tailwind classes equivalent
      className: "text-4xl font-bold tracking-tight",
    },
    h2: {
      fontSize: "1.875rem", // 30px
      lineHeight: "2.25rem", // 36px
      fontWeight: "600",
      letterSpacing: "-0.025em",
      className: "text-3xl font-semibold tracking-tight",
    },
    h3: {
      fontSize: "1.5rem", // 24px
      lineHeight: "2rem", // 32px
      fontWeight: "600",
      letterSpacing: "-0.025em",
      className: "text-2xl font-semibold tracking-tight",
    },
    h4: {
      fontSize: "1.25rem", // 20px
      lineHeight: "1.75rem", // 28px
      fontWeight: "600",
      letterSpacing: "0",
      className: "text-xl font-semibold",
    },
    h5: {
      fontSize: "1.125rem", // 18px
      lineHeight: "1.75rem", // 28px
      fontWeight: "600",
      letterSpacing: "0",
      className: "text-lg font-semibold",
    },
    h6: {
      fontSize: "1rem", // 16px
      lineHeight: "1.5rem", // 24px
      fontWeight: "600",
      letterSpacing: "0",
      className: "text-base font-semibold",
    },
  },

  /** Body text styles */
  body: {
    large: {
      fontSize: "1.125rem", // 18px
      lineHeight: "1.75rem", // 28px
      className: "text-lg",
    },
    default: {
      fontSize: "1rem", // 16px
      lineHeight: "1.5rem", // 24px
      className: "text-base",
    },
    small: {
      fontSize: "0.875rem", // 14px
      lineHeight: "1.25rem", // 20px
      className: "text-sm",
    },
    xs: {
      fontSize: "0.75rem", // 12px
      lineHeight: "1rem", // 16px
      className: "text-xs",
    },
  },
} as const;

// =============================================================================
// SPACING
// =============================================================================

export const spacing = {
  /** Section spacing (vertical gaps between major sections) */
  section: {
    sm: "2rem", // 32px
    md: "4rem", // 64px
    lg: "6rem", // 96px
    xl: "8rem", // 128px
  },

  /** Component spacing (gaps within components) */
  component: {
    xs: "0.25rem", // 4px
    sm: "0.5rem", // 8px
    md: "1rem", // 16px
    lg: "1.5rem", // 24px
    xl: "2rem", // 32px
  },

  /** Form element spacing */
  form: {
    gap: "1.5rem", // 24px - gap between form fields
    labelGap: "0.5rem", // 8px - gap between label and input
    groupGap: "2rem", // 32px - gap between field groups
  },
} as const;

// =============================================================================
// BREAKPOINTS
// =============================================================================

export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;

// =============================================================================
// Z-INDEX SCALE
// =============================================================================

export const zIndex = {
  dropdown: 50,
  sticky: 100,
  fixed: 200,
  modalBackdrop: 300,
  modal: 400,
  popover: 500,
  tooltip: 600,
  toast: 700,
} as const;

// =============================================================================
// ANIMATION
// =============================================================================

export const animation = {
  /** Transition durations */
  duration: {
    fast: "150ms",
    default: "200ms",
    slow: "300ms",
    slower: "500ms",
  },

  /** Easing functions */
  easing: {
    default: "cubic-bezier(0.4, 0, 0.2, 1)",
    in: "cubic-bezier(0.4, 0, 1, 1)",
    out: "cubic-bezier(0, 0, 0.2, 1)",
    inOut: "cubic-bezier(0.4, 0, 0.2, 1)",
  },
} as const;

// =============================================================================
// BORDER RADIUS
// =============================================================================

export const borderRadius = {
  none: "0",
  sm: "0.25rem", // 4px
  default: "0.5rem", // 8px
  md: "0.5rem", // 8px
  lg: "0.75rem", // 12px
  xl: "1rem", // 16px
  "2xl": "1.5rem", // 24px
  full: "9999px",
} as const;

// =============================================================================
// SHADOWS
// =============================================================================

export const shadows = {
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  default: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
} as const;

// =============================================================================
// BRAND CUSTOMIZATION (CSS Variables)
// =============================================================================

/**
 * Brand customization CSS variable names.
 * These correspond to the CSS custom properties defined in base.css.
 * Products can override these to customize their brand appearance.
 */
export const brandVariables = {
  /** Secondary brand color for highlights and gradients */
  brandAccent: "--brand-accent",
  /** Gradient start color */
  brandGradientFrom: "--brand-gradient-from",
  /** Gradient end color */
  brandGradientTo: "--brand-gradient-to",
  /** Text highlight/selection color */
  highlightColor: "--highlight-color",
  /** Shadow depth multiplier (0.5 = subtle, 1.5 = dramatic) */
  shadowIntensity: "--shadow-intensity",
  /** Spacing scale multiplier (0.875 = tighter, 1.125 = looser) */
  spacingScale: "--spacing-scale",
  /** Header font family */
  fontHeaders: "--font-headers",
  /** Display/marketing font family */
  fontDisplay: "--font-display",
  /** Header font weight */
  headingWeight: "--heading-weight",
  /** Header letter spacing */
  headingTracking: "--heading-tracking",
} as const;

/**
 * Default values for brand customization variables.
 * Products can use these as starting points when customizing.
 */
export const brandDefaults = {
  brandAccent: "var(--primary)",
  brandGradientFrom: "var(--primary)",
  brandGradientTo: "var(--brand-accent)",
  highlightColor: "oklch(0.95 0.05 90)",
  shadowIntensity: "1",
  spacingScale: "1",
  fontHeaders: "var(--font-sans)",
  fontDisplay: "var(--font-sans)",
  headingWeight: "600",
  headingTracking: "-0.025em",
} as const;

// =============================================================================
// COMBINED THEME OBJECT
// =============================================================================

export const theme = {
  layout,
  typography,
  spacing,
  breakpoints,
  zIndex,
  animation,
  borderRadius,
  shadows,
  brandVariables,
  brandDefaults,
} as const;

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type Theme = typeof theme;
export type Layout = typeof layout;
export type Typography = typeof typography;
export type Spacing = typeof spacing;
export type Breakpoints = typeof breakpoints;
export type ZIndex = typeof zIndex;
export type Animation = typeof animation;
export type BorderRadius = typeof borderRadius;
export type Shadows = typeof shadows;
export type BrandVariables = typeof brandVariables;
export type BrandDefaults = typeof brandDefaults;

// Default export
export default theme;
