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

export interface TransactionalActionTemplateProps {
  actionLink: string;
  brand?: Partial<BrandConfig>;
  colors?: Partial<ColorPalette>;
  heading: string;
  bodyText: string;
  buttonText: string;
  expiryText?: string;
  preview: (brandName: string) => string;
  reasonText: (brandName: string) => string;
}

export function TransactionalActionTemplate({
  actionLink,
  brand = {},
  colors = {},
  heading,
  bodyText,
  buttonText,
  expiryText,
  preview,
  reasonText,
}: TransactionalActionTemplateProps) {
  const config = { ...defaultBrandConfig, ...brand };
  const palette = {
    ...defaultColors,
    ...(config.primaryColor ? { buttonBg: config.primaryColor } : {}),
    ...colors,
  };

  return (
    <BaseEmailLayout preview={preview(config.name)} colors={palette}>
      <EmailHeader brand={config} />

      <EmailContent>
        <EmailHeading>{heading}</EmailHeading>

        <EmailText colors={palette}>{bodyText}</EmailText>

        <EmailButton href={actionLink} colors={palette}>
          {buttonText}
        </EmailButton>

        {expiryText && (
          <EmailText variant="expiry" colors={palette}>
            {expiryText}
          </EmailText>
        )}
      </EmailContent>

      <EmailFooter brand={config} reasonText={reasonText(config.name)} />
    </BaseEmailLayout>
  );
}
