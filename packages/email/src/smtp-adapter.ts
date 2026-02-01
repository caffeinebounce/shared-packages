import { render } from "@react-email/components";
import { createTransport, type Transporter } from "nodemailer";
import type {
  EmailPayload,
  EmailSendResult,
  EmailTransport,
  SmtpConfig,
} from "./types/provider";

/**
 * Create an SMTP transport for local email testing (Mailpit/Mailtrap)
 *
 * @param config - SMTP configuration
 * @returns Email transport that sends via SMTP
 *
 * @example
 * ```ts
 * // For Mailpit (local development)
 * const transport = createSmtpTransport({
 *   host: 'localhost',
 *   port: 1025,
 * });
 *
 * await transport.send({
 *   from: 'noreply@example.com',
 *   to: 'user@example.com',
 *   subject: 'Test',
 *   html: '<p>Hello!</p>'
 * });
 * ```
 */
export function createSmtpTransport(config: SmtpConfig): EmailTransport {
  const transporter: Transporter = createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure ?? false,
    auth: config.auth,
    // Don't verify certificates for local development
    tls: {
      rejectUnauthorized: false,
    },
  });

  return {
    async send(payload: EmailPayload): Promise<EmailSendResult> {
      try {
        // Render React email to HTML if provided
        let html = payload.html;
        if (payload.react && !html) {
          html = await render(payload.react);
        }

        const result = await transporter.sendMail({
          from: payload.from,
          to: Array.isArray(payload.to) ? payload.to.join(", ") : payload.to,
          subject: payload.subject,
          html,
          text: payload.text,
          replyTo: payload.replyTo,
          cc: payload.cc
            ? Array.isArray(payload.cc)
              ? payload.cc.join(", ")
              : payload.cc
            : undefined,
          bcc: payload.bcc
            ? Array.isArray(payload.bcc)
              ? payload.bcc.join(", ")
              : payload.bcc
            : undefined,
        });

        return {
          success: true,
          id: result.messageId,
        };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown SMTP error";
        console.error("SMTP send failed:", message);
        return {
          success: false,
          error: message,
        };
      }
    },
  };
}
