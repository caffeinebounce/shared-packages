import { Link, Section, Text } from "@react-email/components";
import {
  buildUnsubscribeUrlFromConfig,
  generateUnsubscribeToken,
} from "../../unsubscribe";
import type { EmailCategory, EmailThemeConfig } from "../index";
import type { EmailThemeTokens } from "../tokens";

interface ThemedFooterProps {
  tokens: EmailThemeTokens;
  config: EmailThemeConfig;
  category: EmailCategory;
  email?: string;
}

export function ThemedFooter({
  tokens,
  config,
  category,
  email = "",
}: ThemedFooterProps) {
  const year = new Date().getFullYear();

  const footerTextStyle = {
    color: tokens.footerColor,
    fontSize: "11px",
    lineHeight: "1.4",
    margin: "4px 0",
    textAlign: "center" as const,
    fontFamily: tokens.fontFamily,
  };

  const linkStyle = {
    color: tokens.footerColor,
    textDecoration: "underline",
  };

  return (
    <Section style={{ textAlign: "center" }}>
      <Text style={footerTextStyle}>
        © {year} {config.companyName}
      </Text>
      <Text style={footerTextStyle}>{config.address}</Text>

      {category === "transactional" && (
        <Text style={footerTextStyle}>
          This is a transactional email related to your account at{" "}
          {config.appName}.
        </Text>
      )}

      {category === "marketing" && email && (
        <Text style={footerTextStyle}>
          <Link
            href={buildUnsubscribeUrlFromConfig(
              config,
              email,
              generateUnsubscribeToken({
                email,
                secret: config.unsubscribeSecret,
              }),
            )}
            style={linkStyle}
          >
            Unsubscribe
          </Link>
          {config.emailPreferencesUrl && (
            <>
              {" · "}
              <Link href={config.emailPreferencesUrl} style={linkStyle}>
                Email preferences
              </Link>
            </>
          )}
        </Text>
      )}

      {category === "marketing" && !email && (
        <Text style={footerTextStyle}>
          <Link
            href={config.unsubscribeUrl || `${config.siteUrl}/unsubscribe`}
            style={linkStyle}
          >
            Unsubscribe
          </Link>
          {config.emailPreferencesUrl && (
            <>
              {" · "}
              <Link href={config.emailPreferencesUrl} style={linkStyle}>
                Email preferences
              </Link>
            </>
          )}
        </Text>
      )}
    </Section>
  );
}
