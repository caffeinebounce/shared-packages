import { Text } from "@react-email/components";
import { ThemedLayout } from "../components/ThemedLayout";
import type { EmailThemeConfig } from "../index";
import type { EmailThemeTokens } from "../tokens";

interface WelcomeProps {
  name?: string;
  logoMode?: "square" | "full";
  tokens: EmailThemeTokens;
  config: EmailThemeConfig;
}

export function Welcome({ name, logoMode, tokens, config }: WelcomeProps) {
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

  return (
    <ThemedLayout
      tokens={tokens}
      config={config}
      category="transactional"
      logoMode={logoMode}
      preview={`Welcome to ${config.appName}`}
    >
      <Text style={headingStyle}>Welcome to {config.appName}</Text>
      <Text style={bodyStyle}>
        {name ? `Hi ${name}, ` : ""}Your email has been confirmed. Your account
        is pending approval and you'll hear from us shortly.
      </Text>
    </ThemedLayout>
  );
}
