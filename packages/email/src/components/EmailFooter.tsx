import { Img, Link, Section, Text } from "@react-email/components";
import type { BrandConfig } from "../types/brand";
import { defaultBrandConfig } from "../types/brand";

export interface EmailFooterProps {
  /** Brand configuration */
  brand?: Partial<BrandConfig>;
  /** Additional footer text (e.g., reason for receiving email) */
  reasonText?: string;
}

// Social media icons (inline SVG data URIs for email compatibility)
const icons = {
  website:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%2371717a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Cpath d='M2 12h20'/%3E%3Cpath d='M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z'/%3E%3C/svg%3E",
  linkedin:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='%2371717a'%3E%3Cpath d='M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z'/%3E%3C/svg%3E",
  twitter:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='%2371717a'%3E%3Cpath d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z'/%3E%3C/svg%3E",
  github:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='%2371717a'%3E%3Cpath d='M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z'/%3E%3C/svg%3E",
};

/**
 * Reusable footer block for all transactional emails.
 * Shows social icons, copyright, address (required for compliance).
 */
export function EmailFooter({ brand = {}, reasonText }: EmailFooterProps) {
  const config = { ...defaultBrandConfig, ...brand };
  const year = config.copyrightYear || new Date().getFullYear();

  // Format address
  const addressText = config.address
    ? `${config.address.street}, ${config.address.city} ${config.address.state} ${config.address.zip}, ${config.address.country}`
    : null;

  return (
    <Section style={footer}>
      {/* Social Links as Icons */}
      {config.socialLinks && (
        <Text style={socialContainer}>
          {config.socialLinks.website && (
            <Link href={config.socialLinks.website} style={iconLink}>
              <Img src={icons.website} width="20" height="20" alt="Website" style={iconStyle} />
            </Link>
          )}
          {config.socialLinks.twitter && (
            <Link href={config.socialLinks.twitter} style={iconLink}>
              <Img src={icons.twitter} width="20" height="20" alt="Twitter" style={iconStyle} />
            </Link>
          )}
          {config.socialLinks.linkedin && (
            <Link href={config.socialLinks.linkedin} style={iconLink}>
              <Img src={icons.linkedin} width="20" height="20" alt="LinkedIn" style={iconStyle} />
            </Link>
          )}
          {config.socialLinks.github && (
            <Link href={config.socialLinks.github} style={iconLink}>
              <Img src={icons.github} width="20" height="20" alt="GitHub" style={iconStyle} />
            </Link>
          )}
        </Text>
      )}

      {/* Copyright */}
      <Text style={footerText}>
        © {year} {config.companyName}. All rights reserved.
      </Text>

      {/* Physical Address (required for email compliance) */}
      {addressText && <Text style={footerText}>{addressText}</Text>}

      {/* Reason for receiving */}
      {reasonText && <Text style={footerText}>{reasonText}</Text>}
    </Section>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const footer = {
  borderTop: "1px solid #e4e4e7",
  marginTop: "32px",
  paddingTop: "24px",
  textAlign: "center" as const,
};

const socialContainer = {
  margin: "0 0 16px 0",
  textAlign: "center" as const,
};

const iconLink = {
  display: "inline-block",
  marginRight: "12px",
};

const iconStyle = {
  display: "inline-block",
  verticalAlign: "middle",
};

const footerText = {
  color: "#a1a1aa",
  fontSize: "12px",
  margin: "8px 0",
};

export default EmailFooter;
