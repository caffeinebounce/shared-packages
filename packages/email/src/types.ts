/**
 * Result of sending an email
 */
export interface SendEmailResult {
  success: boolean;
  id?: string;
  error?: string;
}
