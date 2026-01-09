/**
 * Email-related utilities.
 *
 * @module email
 */

/**
 * Extract the domain portion from an email address.
 *
 * Validates that the email contains exactly one "@" symbol before extraction.
 *
 * @param email - Email address to extract domain from
 * @returns Domain portion of the email (lowercase), or null if invalid
 *
 * @example
 * ```ts
 * getEmailDomain("user@example.com") // "example.com"
 * getEmailDomain("John.Doe@Company.ORG") // "company.org"
 * getEmailDomain("invalid-email") // null
 * getEmailDomain("user@@example.com") // null (multiple @ symbols)
 * ```
 */
export function getEmailDomain(email: string): string | null {
  const parts = email.split("@");
  if (parts.length !== 2) {
    return null;
  }

  const [localPart, domain] = parts;
  // Both local part and domain must be non-empty
  if (!localPart || !domain) {
    return null;
  }

  return domain.toLowerCase();
}
