/**
 * Example: Magic Link (Default)
 */
import { MagicLinkTemplate } from "../src/templates/MagicLinkTemplate";

export default function MagicLinkExample() {
  return (
    <MagicLinkTemplate
      magicLink="https://acme.example.com/auth/magic?token=magic789"
    />
  );
}
