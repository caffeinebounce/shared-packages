import { BaseEmailLayout } from "../components/BaseEmailLayout";
import { EmailFooter } from "../components/EmailFooter";
import { EmailHeader } from "../components/EmailHeader";
import {
  EmailButton,
  EmailContent,
  EmailDivider,
  EmailHeading,
  EmailText,
} from "../components/EmailPrimitives";
import type { BrandConfig, ColorPalette } from "../types/brand";
import { defaultBrandConfig, defaultColors } from "../types/brand";

export interface NewsletterWelcomeTemplateProps {
  /** Unsubscribe link for compliance */
  unsubscribeLink: string;
  /** Optional link to the app/website */
  websiteLink?: string;
  /** Brand configuration */
  brand?: Partial<BrandConfig>;
  /** Color palette overrides */
  colors?: Partial<ColorPalette>;
  /** Custom heading text */
  heading?: string;
  /** Custom intro text */
  introText?: string;
  /** Custom list of what to expect */
  expectItems?: string[];
  /** Custom button text */
  buttonText?: string;
  /** Custom closing text */
  closingText?: string;
}

/**
 * Welcome email template for new newsletter subscribers.
 * Confirms subscription and sets expectations for future emails.
 */
export function NewsletterWelcomeTemplate({
  unsubscribeLink,
  websiteLink,
  brand = {},
  colors = {},
  heading,
  introText,
  expectItems,
  buttonText,
  closingText,
}: NewsletterWelcomeTemplateProps) {
  const config = { ...defaultBrandConfig, ...brand };
  const palette = {
    ...defaultColors,
    ...(config.primaryColor ? { buttonBg: config.primaryColor } : {}),
    ...colors,
  };

  const defaultHeading = `Welcome to the ${config.name} Newsletter!`;
  const defaultIntroText = `Thank you for subscribing! You're now part of our community and will be the first to know about updates, insights, and opportunities.`;
  const defaultExpectItems = [
    "Expert insights and industry updates",
    "Tips and resources to help you succeed",
    "Early access to new features and opportunities",
    "Exclusive content for subscribers only",
  ];
  const defaultButtonText = `Visit ${config.name}`;
  const defaultClosingText = `We're excited to have you with us. Stay tuned for great content!`;

  const finalWebsiteLink = websiteLink || config.baseUrl;

  return (
    <BaseEmailLayout
      preview={`Welcome to the ${config.name} newsletter!`}
      colors={palette}
    >
      <EmailHeader brand={config} />

      <EmailContent>
        <EmailHeading>{heading || defaultHeading}</EmailHeading>

        <EmailText colors={palette}>{introText || defaultIntroText}</EmailText>

        <EmailDivider />

        <EmailText
          colors={palette}
          style={{ fontWeight: 600, marginBottom: "8px" }}
        >
          Here's what you can expect:
        </EmailText>

        <ul
          style={{
            margin: "0 0 24px 0",
            padding: "0 0 0 20px",
            color: palette.text,
          }}
        >
          {(expectItems || defaultExpectItems).map((item) => (
            <li key={item} style={{ marginBottom: "8px", lineHeight: "1.6" }}>
              {item}
            </li>
          ))}
        </ul>

        {finalWebsiteLink && (
          <EmailButton href={finalWebsiteLink} colors={palette}>
            {buttonText || defaultButtonText}
          </EmailButton>
        )}

        <EmailText colors={palette}>{closingText || defaultClosingText}</EmailText>
      </EmailContent>

      <EmailFooter
        brand={config}
        reasonText="You received this email because you subscribed to our newsletter."
        unsubscribeLink={unsubscribeLink}
      />
    </BaseEmailLayout>
  );
}

export default NewsletterWelcomeTemplate;
