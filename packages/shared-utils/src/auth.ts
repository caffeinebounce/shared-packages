/**
 * Authentication and user metadata utilities.
 *
 * @module auth
 */

/**
 * Parsed user metadata from OAuth providers (Google, Azure AD, etc.)
 */
export interface ParsedUserMetadata {
  /** Full name from provider (Google: name, Azure: full_name) */
  fullName: string;
  /** First/given name */
  firstName: string;
  /** Last/family name */
  lastName: string;
  /** Avatar/profile picture URL */
  avatarUrl: string;
  /** Email address (if available in metadata) */
  email?: string;
}

/**
 * Raw user metadata from OAuth providers.
 * Supports various providers (Google, Azure, email/password, etc.)
 */
export interface RawUserMetadata {
  // Common fields
  full_name?: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  given_name?: string;
  family_name?: string;

  // Avatar fields (varies by provider)
  picture?: string;
  avatar_url?: string;

  // Email (sometimes in metadata)
  email?: string;

  // Allow additional provider-specific fields
  [key: string]: unknown;
}

/**
 * Safely extract a string value from metadata.
 * Returns undefined if the value is not a string or is empty.
 */
function getString(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }
  return undefined;
}

/**
 * Parse user metadata from OAuth providers into a normalized structure.
 *
 * Handles metadata from various providers:
 * - Google: name, picture, given_name, family_name
 * - Azure AD: full_name, picture, avatar_url
 * - Email/Password: first_name, last_name (if set during signup)
 *
 * @param metadata - Raw user_metadata object from auth provider
 * @returns Normalized user metadata
 *
 * @example
 * ```typescript
 * // Client-side usage with Supabase
 * const { user } = await supabase.auth.getUser();
 * const parsed = parseUserMetadata(user.user_metadata);
 * console.log(parsed.firstName, parsed.avatarUrl);
 *
 * // Server-side usage (in webhook)
 * const { raw_user_meta_data } = record;
 * const parsed = parseUserMetadata(raw_user_meta_data);
 * await sendEmail({ firstName: parsed.firstName });
 * ```
 */
export function parseUserMetadata(
  metadata: RawUserMetadata | null | undefined,
): ParsedUserMetadata {
  const meta = metadata || {};

  // Get full name from various provider fields
  const fullName = getString(meta.full_name) || getString(meta.name) || "";

  // Get avatar from provider (Azure uses 'picture' or 'avatar_url', Google uses 'picture')
  const avatarUrl = getString(meta.picture) || getString(meta.avatar_url) || "";

  // Get first name - check explicit fields first, then split full name
  let firstName =
    getString(meta.first_name) || getString(meta.given_name) || "";
  let lastName = getString(meta.last_name) || getString(meta.family_name) || "";

  // If no explicit first/last name, split the full name
  if (!firstName && fullName) {
    const nameParts = fullName.trim().split(/\s+/);
    firstName = nameParts[0] || "";
    lastName = nameParts.slice(1).join(" ") || "";
  }

  return {
    fullName,
    firstName,
    lastName,
    avatarUrl,
    email: getString(meta.email),
  };
}

/**
 * Get a friendly display name for a user.
 * Falls back through: full name -> first name -> email prefix -> "User"
 *
 * @param metadata - Raw user metadata
 * @param email - User's email address (optional fallback)
 * @returns Display name string
 *
 * @example
 * ```typescript
 * getDisplayName({ name: "John Doe" }) // "John Doe"
 * getDisplayName({}, "jane@example.com") // "jane"
 * getDisplayName({}) // "User"
 * ```
 */
export function getDisplayName(
  metadata: RawUserMetadata | null | undefined,
  email?: string | null,
): string {
  const parsed = parseUserMetadata(metadata);

  if (parsed.fullName) return parsed.fullName;
  if (parsed.firstName) return parsed.firstName;
  if (email) return email.split("@")[0] || "User";
  return "User";
}

/**
 * Generate cryptographically secure recovery codes.
 * Uses crypto.getRandomValues() for secure random number generation.
 *
 * @param count - Number of codes to generate (default: 10)
 * @returns Array of recovery codes in format "XXXX-XXXX"
 *
 * @example
 * ```typescript
 * const codes = generateRecoveryCodes(10);
 * // ["A1B2-C3D4", "E5F6-G7H8", ...]
 * ```
 */
export function generateRecoveryCodes(count = 10): string[] {
  /**
   * Convert bytes to uppercase hex string.
   * Each byte produces exactly 2 hex characters for consistent entropy.
   */
  const toHex = (view: Uint8Array): string =>
    Array.from(view)
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase();

  return Array.from({ length: count }, () => {
    // Generate 4 random bytes (32 bits of entropy for an 8-character code)
    const array = new Uint8Array(4);
    crypto.getRandomValues(array);

    const part1 = toHex(array.slice(0, 2)); // 2 bytes -> 4 hex chars
    const part2 = toHex(array.slice(2, 4)); // 2 bytes -> 4 hex chars

    return `${part1}-${part2}`;
  });
}
