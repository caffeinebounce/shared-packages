/**
 * Email-related utilities.
 *
 * @module email
 */

/**
 * Extract the domain portion from an email address.
 *
 * @param email - Email address to extract domain from
 * @returns Domain portion of the email (lowercase), or null if invalid
 *
 * @example
 * ```ts
 * getEmailDomain("user@example.com") // "example.com"
 * getEmailDomain("John.Doe@Company.ORG") // "company.org"
 * getEmailDomain("invalid-email") // null
 * ```
 */
export function getEmailDomain(email: string): string | null {
  const domain = email.split("@")[1];
  return domain?.toLowerCase() || null;
}
