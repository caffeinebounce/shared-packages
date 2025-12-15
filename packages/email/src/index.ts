// Client
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
export {
  MagicLinkTemplate,
  type MagicLinkTemplateProps,
} from "./templates/MagicLinkTemplate";
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
