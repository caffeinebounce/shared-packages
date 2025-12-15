/**
 * Example: Verify Email (Default Brand)
 * 
 * This shows the default template with minimal configuration.
 */
import { VerifyEmailTemplate } from "../src/templates/VerifyEmailTemplate";

export default function VerifyEmailExample() {
  return (
    <VerifyEmailTemplate
      verificationLink="https://acme.example.com/auth/verify?token=abc123"
      email="user@example.com"
    />
  );
}
