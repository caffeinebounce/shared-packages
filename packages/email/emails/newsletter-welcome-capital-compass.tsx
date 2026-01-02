/**
 * Example: Newsletter Welcome (Capital Compass)
 */
import { NewsletterWelcomeTemplate } from "../src/templates/NewsletterWelcomeTemplate";
import { capitalCompassBrand } from "./_brands";

export default function NewsletterWelcomeCapitalCompassExample() {
  return (
    <NewsletterWelcomeTemplate
      unsubscribeLink="https://thecapitalcompass.ai/api/newsletter/unsubscribe?email=example@email.com&token=abc123"
      websiteLink="https://thecapitalcompass.ai"
      brand={capitalCompassBrand}
      heading="Welcome to Capital Compass!"
      introText="Thank you for subscribing to our newsletter! You've joined a community of entrepreneurs and investors committed to building capital-ready businesses."
      expectItems={[
        "Expert insights on capital readiness and fundraising",
        "Tips for strengthening your business fundamentals",
        "Updates on new cohorts and accelerator programs",
        "Success stories from our community",
      ]}
      buttonText="Explore Capital Compass"
      closingText="We're excited to support you on your journey to capital readiness!"
    />
  );
}
