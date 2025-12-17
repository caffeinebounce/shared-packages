import { BaseEmailLayout } from "../components/BaseEmailLayout";
import { EmailFooter } from "../components/EmailFooter";
import { EmailHeader } from "../components/EmailHeader";
import {
  EmailButton,
  EmailContent,
  EmailHeading,
  EmailText,
} from "../components/EmailPrimitives";
import type { BrandConfig, ColorPalette } from "../types/brand";
import { defaultBrandConfig, defaultColors } from "../types/brand";

export interface PasswordResetTemplateProps {
  /** The password reset link */
  resetLink: string;
  /** Brand configuration */
  brand?: Partial<BrandConfig>;
  /** Color palette overrides */
  colors?: Partial<ColorPalette>;
  /** Custom heading text */
  heading?: string;
  /** Custom body text */
  bodyText?: string;
  /** Custom button text */
  buttonText?: string;
  /** Custom expiry text */
  expiryText?: string;
}

/**
 * Generic password reset email template.
 * All brand-specific content is configurable via props.
 */
export function PasswordResetTemplate({
  resetLink,
  brand = {},
  colors = {},
  heading = "Reset your password",
  bodyText,
  buttonText = "Reset Password",
  expiryText = "This link will expire in 24 hours.",
}: PasswordResetTemplateProps) {
  const config = { ...defaultBrandConfig, ...brand };
  // Use brand's primaryColor for button if not explicitly overridden
  const palette = {
    ...defaultColors,
    ...(config.primaryColor ? { buttonBg: config.primaryColor } : {}),
    ...colors,
  };

  const defaultBodyText = `We received a request to reset the password for your ${config.name} account. Click the button below to create a new password.`;

  return (
    <BaseEmailLayout
      preview={`Reset your password for ${config.name}`}
      colors={palette}
    >
      <EmailHeader brand={config} />

      <EmailContent>
        <EmailHeading>{heading}</EmailHeading>

        <EmailText colors={palette}>{bodyText || defaultBodyText}</EmailText>

        <EmailButton href={resetLink} colors={palette}>
          {buttonText}
        </EmailButton>

        <EmailText variant="expiry" colors={palette}>
          {expiryText}
        </EmailText>
      </EmailContent>

      <EmailFooter
        brand={config}
        reasonText={`You received this email because a password reset was requested for your ${config.name} account.`}
      />
    </BaseEmailLayout>
  );
}

export default PasswordResetTemplate;
