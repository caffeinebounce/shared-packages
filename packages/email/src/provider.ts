import { Resend } from "resend";
import { createMockEmailTransport, type MockEmailTransport } from "./mock";
import { createSmtpTransport } from "./smtp-adapter";
import type {
  EmailPayload,
  EmailProvider,
  EmailSendResult,
  EmailTransport,
  SmtpConfig,
} from "./types/provider";

/**
 * Configuration for creating an email client
 */
export interface ProviderConfig {
  /** Email provider to use */
  provider?: EmailProvider;
  /** Resend API key (required for 'resend' provider) */
  resendApiKey?: string;
  /** SMTP configuration (required for 'smtp' provider) */
  smtpConfig?: SmtpConfig;
  /** Default "from" address */
  defaultFrom?: string;
}

/**
 * Universal email client interface
 */
export interface UniversalEmailClient extends EmailTransport {
  /** The configured provider type */
  provider: EmailProvider;
  /** Default "from" address */
  defaultFrom: string;
}

/**
 * Create an email client with the specified provider
 *
 * Provider selection priority:
 * 1. Explicit `provider` parameter
 * 2. `EMAIL_PROVIDER` environment variable
 * 3. Auto-detect: 'resend' if API key exists, otherwise 'mock'
 *
 * @example
 * ```ts
 * // Auto-detect based on environment
 * const client = createUniversalEmailClient();
 *
 * // Explicit SMTP for local development
 * const client = createUniversalEmailClient({
 *   provider: 'smtp',
 *   smtpConfig: { host: 'localhost', port: 1025 }
 * });
 *
 * // Use mock for testing
 * const client = createUniversalEmailClient({ provider: 'mock' });
 * ```
 */
export function createUniversalEmailClient(
  config: ProviderConfig = {},
): UniversalEmailClient {
  const {
    resendApiKey = process.env.RESEND_API_KEY,
    smtpConfig = {
      host: process.env.SMTP_HOST || "localhost",
      port: Number.parseInt(process.env.SMTP_PORT || "1025", 10),
      secure: process.env.SMTP_SECURE === "true",
      auth:
        process.env.SMTP_USER && process.env.SMTP_PASS
          ? {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            }
          : undefined,
    },
    defaultFrom = process.env.EMAIL_FROM || "noreply@example.com",
  } = config;

  // Determine provider
  const provider: EmailProvider =
    config.provider ||
    (process.env.EMAIL_PROVIDER as EmailProvider) ||
    (resendApiKey ? "resend" : "mock");

  let transport: EmailTransport;

  switch (provider) {
    case "resend": {
      if (!resendApiKey) {
        console.warn(
          "Resend provider selected but no API key provided, falling back to mock",
        );
        transport = createMockEmailTransport();
        break;
      }
      const resend = new Resend(resendApiKey);
      transport = createResendTransport(resend);
      break;
    }

    case "smtp": {
      transport = createSmtpTransport(smtpConfig);
      break;
    }

    default: {
      // Handles 'mock' and any unknown provider
      transport = createMockEmailTransport();
      break;
    }
  }

  return {
    provider,
    defaultFrom,
    send: transport.send.bind(transport),
  };
}

/**
 * Wrap Resend client in our transport interface
 */
function createResendTransport(resend: Resend): EmailTransport {
  return {
    async send(payload: EmailPayload): Promise<EmailSendResult> {
      try {
        const result = await resend.emails.send({
          from: payload.from,
          to: payload.to,
          subject: payload.subject,
          html: payload.html,
          text: payload.text,
          react: payload.react,
          replyTo: payload.replyTo,
          cc: payload.cc,
          bcc: payload.bcc,
        });

        if (result.error) {
          return {
            success: false,
            error: result.error.message,
          };
        }

        return {
          success: true,
          id: result.data?.id,
        };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown Resend error";
        return {
          success: false,
          error: message,
        };
      }
    },
  };
}

/**
 * Type guard to check if client is using mock transport
 */
export function isMockClient(
  client: UniversalEmailClient,
): client is UniversalEmailClient & { transport: MockEmailTransport } {
  return client.provider === "mock";
}
