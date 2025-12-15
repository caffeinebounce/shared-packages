/**
 * Brand configuration for email templates.
 * All brand-specific values should be passed through this interface.
 */
export interface BrandConfig {
  /** App/product name (e.g., "Capital Compass") */
  name: string;
  /** Tagline shown under logo (e.g., "by The Capital Collective") */
  tagline?: string;
  /** Company/organization name for footer */
  companyName: string;
  /** URL to the logo image */
  logoUrl: string;
  /** Logo width in pixels */
  logoWidth?: number;
  /** Logo height in pixels */
  logoHeight?: number;
  /** Alt text for logo */
  logoAlt?: string;
  /** Primary brand color (used for buttons, accents) */
  primaryColor?: string;
  /** Base URL for the app (e.g., "https://myapp.com") */
  baseUrl: string;
  /** Support email address */
  supportEmail?: string;
  /** Physical address (required for email compliance) */
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  /** Social media links */
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
  /** Copyright year (defaults to current year) */
  copyrightYear?: number;
}

/**
 * Default brand configuration for development/preview.
 * Apps should override this with their own configuration.
 */
export const defaultBrandConfig: BrandConfig = {
  name: "Acme App",
  tagline: "by Acme Corp",
  companyName: "Acme Corporation",
  logoUrl: "https://placehold.co/56x56/18181b/ffffff?text=A",
  logoWidth: 56,
  logoHeight: 56,
  logoAlt: "Acme Logo",
  primaryColor: "#18181b",
  baseUrl: "https://example.com",
  supportEmail: "support@example.com",
  address: {
    street: "123 Main Street",
    city: "San Francisco",
    state: "CA",
    zip: "94102",
    country: "United States",
  },
  copyrightYear: new Date().getFullYear(),
};

/**
 * Color palette for email templates.
 * Can be customized per-brand or use defaults.
 */
export interface ColorPalette {
  /** Background color for email body */
  background: string;
  /** Card/container background */
  surface: string;
  /** Primary text color */
  text: string;
  /** Secondary/muted text */
  textMuted: string;
  /** Light/subtle text */
  textLight: string;
  /** Border color */
  border: string;
  /** Link color */
  link: string;
  /** Primary button background */
  buttonBg: string;
  /** Primary button text */
  buttonText: string;
}

export const defaultColors: ColorPalette = {
  background: "#f4f4f5", // zinc-100
  surface: "#ffffff",
  text: "#3f3f46", // zinc-700
  textMuted: "#71717a", // zinc-500
  textLight: "#a1a1aa", // zinc-400
  border: "#e4e4e7", // zinc-200
  link: "#3b82f6", // blue-500
  buttonBg: "#047857", // emerald-700 - works on light/dark backgrounds
  buttonText: "#ffffff",
};

/**
 * Creates a color palette with primary color override.
 */
export function createColorPalette(primaryColor?: string): ColorPalette {
  if (!primaryColor) return defaultColors;

  return {
    ...defaultColors,
    buttonBg: primaryColor,
  };
}
