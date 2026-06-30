import type { EmailThemeTokens } from "./tokens";

/**
 * The Capital Collective email theme — light, premium, cream-paper feel.
 *
 * These are baked-hex copies of the tcc-ui brand tokens (email clients can't
 * resolve CSS custom properties or load webfonts reliably). Keep in sync with
 * repos/tcc-ui/src/styles/tokens.css.
 */
export const tccThemeTokens: EmailThemeTokens = {
  background: "#f7f3ec", // --tcc-c-cream (paper canvas)
  contentBackground: "#ffffff",
  boxRadius: "12px",
  headingColor: "#223a5e", // --tcc-c-navy
  bodyColor: "#172235", // --tcc-c-ink
  mutedColor: "#48586d", // --tcc-c-soft-ink
  footerColor: "#738096", // --tcc-c-muted
  fontFamily:
    "'IBM Plex Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  buttonBg: "#223a5e", // navy primary
  buttonColor: "#ffffff",
  buttonRadius: "8px",
  buttonPadding: "14px 32px",
  accentColor: "#8fc85a", // --tcc-c-green
  iconBg: "#edf6e5", // --tcc-c-green-soft
  iconRadius: "14px",
  dividerColor: "#d8e1dc", // --tcc-c-border
};
