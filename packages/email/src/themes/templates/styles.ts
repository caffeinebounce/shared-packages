import type { EmailThemeTokens } from "../tokens";

export function createThemedTextStyles(tokens: EmailThemeTokens) {
  const headingStyle = {
    color: tokens.headingColor,
    fontSize: "28px",
    fontWeight: "700",
    margin: "0 0 16px",
    fontFamily: tokens.fontFamily,
  };
  const bodyStyle = {
    color: tokens.bodyColor,
    fontSize: "16px",
    lineHeight: "1.7",
    margin: "0 0 8px",
    fontFamily: tokens.fontFamily,
  };

  return {
    headingStyle,
    bodyStyle,
    mutedBodyStyle: {
      ...bodyStyle,
      fontSize: "14px",
      color: tokens.mutedColor,
    },
  };
}
