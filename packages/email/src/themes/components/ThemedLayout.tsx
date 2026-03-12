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
          {/* Row 1: Header — pinned to top */}
          <tr>
            <td align="center" valign="top" style={{ padding: "40px 20px 0" }}>
              <Container style={{ margin: "0 auto", maxWidth: "560px" }}>
                <div style={{ padding: "0 40px" }}>
                  <ThemedHeader
                    tokens={tokens}
                    config={config}
                    logoMode={logoMode}
                    logoAlign={logoAlign}
                  />
                </div>
              </Container>
            </td>
          </tr>

          {/* Row 2: Content — vertically centered, expands to fill */}
          <tr style={{ height: "100%" }}>
            <td align="center" valign="middle" style={{ padding: "0 20px" }}>
              <Container style={{ margin: "0 auto", maxWidth: "560px" }}>
                <div
                  style={{
                    backgroundColor: tokens.contentBackground,
                    padding: "24px 40px",
                  }}
                >
                  {children}
                </div>
              </Container>
            </td>
          </tr>

          {/* Row 3: Footer — pinned to bottom */}
          <tr>
            <td
              align="center"
              valign="bottom"
              style={{ padding: "0 20px 40px" }}
            >
              <Container style={{ margin: "0 auto", maxWidth: "560px" }}>
                <div style={{ padding: "0 40px" }}>
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
