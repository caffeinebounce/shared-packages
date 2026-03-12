import { Text } from "@react-email/components";
import { ThemedButton } from "../components/ThemedButton";
import { ThemedLayout } from "../components/ThemedLayout";
import type { EmailThemeConfig } from "../index";
import type { EmailThemeTokens } from "../tokens";

interface MagicLinkProps {
  magicLinkUrl: string;
  tokens: EmailThemeTokens;
  config: EmailThemeConfig;
}

export function MagicLink({ magicLinkUrl, tokens, config }: MagicLinkProps) {
  const headingStyle = {
    color: tokens.headingColor,
    fontSize: "24px",
    fontWeight: "700",
    margin: "0 0 16px",
    fontFamily: tokens.fontFamily,
  };
  const bodyStyle = {
    color: tokens.bodyColor,
    fontSize: "16px",
    lineHeight: "1.6",
    margin: "0 0 8px",
    fontFamily: tokens.fontFamily,
  };

  return (
    <ThemedLayout
      tokens={tokens}
      config={config}
      category="transactional"
      preview={`Your ${config.appName} login link`}
    >
      <Text style={headingStyle}>Your login link</Text>
      <Text style={bodyStyle}>
        Click below to sign in to {config.appName}. This link expires in 1 hour.
      </Text>
      <Text
        style={{ ...bodyStyle, fontSize: "14px", color: tokens.mutedColor }}
      >
        If you didn't request this, you can safely ignore this email.
      </Text>
      <ThemedButton url={magicLinkUrl} text="Sign in" tokens={tokens} />
    </ThemedLayout>
  );
}
