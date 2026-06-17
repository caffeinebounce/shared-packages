import { Link, Section, Text } from "@react-email/components";
import type { BrandConfig } from "../types/brand";
import { defaultBrandConfig } from "../types/brand";
import { EmailFooter, type EmailFooterProps } from "./EmailFooter";

export interface MarketingEmailFooterProps
  extends Pick<
    EmailFooterProps,
    "reasonText" | "unsubscribeLink" | "unsubscribeText"
  > {
  brand?: Partial<BrandConfig>;
  websiteCtaText?: string;
  socialHeading?: string;
}

export function MarketingEmailFooter({
  brand = {},
  reasonText,
  unsubscribeLink,
  unsubscribeText,
  websiteCtaText = "Visit website",
  socialHeading = "Stay connected",
}: MarketingEmailFooterProps) {
  const config = { ...defaultBrandConfig, ...brand };

  return (
    <>
      <Section style={marketingFooter}>
        <Text style={heading}>{socialHeading}</Text>
        <Text style={bodyText}>
          {config.companyName} is building capital readiness, relationships, and
          long-term growth for entrepreneurs.
        </Text>
        <Text style={ctaRow}>
          <Link href={config.baseUrl} style={ctaLink}>
            {websiteCtaText}
          </Link>
        </Text>
      </Section>
      <EmailFooter
        brand={config}
        reasonText={reasonText}
        unsubscribeLink={unsubscribeLink}
        unsubscribeText={unsubscribeText}
      />
    </>
  );
}

const marketingFooter = {
  paddingTop: "8px",
  textAlign: "center" as const,
};

const heading = {
  color: "#18181b",
  fontSize: "13px",
  fontWeight: "600",
  letterSpacing: "0.08em",
  margin: "0 0 8px 0",
  textTransform: "uppercase" as const,
};

const bodyText = {
  color: "#71717a",
  fontSize: "13px",
  lineHeight: "20px",
  margin: "0 0 12px 0",
};

const ctaRow = {
  margin: "0 0 8px 0",
};

const ctaLink = {
  color: "#18181b",
  fontSize: "13px",
  fontWeight: "600",
  textDecoration: "underline",
};

export default MarketingEmailFooter;
