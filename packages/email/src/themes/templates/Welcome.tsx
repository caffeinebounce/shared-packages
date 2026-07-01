import { Text } from "@react-email/components";
import { ThemedLayout } from "../components/ThemedLayout";
import type { EmailThemeConfig } from "../index";
import type { EmailThemeTokens } from "../tokens";
import { createThemedTextStyles } from "./styles";

interface WelcomeProps {
  name?: string;
  logoMode?: "square" | "full";
  tokens: EmailThemeTokens;
  config: EmailThemeConfig;
}

export function Welcome({ name, logoMode, tokens, config }: WelcomeProps) {
  const { headingStyle, bodyStyle } = createThemedTextStyles(tokens);

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
