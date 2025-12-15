import { BaseEmailLayout } from "../components/BaseEmailLayout";
import { EmailHeader } from "../components/EmailHeader";
import { EmailFooter } from "../components/EmailFooter";
import {
  EmailButton,
  EmailContent,
  EmailHeading,
  EmailText,
} from "../components/EmailPrimitives";
import type { BrandConfig, ColorPalette } from "../types/brand";
import { defaultBrandConfig, defaultColors } from "../types/brand";

export interface MagicLinkTemplateProps {
  /** The magic link for signing in */
  magicLink: string;
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
 * Generic magic link (passwordless sign-in) email template.
 * All brand-specific content is configurable via props.
 */
export function MagicLinkTemplate({
  magicLink,
  brand = {},
  colors = {},
  heading = "Your sign-in link",
  bodyText,
  buttonText,
  expiryText = "This link will expire in 1 hour.",
}: MagicLinkTemplateProps) {
  const config = { ...defaultBrandConfig, ...brand };
  // Use brand's primaryColor for button if not explicitly overridden
  const palette = {
    ...defaultColors,
    ...(config.primaryColor ? { buttonBg: config.primaryColor } : {}),
    ...colors,
  };

  const defaultBodyText = `Click the button below to securely sign in to your ${config.name} account.`;
  const defaultButtonText = `Sign In to ${config.name}`;

  return (
    <BaseEmailLayout
      preview={`Your sign-in link for ${config.name}`}
      colors={palette}
    >
      <EmailHeader brand={config} />

      <EmailContent>
        <EmailHeading>{heading}</EmailHeading>

        <EmailText colors={palette}>{bodyText || defaultBodyText}</EmailText>

        <EmailButton href={magicLink} colors={palette}>
          {buttonText || defaultButtonText}
        </EmailButton>

        <EmailText variant="expiry" colors={palette}>
          {expiryText}
        </EmailText>
      </EmailContent>

      <EmailFooter
        brand={config}
        reasonText={`You received this email because a sign-in was requested for your ${config.name} account.`}
      />
    </BaseEmailLayout>
  );
}

export default MagicLinkTemplate;
