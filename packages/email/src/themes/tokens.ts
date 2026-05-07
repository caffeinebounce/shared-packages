/**
 * Email theme token system.
 * All visual design decisions are expressed as tokens.
 */
export interface EmailThemeTokens {
  // Layout
  background: string;
  contentBackground: string;
  boxRadius: string; // "0px" sharp, "8px" subtle, "12px" rounded

  // Typography
  headingColor: string;
  bodyColor: string;
  mutedColor: string;
  footerColor: string;
  fontFamily: string;

  // Buttons
  buttonBg: string;
  buttonColor: string;
  buttonRadius: string; // "0px" sharp, "80px" pill, "6px" rounded
  buttonPadding: string;

  // Accent
  accentColor: string;

  // Icon/Logo area
  iconBg: string;
  iconRadius: string;

  // Dividers
  dividerColor: string;
}
