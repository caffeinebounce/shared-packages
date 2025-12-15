/**
 * Example: Magic Link (Capital Compass)
 */
import { MagicLinkTemplate } from "../src/templates/MagicLinkTemplate";
import { capitalCompassBrand } from "./_brands";

export default function MagicLinkCapitalCompassExample() {
  return (
    <MagicLinkTemplate
      magicLink="https://thecapitalcompass.ai/auth/magic?token=magic789example"
      brand={capitalCompassBrand}
      heading="Sign in to Capital Compass"
      bodyText="Click the button below to securely sign in to your Capital Compass account. No password needed!"
      buttonText="Sign In Now"
    />
  );
}
