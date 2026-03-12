import { Text } from "@react-email/components";
import { ThemedButton } from "../components/ThemedButton";
import { ThemedLayout } from "../components/ThemedLayout";
import type { EmailThemeConfig } from "../index";
import type { EmailThemeTokens } from "../tokens";

interface AccountApprovedProps {
  name?: string;
  ctaUrl?: string;
  ctaText?: string;
  tokens: EmailThemeTokens;
  config: EmailThemeConfig;
}

export function AccountApproved({
  name,
  ctaUrl,
  ctaText,
  tokens,
  config,
}: AccountApprovedProps) {
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
      preview="Your account has been approved"
    >
      <Text style={headingStyle}>Your account has been approved</Text>
      <Text style={bodyStyle}>
        {name ? `Hi ${name}, ` : ""}You now have full access to {config.appName}
        . Get started by clicking below.
      </Text>
      <ThemedButton
        url={ctaUrl || config.siteUrl}
        text={ctaText || "Get started"}
        tokens={tokens}
      />
    </ThemedLayout>
  );
}
