import { Body, Container, Head, Html, Preview } from "@react-email/components";
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
  /** Override logo mode for this specific email */
  logoMode?: "square" | "full";
}

export function ThemedLayout({
  tokens,
  config,
  category,
  preview,
  children,
  logoMode,
  email,
}: ThemedLayoutProps) {
  const isLight = tokens.background !== "#000000";

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
        {/* Table wrapper for min-height — email clients ignore min-height on divs */}
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
          <tr>
            <td
              align="center"
              valign="middle"
              style={{ padding: isLight ? "40px 20px" : "60px 20px" }}
            >
              <Container
                style={{
                  margin: "0 auto",
                  maxWidth: "560px",
                }}
              >
                <div
                  style={{
                    backgroundColor: tokens.contentBackground,
                    borderRadius: isLight ? "8px" : "0px",
                    padding: "40px 40px 32px",
                  }}
                >
                  <ThemedHeader
                    tokens={tokens}
                    config={config}
                    logoMode={logoMode}
                  />
                  {children}
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
