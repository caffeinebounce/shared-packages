import type { BrandConfig, ColorPalette } from "../types/brand";
import { defaultBrandConfig } from "../types/brand";
import { TransactionalActionTemplate } from "./TransactionalActionTemplate";

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
  const brandName = brand.name ?? defaultBrandConfig.name;

  return (
    <TransactionalActionTemplate
      actionLink={resetLink}
      brand={brand}
      colors={colors}
      heading={heading}
      bodyText={
        bodyText ??
        `We received a request to reset the password for your ${brandName} account. Click the button below to create a new password.`
      }
      buttonText={buttonText}
      expiryText={expiryText}
      preview={(brandName) => `Reset your password for ${brandName}`}
      reasonText={(brandName) =>
        `You received this email because a password reset was requested for your ${brandName} account.`
      }
    />
  );
}

export default PasswordResetTemplate;
