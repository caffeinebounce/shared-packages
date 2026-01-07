/**
 * String manipulation utilities.
 *
 * @module string
 */

/**
 * Get initials from a name.
 *
 * @param name - Full name to extract initials from
 * @returns Up to 2 uppercase initials, or "?" if name is empty
 *
 * @example
 * ```ts
 * getInitials("John Doe") // "JD"
 * getInitials("Jane") // "J"
 * getInitials("John Michael Doe") // "JM"
 * getInitials(null) // "?"
 * ```
 */
export function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/**
 * Ensure a URL has a protocol prefix.
 * Adds "https://" if no protocol is present.
 *
 * @param url - URL string that may or may not have a protocol
 * @returns URL with protocol, or empty string if input is empty
 *
 * @example
 * ```ts
 * ensureAbsoluteUrl("example.com") // "https://example.com"
 * ensureAbsoluteUrl("https://example.com") // "https://example.com"
 * ensureAbsoluteUrl("http://example.com") // "http://example.com"
 * ensureAbsoluteUrl(null) // ""
 * ```
 */
export function ensureAbsoluteUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  return `https://${url}`;
}

/**
 * Truncate text with ellipsis.
 *
 * @param text - Text to truncate
 * @param maxLength - Maximum length including ellipsis
 * @returns Truncated text with "..." if exceeded maxLength
 *
 * @example
 * ```ts
 * truncate("Hello World", 8) // "Hello..."
 * truncate("Hi", 8) // "Hi"
 * truncate(null, 10) // ""
 * ```
 */
export function truncate(
  text: string | null | undefined,
  maxLength: number,
): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3)}...`;
}

/**
 * Convert a string to a URL-friendly slug.
 *
 * @param text - Text to convert to slug
 * @returns Lowercase hyphenated string
 *
 * @example
 * ```ts
 * slugify("Hello World") // "hello-world"
 * slugify("My  Example Title!") // "my-example-title"
 * ```
 */
export function slugify(text: string | null | undefined): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, ""); // Trim hyphens from start/end
}

/**
 * Capitalize the first letter of a string.
 *
 * @param text - Text to capitalize
 * @returns Text with first letter capitalized
 *
 * @example
 * ```ts
 * capitalize("hello") // "Hello"
 * capitalize("HELLO") // "HELLO"
 * capitalize("") // ""
 * ```
 */
export function capitalize(text: string | null | undefined): string {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Simple pluralization helper.
 *
 * @param count - Number to check for pluralization
 * @param singular - Singular form of the word
 * @param plural - Plural form (optional, defaults to singular + "s")
 * @returns Appropriate form based on count
 *
 * @example
 * ```ts
 * pluralize(1, "item") // "item"
 * pluralize(2, "item") // "items"
 * pluralize(0, "child", "children") // "children"
 * ```
 */
export function pluralize(
  count: number,
  singular: string,
  plural?: string,
): string {
  if (count === 1) return singular;
  return plural ?? `${singular}s`;
}
