import { Column, Img, Row, Section, Text } from "@react-email/components";

interface EmailHeaderProps {
  /** URL to the logo image */
  logoUrl?: string;
  /** Logo width in pixels */
  logoWidth?: number;
  /** Logo height in pixels */
  logoHeight?: number;
  /** Alt text for the logo */
  logoAlt?: string;
}

/**
 * Reusable header block for all transactional emails.
 * Displays the Capital Compass logo and brand name.
 */
export function EmailHeader({
  logoUrl = "https://compass.thecapitalcollective.org/logo.png",
  logoWidth = 56,
  logoHeight = 56,
  logoAlt = "Capital Collective",
}: EmailHeaderProps) {
  return (
    <Section style={headerSection}>
      <Row>
        <Column align="center">
          <Img
            src={logoUrl}
            width={logoWidth}
            height={logoHeight}
            alt={logoAlt}
            style={logo}
          />
        </Column>
      </Row>
      <Row>
        <Column align="center">
          <Text style={brandName}>CAPITAL COMPASS</Text>
          <Text style={brandTagline}>by The Capital Collective</Text>
        </Column>
      </Row>
    </Section>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const headerSection = {
  textAlign: "center" as const,
  marginBottom: "8px",
};

const logo = {
  margin: "0 auto",
  borderRadius: "12px",
};

const brandName = {
  color: "#18181b", // zinc-900
  fontSize: "14px",
  fontWeight: "800",
  letterSpacing: "0.12em",
  textTransform: "uppercase" as const,
  margin: "16px 0 0 0",
};

const brandTagline = {
  color: "#71717a", // zinc-500
  fontSize: "12px",
  margin: "2px 0 0 0",
};

export default EmailHeader;
