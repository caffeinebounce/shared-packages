// Client (legacy Resend-only)
export {
  createEmailClient,
  type EmailClient,
  type EmailClientConfig,
} from "./client";
export {
  BaseEmailLayout,
  type BaseEmailLayoutProps,
} from "./components/BaseEmailLayout";
export { EmailFooter, type EmailFooterProps } from "./components/EmailFooter";
// Components
export { EmailHeader, type EmailHeaderProps } from "./components/EmailHeader";
export {
  EmailButton,
  type EmailButtonProps,
  EmailContent,
  type EmailContentProps,
  EmailDivider,
  EmailHeading,
  type EmailHeadingProps,
  EmailText,
  type EmailTextProps,
} from "./components/EmailPrimitives";
// Mock Transport (for testing)
export {
  createMockEmailTransport,
  type MockEmailTransport,
  mockEmailTransport,
  type StoredEmail,
} from "./mock";
// Universal Provider (supports Resend, SMTP, Mock)
export {
  createUniversalEmailClient,
  isMockClient,
  type ProviderConfig,
  type UniversalEmailClient,
} from "./provider";
// SMTP Adapter
export { createSmtpTransport } from "./smtp-adapter";
export {
  MagicLinkTemplate,
  type MagicLinkTemplateProps,
} from "./templates/MagicLinkTemplate";
export {
  NewsletterWelcomeTemplate,
  type NewsletterWelcomeTemplateProps,
} from "./templates/NewsletterWelcomeTemplate";
export {
  PasswordResetTemplate,
  type PasswordResetTemplateProps,
} from "./templates/PasswordResetTemplate";
// Templates
export {
  VerifyEmailTemplate,
  type VerifyEmailTemplateProps,
} from "./templates/VerifyEmailTemplate";
// Types
export type { SendEmailResult } from "./types";
// Brand Types
export {
  type BrandConfig,
  type ColorPalette,
  defaultBrandConfig,
  defaultColors,
} from "./types/brand";
// Provider Types
export {
  DEFAULT_MAILPIT_CONFIG,
  type EmailPayload,
  type EmailProvider,
  type EmailSendResult,
  type EmailTransport,
  type SmtpConfig,
} from "./types/provider";
