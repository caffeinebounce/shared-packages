/**
 * Example: Password Reset (Capital Compass)
 */
import { PasswordResetTemplate } from "../src/templates/PasswordResetTemplate";
import { capitalCompassBrand } from "./_brands";

export default function PasswordResetCapitalCompass() {
  return (
    <PasswordResetTemplate
      resetLink="https://thecapitalcompass.ai/auth/reset?token=reset456"
      brand={capitalCompassBrand}
    />
  );
}
