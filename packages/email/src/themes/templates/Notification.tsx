import { Text } from "@react-email/components";
import { ThemedButton } from "../components/ThemedButton";
import { ThemedLayout } from "../components/ThemedLayout";
import type { EmailThemeConfig } from "../index";
import type { EmailThemeTokens } from "../tokens";

interface NotificationProps {
  title: string;
  body: string;
  ctaUrl?: string;
  ctaText?: string;
  email?: string;
  logoMode?: "square" | "full";
  tokens: EmailThemeTokens;
  config: EmailThemeConfig;
}

export function Notification({
  title,
  body,
  ctaUrl,
  ctaText,
  email,
  logoMode,
  tokens,
  config,
}: NotificationProps) {
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
      category="marketing"
      preview={title}
      email={email}
      logoMode={logoMode}
    >
      <Text style={headingStyle}>{title}</Text>
      <Text style={bodyStyle}>{body}</Text>
      {ctaUrl && ctaText && (
        <ThemedButton url={ctaUrl} text={ctaText} tokens={tokens} />
      )}
    </ThemedLayout>
  );
}
