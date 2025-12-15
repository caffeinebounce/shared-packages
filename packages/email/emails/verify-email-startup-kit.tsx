/**
 * Example: Verify Email (Startup Kit - Custom Colors)
 * 
 * This shows how to customize colors with a brand.
 */
import { VerifyEmailTemplate } from "../src/templates/VerifyEmailTemplate";
import { startupKitBrand } from "./_brands";

export default function VerifyEmailStartupKit() {
  return (
    <VerifyEmailTemplate
      verificationLink="https://startupkit.example.com/verify?token=xyz789"
      email="developer@startup.io"
      brand={startupKitBrand}
      colors={{ buttonBg: "#6366f1" }} // Match brand color
      heading="Welcome to Startup Kit! 🚀"
      bodyText="You're one click away from launching faster. Verify your email to access your dashboard and start building."
      buttonText="Let's Go!"
    />
  );
}
