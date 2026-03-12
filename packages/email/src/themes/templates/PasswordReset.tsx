import { Text } from "@react-email/components";
import { ThemedButton } from "../components/ThemedButton";
import { ThemedLayout } from "../components/ThemedLayout";
import type { EmailThemeConfig } from "../index";
import type { EmailThemeTokens } from "../tokens";

interface PasswordResetProps {
  resetUrl: string;
  logoMode?: "square" | "full";
  tokens: EmailThemeTokens;
  config: EmailThemeConfig;
}

export function PasswordReset({
  resetUrl,
  logoMode,
  tokens,
  config,
}: PasswordResetProps) {
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
      preview="Reset your password"
    >
      <Text style={headingStyle}>Reset your password</Text>
      <Text style={bodyStyle}>
        We received a request to reset the password for your {config.appName}{" "}
        account. Click the button below to choose a new password.
      </Text>
      <Text
        style={{ ...bodyStyle, fontSize: "14px", color: tokens.mutedColor }}
      >
        If you didn't request this, you can safely ignore this email.
      </Text>
      <ThemedButton url={resetUrl} text="Reset password" tokens={tokens} />
    </ThemedLayout>
  );
}
