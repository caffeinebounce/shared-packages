import { Text } from "@react-email/components";
import { ThemedButton } from "../components/ThemedButton";
import { ThemedLayout } from "../components/ThemedLayout";
import type { EmailThemeConfig } from "../index";
import type { EmailThemeTokens } from "../tokens";

interface ConfirmationProps {
  confirmUrl: string;
  logoMode?: "square" | "full";
  tokens: EmailThemeTokens;
  config: EmailThemeConfig;
}

export function Confirmation({
  confirmUrl,
  logoMode,
  tokens,
  config,
}: ConfirmationProps) {
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
      preview={`Confirm your ${config.appName} account`}
    >
      <Text style={headingStyle}>Confirm your account</Text>
      <Text style={bodyStyle}>
        Thank you for signing up for {config.appName}. Click below to confirm
        your email address and activate your account.
      </Text>
      <ThemedButton url={confirmUrl} text="Confirm account" tokens={tokens} />
    </ThemedLayout>
  );
}
