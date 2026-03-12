import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Preview,
} from "@react-email/components";
import type { ReactNode } from "react";
import type { EmailCategory, EmailThemeConfig } from "../index";
import type { EmailThemeTokens } from "../tokens";
import { ThemedFooter } from "./ThemedFooter";
import { ThemedHeader } from "./ThemedHeader";

interface ThemedLayoutProps {
  tokens: EmailThemeTokens;
  config: EmailThemeConfig;
  category: EmailCategory;
  preview: string;
  children: ReactNode;
  email?: string;
  logoMode?: "square" | "full";
  logoAlign?: "left" | "center" | "right";
}

export function ThemedLayout({
  tokens,
  config,
  category,
  preview,
  children,
  logoMode,
  logoAlign,
  email,
}: ThemedLayoutProps) {
  const isLight = tokens.background !== "#000000";
  const isDark = !isLight;

  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body
        style={{
          backgroundColor: tokens.background,
          fontFamily: tokens.fontFamily,
          margin: "0",
          padding: "0",
        }}
      >
        <table
          role="presentation"
          width="100%"
          cellPadding={0}
          cellSpacing={0}
          style={{
            backgroundColor: tokens.background,
            minHeight: "600px",
            height: "100%",
          }}
        >
          {/* Accent stripe at top */}
          {isDark && (
            <tr>
              <td style={{ padding: "0" }}>
                <div
                  style={{
                    height: "3px",
                    backgroundColor: tokens.accentColor,
                    margin: "0",
                  }}
                />
              </td>
            </tr>
          )}

          {/* Single content row with card */}
          <tr style={{ height: "100%" }}>
            <td
              align="center"
              valign="top"
              style={{ padding: isDark ? "48px 20px 40px" : "40px 20px" }}
            >
              <Container style={{ margin: "0 auto", maxWidth: "520px" }}>
                {/* Card */}
                <div
                  style={{
                    backgroundColor: tokens.contentBackground,
                    borderRadius: isDark ? "12px" : "8px",
                    padding: isDark ? "48px 44px 40px" : "40px 40px 32px",
                    ...(isDark
                      ? { border: `1px solid ${tokens.dividerColor}` }
                      : {}),
                  }}
                >
                  {/* Logo */}
                  <ThemedHeader
                    tokens={tokens}
                    config={config}
                    logoMode={logoMode}
                    logoAlign={logoAlign}
                  />

                  {/* Subtle divider after logo */}
                  <Hr
                    style={{
                      borderColor: tokens.dividerColor,
                      borderWidth: "1px 0 0 0",
                      margin: "0 0 32px 0",
                    }}
                  />

                  {/* Content */}
                  {children}
                </div>

                {/* Footer outside card, below */}
                <div style={{ padding: "32px 4px 0" }}>
                  <ThemedFooter
                    tokens={tokens}
                    config={config}
                    category={category}
                    email={email}
                  />
                </div>
              </Container>
            </td>
          </tr>
        </table>
      </Body>
    </Html>
  );
}
