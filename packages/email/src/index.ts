// Client
export {
  createEmailClient,
  type EmailClient,
  type EmailClientConfig,
} from "./client";

// Components
export { EmailHeader } from "./components/EmailHeader";
export { SocialLinks } from "./components/SocialLinks";
export { UnsubscribeBlock } from "./components/UnsubscribeBlock";

// Templates
export { VerifyEmailTemplate } from "./templates/VerifyEmailTemplate";

// Types
export type { SendEmailResult } from "./types";
