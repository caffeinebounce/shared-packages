import { BaseEmailLayout } from "../components/BaseEmailLayout";
import { EmailHeader } from "../components/EmailHeader";
import {
  EmailButton,
  EmailContent,
  EmailHeading,
  EmailLinkText,
  EmailText,
} from "../components/EmailPrimitives";
import { MarketingEmailFooter } from "../components/MarketingEmailFooter";
import type { BrandConfig, ColorPalette } from "../types/brand";
import { defaultBrandConfig, defaultColors } from "../types/brand";

export interface NewsletterConfirmationTemplateProps {
  confirmationLink: string;
  unsubscribeLink: string;
  brand?: Partial<BrandConfig>;
  colors?: Partial<ColorPalette>;
  heading?: string;
  bodyText?: string;
  buttonText?: string;
}

export function NewsletterConfirmationTemplate({
  confirmationLink,
  unsubscribeLink,
  brand = {},
  colors = {},
  heading = "Confirm your newsletter subscription",
  bodyText,
  buttonText = "Confirm subscription",
}: NewsletterConfirmationTemplateProps) {
  const config = { ...defaultBrandConfig, ...brand };
  const palette = {
    ...defaultColors,
    ...(config.primaryColor ? { buttonBg: config.primaryColor } : {}),
    ...colors,
  };

  return (
    <BaseEmailLayout
      preview={`Confirm your ${config.name} newsletter subscription`}
      colors={palette}
    >
      <EmailHeader brand={config} />

      <EmailContent>
        <EmailHeading>{heading}</EmailHeading>
        <EmailText colors={palette}>
          {bodyText ||
            `Please confirm your subscription to start receiving updates from ${config.name}.`}
        </EmailText>
        <EmailButton href={confirmationLink} colors={palette}>
          {buttonText}
        </EmailButton>
        <EmailLinkText href={confirmationLink} colors={palette} />
      </EmailContent>

      <MarketingEmailFooter
        brand={config}
        reasonText="You received this email because you requested newsletter updates."
        unsubscribeLink={unsubscribeLink}
      />
    </BaseEmailLayout>
  );
}

export default NewsletterConfirmationTemplate;
