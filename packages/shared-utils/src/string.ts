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

  const slugParts: string[] = [];
  let previousWasSeparator = true;

  for (const char of text.toLowerCase()) {
    if (
      (char >= "a" && char <= "z") ||
      (char >= "0" && char <= "9") ||
      char === "_"
    ) {
      slugParts.push(char);
      previousWasSeparator = false;
      continue;
    }

    if (
      (char === " " ||
        char === "\t" ||
        char === "\n" ||
        char === "\r" ||
        char === "-") &&
      !previousWasSeparator
    ) {
      slugParts.push("-");
      previousWasSeparator = true;
    }
  }

  if (slugParts.at(-1) === "-") {
    slugParts.pop();
  }

  return slugParts.join("");
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
 * Normalize an email address for consistent comparison.
 * Trims whitespace and converts to lowercase.
 *
 * @param email - Email address to normalize
 * @returns Normalized email address
 *
 * @example
 * ```ts
 * normalizeEmail("  USER@EXAMPLE.COM  ") // "user@example.com"
 * normalizeEmail("Test@Domain.org") // "test@domain.org"
 * ```
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
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

export type PreventWidowsOptions = {
  /**
   * Number of trailing words to keep together.
   *
   * @default 2
   */
  wordCount?: number;
  /**
   * Minimum number of words required before widow prevention is applied.
   *
   * @default Math.max(wordCount, 3)
   */
  minWords?: number;
  /**
   * Keep existing non-breaking spaces inside the locked phrase.
   *
   * @default true
   */
  preserveExistingNbsp?: boolean;
};

const NON_BREAKING_SPACE = "\u00A0";

function normalizePositiveInteger(value: number | undefined): number | null {
  if (value === undefined || !Number.isFinite(value)) return null;

  const normalized = Math.floor(value);

  return normalized > 0 ? normalized : null;
}

/**
 * Keep the final words of a string together by replacing separating whitespace
 * with non-breaking spaces.
 *
 * @param text - Text to normalize
 * @param options - Widow-prevention options
 * @returns Text with the trailing phrase locked together
 *
 * @example
 * ```ts
 * preventWidows("A purpose-built platform for the culture.")
 * // "A purpose-built platform for the\u00A0culture."
 * ```
 */
export function preventWidows(
  text: string | null | undefined,
  options: PreventWidowsOptions = {},
): string {
  if (!text) return "";

  const wordCount = normalizePositiveInteger(options.wordCount) ?? 2;
  const minWords =
    normalizePositiveInteger(options.minWords) ?? Math.max(wordCount, 3);
  const preserveExistingNbsp = options.preserveExistingNbsp ?? true;
  const tokens = text.split(/(\s+)/u);
  const wordTokenIndexes = tokens.reduce<number[]>((indexes, token, index) => {
    if (token && !/^\s+$/u.test(token)) {
      indexes.push(index);
    }

    return indexes;
  }, []);

  if (wordTokenIndexes.length < minWords) {
    return text;
  }

  const lockedWhitespaceIndexes = new Set<number>();

  if (wordTokenIndexes.length === 4 && wordCount === 2) {
    for (const [firstWordIndex, secondWordIndex] of [
      [0, 1],
      [2, 3],
    ] as const) {
      const firstTokenIndex = wordTokenIndexes[firstWordIndex];
      const secondTokenIndex = wordTokenIndexes[secondWordIndex];

      if (firstTokenIndex === undefined || secondTokenIndex === undefined) {
        continue;
      }

      for (let index = firstTokenIndex + 1; index < secondTokenIndex; index++) {
        if (/^\s+$/u.test(tokens[index] ?? "")) {
          lockedWhitespaceIndexes.add(index);
        }
      }
    }
  }

  const lockStartWordIndex = Math.max(wordTokenIndexes.length - wordCount, 0);
  const lockStartTokenIndex = wordTokenIndexes[lockStartWordIndex];
  const lockEndTokenIndex = wordTokenIndexes[wordTokenIndexes.length - 1];

  if (
    lockStartTokenIndex === undefined ||
    lockEndTokenIndex === undefined ||
    lockStartTokenIndex === lockEndTokenIndex
  ) {
    return text;
  }

  return tokens
    .map((token, index) => {
      const shouldLock =
        lockedWhitespaceIndexes.has(index) ||
        (index > lockStartTokenIndex && index < lockEndTokenIndex);

      if (!shouldLock) {
        return token;
      }

      if (!/^\s+$/u.test(token)) {
        return token;
      }

      if (preserveExistingNbsp && token.includes(NON_BREAKING_SPACE)) {
        return token;
      }

      return NON_BREAKING_SPACE;
    })
    .join("");
}
