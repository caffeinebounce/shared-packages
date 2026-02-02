import type {
  EmailPayload,
  EmailSendResult,
  EmailTransport,
} from "./types/provider";

/**
 * Stored email for test assertions
 */
export interface StoredEmail extends EmailPayload {
  id: string;
  sentAt: Date;
}

/**
 * Mock email transport for testing
 *
 * Captures all sent emails in memory for test assertions.
 *
 * @example
 * ```ts
 * import { mockEmailTransport } from '@caffeinebounce/email';
 *
 * // In your test
 * await mockEmailTransport.send({
 *   from: 'noreply@example.com',
 *   to: 'user@example.com',
 *   subject: 'Welcome',
 *   html: '<p>Hello!</p>'
 * });
 *
 * // Assert
 * expect(mockEmailTransport.sentEmails).toHaveLength(1);
 * expect(mockEmailTransport.sentEmails[0].to).toBe('user@example.com');
 *
 * // Clean up
 * mockEmailTransport.clear();
 * ```
 */
export interface MockEmailTransport extends EmailTransport {
  /** All emails sent through this transport */
  sentEmails: StoredEmail[];
  /** Clear all stored emails */
  clear(): void;
  /** Get emails sent to a specific address */
  getEmailsTo(address: string): StoredEmail[];
  /** Get the last sent email */
  getLastEmail(): StoredEmail | undefined;
}

let emailCounter = 0;

/**
 * Create a mock email transport for testing
 */
export function createMockEmailTransport(): MockEmailTransport {
  const sentEmails: StoredEmail[] = [];

  return {
    sentEmails,

    async send(payload: EmailPayload): Promise<EmailSendResult> {
      const id = `mock-${++emailCounter}-${Date.now()}`;
      const storedEmail: StoredEmail = {
        ...payload,
        id,
        sentAt: new Date(),
      };
      sentEmails.push(storedEmail);

      return {
        success: true,
        id,
      };
    },

    clear() {
      sentEmails.length = 0;
    },

    getEmailsTo(address: string): StoredEmail[] {
      return sentEmails.filter((email) => {
        const recipients = Array.isArray(email.to) ? email.to : [email.to];
        return recipients.includes(address);
      });
    },

    getLastEmail(): StoredEmail | undefined {
      return sentEmails[sentEmails.length - 1];
    },
  };
}

/**
 * Singleton mock transport for convenience in tests
 */
export const mockEmailTransport = createMockEmailTransport();
