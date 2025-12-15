/**
 * Example: Password Reset (Default)
 */
import { PasswordResetTemplate } from "../src/templates/PasswordResetTemplate";

export default function PasswordResetExample() {
  return (
    <PasswordResetTemplate
      resetLink="https://acme.example.com/auth/reset?token=reset123"
    />
  );
}
