import { Link } from "@react-email/components";
import { BaseEmailLayout } from "../components/BaseEmailLayout";
import { EmailHeader } from "../components/EmailHeader";
import {
  EmailContent,
  EmailDivider,
  EmailHeading,
  EmailText,
} from "../components/EmailPrimitives";
import { MarketingEmailFooter } from "../components/MarketingEmailFooter";
import type { BrandConfig, ColorPalette } from "../types/brand";
import { defaultBrandConfig, defaultColors } from "../types/brand";

export interface ContactConfirmationTemplateNextStep {
  href: string;
  label: string;
}

export interface ContactConfirmationTemplateProps {
  brand?: Partial<BrandConfig>;
  colors?: Partial<ColorPalette>;
  heading?: string;
  bodyText?: string;
  responseWindowText?: string;
  nextSteps?: ContactConfirmationTemplateNextStep[];
}

export function ContactConfirmationTemplate({
  brand = {},
  colors = {},
  heading = "We received your message",
  bodyText,
  responseWindowText = "A member of our team will review your note and follow up soon.",
  nextSteps = [],
}: ContactConfirmationTemplateProps) {
  const config = { ...defaultBrandConfig, ...brand };
  const palette = {
    ...defaultColors,
    ...(config.primaryColor ? { buttonBg: config.primaryColor } : {}),
    ...colors,
  };

  return (
    <BaseEmailLayout
      preview={`We received your message for ${config.name}`}
      colors={palette}
    >
      <EmailHeader brand={config} />

      <EmailContent>
        <EmailHeading>{heading}</EmailHeading>
        <EmailText colors={palette}>
          {bodyText ||
            `Thanks for reaching out to ${config.name}. We wanted to let you know your message arrived safely.`}
        </EmailText>
        <EmailText colors={palette}>{responseWindowText}</EmailText>

        {nextSteps.length > 0 ? (
          <>
            <EmailDivider colors={palette} />
            <EmailText colors={palette} style={{ fontWeight: 600 }}>
              In the meantime:
            </EmailText>
            {nextSteps.map((step) => (
              <EmailText
                key={step.href}
                colors={palette}
                style={{ margin: "8px 0" }}
              >
                <Link href={step.href} style={{ color: palette.link }}>
                  {step.label}
                </Link>
              </EmailText>
            ))}
          </>
        ) : null}
      </EmailContent>

      <MarketingEmailFooter
        brand={config}
        reasonText="You received this email because you contacted our team."
      />
    </BaseEmailLayout>
  );
}

export default ContactConfirmationTemplate;
