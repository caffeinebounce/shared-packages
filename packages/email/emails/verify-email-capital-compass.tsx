/**
 * Example: Verify Email (Capital Compass)
 * 
 * This shows how Capital Compass configures the template.
 */
import { VerifyEmailTemplate } from "../src/templates/VerifyEmailTemplate";
import { capitalCompassBrand } from "./_brands";

export default function VerifyEmailCapitalCompass() {
  return (
    <VerifyEmailTemplate
      verificationLink="https://thecapitalcompass.ai/auth/confirm?token=abc123"
      email="founder@startup.com"
      brand={capitalCompassBrand}
      bodyText="Thanks for joining Capital Compass! We're excited to help you on your capital readiness journey. Please verify your email to get started."
    />
  );
}
