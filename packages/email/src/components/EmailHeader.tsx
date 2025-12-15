import { Column, Img, Row, Section, Text } from "@react-email/components";
import type { BrandConfig } from "../types/brand";
import { defaultBrandConfig } from "../types/brand";

export interface EmailHeaderProps {
  /** Brand configuration */
  brand?: Partial<BrandConfig>;
}

/**
 * Reusable header block for all transactional emails.
 * Displays logo and brand name based on configuration.
 */
export function EmailHeader({ brand = {} }: EmailHeaderProps) {
  const config = { ...defaultBrandConfig, ...brand };

  return (
    <Section style={headerSection}>
      <Row>
        <Column align="center">
          <Img
            src={config.logoUrl}
            width={config.logoWidth || 56}
            height={config.logoHeight || 56}
            alt={config.logoAlt || config.name}
            style={logo}
          />
        </Column>
      </Row>
      <Row>
        <Column align="center">
          <Text style={brandName}>{config.name.toUpperCase()}</Text>
          {config.tagline && <Text style={brandTagline}>{config.tagline}</Text>}
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
  color: "#18181b",
  fontSize: "14px",
  fontWeight: "800",
  letterSpacing: "0.12em",
  textTransform: "uppercase" as const,
  margin: "16px 0 0 0",
};

const brandTagline = {
  color: "#71717a",
  fontSize: "12px",
  margin: "2px 0 0 0",
};

export default EmailHeader;
