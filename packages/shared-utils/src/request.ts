/**
 * Server-side request utilities for handling HTTP requests.
 *
 * @module request
 */

/**
 * Geolocation information derived from an IP address.
 */
export interface GeolocationInfo {
  /** Country name or code */
  country?: string;
  /** Region/state/province */
  region?: string;
  /** City name */
  city?: string;
  /** Latitude coordinate */
  latitude?: number;
  /** Longitude coordinate */
  longitude?: number;
}

/**
 * Get client IP address from request headers.
 * Handles various proxy and CDN headers in order of preference.
 *
 * @param headers - Request headers object
 * @returns Client IP address, or null if not found
 *
 * @example
 * ```typescript
 * // In an API route handler
 * const ip = getClientIP(request.headers);
 * console.log(ip); // "203.0.113.42"
 * ```
 */
export function getClientIP(headers: Headers): string | null {
  // Try various headers in order of preference
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  const realIP = headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }

  const cfConnectingIP = headers.get("cf-connecting-ip");
  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  return null;
}

/**
 * Get geolocation info from an IP address (server-side).
 *
 * Note: This is a placeholder implementation. In production, integrate with a service like:
 * - ipapi.co: https://ipapi.co/{ipAddress}/json/
 * - ip-api.com: http://ip-api.com/json/{ipAddress}
 * - MaxMind GeoIP2: https://www.maxmind.com/en/geoip2-services-and-databases
 *
 * @param _ipAddress - The IP address to look up (currently unused)
 * @returns Geolocation information or null if unavailable
 *
 * @example
 * ```typescript
 * const geo = await getGeolocationFromIP("203.0.113.42");
 * console.log(geo?.city); // "San Francisco"
 * ```
 */
export async function getGeolocationFromIP(
  _ipAddress: string,
): Promise<GeolocationInfo | null> {
  // TODO: In production, use a real geolocation API
  // Example: const response = await fetch(`https://ipapi.co/${ipAddress}/json/`);
  // For now, return null to avoid external dependencies
  return null;
}

/**
 * Hash a string using SHA-256.
 * Uses the Web Crypto API for secure hashing.
 *
 * @param str - String to hash
 * @returns Hexadecimal hash string
 *
 * @example
 * ```typescript
 * const hash = await hashString("secret-code");
 * // Returns a 64-character SHA-256 hex hash
 * ```
 */
export async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}

/**
 * Generate a cryptographically secure random token.
 *
 * @param length - Length of the token in bytes (default: 32, resulting in 64 hex characters)
 * @returns Hexadecimal token string
 *
 * @example
 * ```typescript
 * const token = generateSecureToken(32);
 * // "a1b2c3d4e5f6..." (64 characters)
 * ```
 */
export function generateSecureToken(length = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}
