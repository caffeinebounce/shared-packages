import { Body, Container, Head, Html, Preview } from "@react-email/components";
import type { ReactNode } from "react";
import type { ColorPalette } from "../types/brand";
import { defaultColors } from "../types/brand";

export interface BaseEmailLayoutProps {
  /** Preview text shown in email clients */
  preview: string;
  /** Main content of the email */
  children: ReactNode;
  /** Color palette overrides */
  colors?: Partial<ColorPalette>;
  /** Container max width */
  maxWidth?: string;
}

/**
 * Base layout wrapper for all transactional emails.
 * Provides consistent styling and structure.
 */
export function BaseEmailLayout({
  preview,
  children,
  colors = {},
  maxWidth = "560px",
}: BaseEmailLayoutProps) {
  const palette = { ...defaultColors, ...colors };

  // Button styling using the brand's button color from the palette
  const buttonStyles = `
    .email-button {
      background-color: ${palette.buttonBg} !important;
      color: ${palette.buttonText} !important;
    }
  `;

  return (
    <Html>
      <Head>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: CSS injection is required for email client styling */}
        <style dangerouslySetInnerHTML={{ __html: buttonStyles }} />
      </Head>
      <Preview>{preview}</Preview>
      <Body style={{ ...main, backgroundColor: palette.background }}>
        <Container
          style={{ ...container, maxWidth, backgroundColor: palette.surface }}
        >
          {children}
        </Container>
      </Body>
    </Html>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const main = {
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "40px 20px",
  borderRadius: "8px",
};

export default BaseEmailLayout;
