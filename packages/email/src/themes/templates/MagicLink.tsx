import { Text } from "@react-email/components";
import { ThemedButton } from "../components/ThemedButton";
import { ThemedLayout } from "../components/ThemedLayout";
import type { EmailThemeConfig } from "../index";
import type { EmailThemeTokens } from "../tokens";
import { createThemedTextStyles } from "./styles";

interface MagicLinkProps {
  magicLinkUrl: string;
  logoMode?: "square" | "full";
  tokens: EmailThemeTokens;
  config: EmailThemeConfig;
}

export function MagicLink({
  magicLinkUrl,
  logoMode,
  tokens,
  config,
}: MagicLinkProps) {
  const { headingStyle, bodyStyle, mutedBodyStyle } =
    createThemedTextStyles(tokens);

  return (
    <ThemedLayout
      tokens={tokens}
      config={config}
      category="transactional"
      logoMode={logoMode}
      preview={`Your ${config.appName} login link`}
    >
      <Text style={headingStyle}>Your login link</Text>
      <Text style={bodyStyle}>
        Click below to sign in to {config.appName}. This link expires in 1 hour.
      </Text>
      <Text style={mutedBodyStyle}>
        If you didn't request this, you can safely ignore this email.
      </Text>
      <ThemedButton url={magicLinkUrl} text="Sign in" tokens={tokens} />
    </ThemedLayout>
  );
}
