import type { ReactElement } from "react";

/**
 * Supported email providers
 */
export type EmailProvider = "resend" | "smtp" | "mock";

/**
 * SMTP configuration for local development (Mailpit/Mailtrap)
 */
export interface SmtpConfig {
  host: string;
  port: number;
  secure?: boolean;
  auth?: {
    user: string;
    pass: string;
  };
}

/**
 * Common email payload interface
 */
export interface EmailPayload {
  from: string;
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  react?: ReactElement;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
}

/**
 * Result of sending an email
 */
export interface EmailSendResult {
  success: boolean;
  id?: string;
  error?: string;
}

/**
 * Generic email transport interface
 */
export interface EmailTransport {
  send(payload: EmailPayload): Promise<EmailSendResult>;
}

/**
 * Default SMTP config for local Mailpit
 */
export const DEFAULT_MAILPIT_CONFIG: SmtpConfig = {
  host: "localhost",
  port: 1025,
  secure: false,
};
