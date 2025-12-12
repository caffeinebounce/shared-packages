import { Column, Link, Row, Section, Text } from "@react-email/components";

interface UnsubscribeBlockProps {
  /** The user's email address (for identifying who to unsubscribe) */
  email?: string;
  /** Base URL for the unsubscribe endpoint */
  unsubscribeUrl?: string;
  /** Base URL for email preferences */
  preferencesUrl?: string;
  /** The reason shown for why they received this email */
  reason?: string;
}

/**
 * Reusable unsubscribe/footer block for all transactional emails.
 * Includes unsubscribe link, preferences link, and required disclosure.
 */
export function UnsubscribeBlock({
  email,
  unsubscribeUrl = "https://compass.thecapitalcollective.org/unsubscribe",
  preferencesUrl = "https://compass.thecapitalcollective.org/email-preferences",
  reason = "You received this email because you have an account on Capital Compass.",
}: UnsubscribeBlockProps) {
  // Build URLs with email parameter if provided
  const unsubscribeHref = email
    ? `${unsubscribeUrl}?email=${encodeURIComponent(email)}`
    : unsubscribeUrl;

  const preferencesHref = email
    ? `${preferencesUrl}?email=${encodeURIComponent(email)}`
    : preferencesUrl;

  return (
    <Section style={container}>
      {/* Reason for receiving email */}
      <Text style={reasonText}>{reason}</Text>

      {/* Unsubscribe and preferences links */}
      <Row>
        <Column align="center">
          <Link href={preferencesHref} style={link}>
            Email Preferences
          </Link>
          <Text style={separator}>&nbsp;&nbsp;|&nbsp;&nbsp;</Text>
          <Link href={unsubscribeHref} style={link}>
            Unsubscribe
          </Link>
        </Column>
      </Row>

      {/* Company info (CAN-SPAM compliance) */}
      <Text style={companyInfo}>
        The Capital Collective
        <br />
        Richmond, VA
      </Text>
    </Section>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const container = {
  textAlign: "center" as const,
  marginTop: "32px",
  paddingTop: "24px",
  borderTop: "1px solid #e4e4e7", // zinc-200
};

const reasonText = {
  color: "#a1a1aa", // zinc-400
  fontSize: "12px",
  lineHeight: "18px",
  margin: "0 0 12px 0",
};

const link = {
  color: "#71717a", // zinc-500
  fontSize: "12px",
  textDecoration: "underline",
};

const separator = {
  color: "#d4d4d8", // zinc-300
  fontSize: "12px",
  display: "inline",
  margin: "0",
};

const companyInfo = {
  color: "#a1a1aa", // zinc-400
  fontSize: "11px",
  lineHeight: "16px",
  margin: "16px 0 0 0",
};

export default UnsubscribeBlock;
