import type { CreateEmailResponse } from "resend";
import { Resend } from "resend";

/**
 * Configuration options for the email client
 */
export interface EmailClientConfig {
  /** Resend API key */
  apiKey?: string;
  /** Default "from" address for emails */
  defaultFrom?: string;
}

/**
 * Email client instance with configured defaults
 */
export interface EmailClient {
  /** Resend client instance */
  resend: Resend | null;
  /** Default "from" address */
  defaultFrom: string;
  /** Send an email */
  send: Resend["emails"]["send"];
}

/**
 * Create a configured email client
 *
 * @param config - Configuration options
 * @returns Configured email client
 *
 * @example
 * ```ts
 * const emailClient = createEmailClient({
 *   apiKey: process.env.RESEND_API_KEY,
 *   defaultFrom: "noreply@example.com"
 * });
 *
 * await emailClient.send({
 *   from: emailClient.defaultFrom,
 *   to: "user@example.com",
 *   subject: "Welcome",
 *   react: <WelcomeEmail />
 * });
 * ```
 */
export function createEmailClient(config: EmailClientConfig = {}): EmailClient {
  const { apiKey, defaultFrom = "noreply@example.com" } = config;

  let resend: Resend | null = null;

  if (apiKey) {
    resend = new Resend(apiKey);
  } else {
    console.warn(
      "Email client created without API key - emails will not be sent",
    );
  }

  return {
    resend,
    defaultFrom,
    send: async (
      ...args: Parameters<Resend["emails"]["send"]>
    ): Promise<CreateEmailResponse> => {
      if (!resend) {
        console.warn("Email not sent - API key not configured");
        return {
          data: null,
          error: {
            statusCode: 400,
            message: "API key not configured",
            name: "missing_api_key",
          },
          headers: null,
        } satisfies CreateEmailResponse;
      }
      return resend.emails.send(...args);
    },
  };
}
