import type { BrandConfig, ColorPalette } from "../types/brand";
import { defaultBrandConfig } from "../types/brand";
import { TransactionalActionTemplate } from "./TransactionalActionTemplate";

export interface VerifyEmailTemplateProps {
  /** The verification link */
  verificationLink: string;
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
 * Generic email verification template.
 * All brand-specific content is configurable via props.
 */
export function VerifyEmailTemplate({
  verificationLink,
  brand = {},
  colors = {},
  heading = "Verify your email address",
  bodyText,
  buttonText = "Verify Email Address",
  expiryText = "This link will expire in 24 hours.",
}: VerifyEmailTemplateProps) {
  const brandName = brand.name ?? defaultBrandConfig.name;

  return (
    <TransactionalActionTemplate
      actionLink={verificationLink}
      brand={brand}
      colors={colors}
      heading={heading}
      bodyText={
        bodyText ??
        `Thanks for joining ${brandName}! Please verify your email to get started.`
      }
      buttonText={buttonText}
      expiryText={expiryText}
      preview={(name) => `Verify your email address for ${name}`}
      reasonText={(name) =>
        `You received this email because you signed up for ${name}.`
      }
    />
  );
}

export default VerifyEmailTemplate;
