import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { EmailHeader } from "../components/EmailHeader";
import { SocialLinks } from "../components/SocialLinks";

interface VerifyEmailTemplateProps {
  /** The verification link from Supabase */
  verificationLink: string;
  /** User's email address */
  email?: string;
  /** Logo URL for the header */
  logoUrl?: string;
}

/**
 * Email template for verifying a new user's email address.
 * Sent when a user signs up with email/password.
 */
export function VerifyEmailTemplate({
  verificationLink,
  email,
  logoUrl = "https://compass.thecapitalcollective.org/logo.png",
}: VerifyEmailTemplateProps) {
  return (
    <Html>
      <Head />
      <Preview>Verify your email address for Capital Compass</Preview>
      <Body style={main}>
        <Container style={container}>
          <EmailHeader logoUrl={logoUrl} />

          <Section style={content}>
            <Text style={heading}>Verify your email address</Text>

            <Text style={paragraph}>
              Thanks for signing up for Capital Compass! Please click the button
              below to verify your email address and complete your account
              setup.
            </Text>

            {email && (
              <Text style={emailText}>
                You&apos;re verifying: <strong>{email}</strong>
              </Text>
            )}

            <Section style={buttonContainer}>
              <Button style={button} href={verificationLink}>
                Verify Email Address
              </Button>
            </Section>

            <Text style={paragraph}>
              This link will expire in 24 hours. If you didn&apos;t create an
              account with Capital Compass, you can safely ignore this email.
            </Text>

            <Text style={linkFallback}>
              If the button doesn&apos;t work, copy and paste this link into
              your browser:
            </Text>
            <Text style={link}>{verificationLink}</Text>
          </Section>

          <Section style={footer}>
            <SocialLinks />
            <Text style={footerText}>
              © {new Date().getFullYear()} The Capital Collective. All rights
              reserved.
            </Text>
            <Text style={footerText}>
              You received this email because you signed up for Capital Compass.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const main = {
  backgroundColor: "#f4f4f5", // zinc-100
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: "560px",
  borderRadius: "8px",
};

const content = {
  padding: "0 20px",
};

const heading = {
  color: "#18181b", // zinc-900
  fontSize: "24px",
  fontWeight: "600",
  textAlign: "center" as const,
  margin: "24px 0 16px 0",
};

const paragraph = {
  color: "#3f3f46", // zinc-700
  fontSize: "16px",
  lineHeight: "24px",
  margin: "16px 0",
};

const emailText = {
  color: "#52525b", // zinc-600
  fontSize: "14px",
  textAlign: "center" as const,
  margin: "8px 0 24px 0",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#18181b", // zinc-900
  borderRadius: "6px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 32px",
};

const linkFallback = {
  color: "#71717a", // zinc-500
  fontSize: "12px",
  margin: "24px 0 4px 0",
};

const link = {
  color: "#3b82f6", // blue-500
  fontSize: "12px",
  wordBreak: "break-all" as const,
  margin: "0 0 16px 0",
};

const footer = {
  borderTop: "1px solid #e4e4e7", // zinc-200
  marginTop: "32px",
  paddingTop: "24px",
  textAlign: "center" as const,
};

const footerText = {
  color: "#a1a1aa", // zinc-400
  fontSize: "12px",
  margin: "8px 0",
};

export default VerifyEmailTemplate;
