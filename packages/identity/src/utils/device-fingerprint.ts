/**
 * Device fingerprinting and geolocation utilities for MFA recovery
 */

export interface DeviceFingerprint {
  userAgent: string;
  platform: string;
  language: string;
  screenResolution: string;
  timezone: string;
  browserName?: string;
  osName?: string;
}

export interface GeolocationInfo {
  country?: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
}

/**
 * Generate a device fingerprint from the browser
 */
export function generateDeviceFingerprint(): DeviceFingerprint {
  const userAgent = navigator.userAgent;
  // Use modern User-Agent Client Hints API with fallback to deprecated navigator.platform
  // See: https://developer.mozilla.org/en-US/docs/Web/API/NavigatorUAData
  const platform =
    (navigator as Navigator & { userAgentData?: { platform?: string } })
      .userAgentData?.platform || navigator.platform;
  const language = navigator.language;
  const screenResolution = `${screen.width}x${screen.height}`;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Simple browser detection
  let browserName: string | undefined;
  if (userAgent.includes("Chrome") && !userAgent.includes("Edg")) {
    browserName = "Chrome";
  } else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) {
    browserName = "Safari";
  } else if (userAgent.includes("Firefox")) {
    browserName = "Firefox";
  } else if (userAgent.includes("Edg")) {
    browserName = "Edge";
  }

  // Simple OS detection
  let osName: string | undefined;
  if (platform.includes("Win")) {
    osName = "Windows";
  } else if (platform.includes("Mac")) {
    osName = "macOS";
  } else if (platform.includes("Linux")) {
    osName = "Linux";
  } else if (platform.includes("iPhone") || platform.includes("iPad")) {
    osName = "iOS";
  } else if (userAgent.includes("Android")) {
    osName = "Android";
  }

  return {
    userAgent,
    platform,
    language,
    screenResolution,
    timezone,
    browserName,
    osName,
  };
}

/**
 * Get geolocation info from IP address (server-side)
 *
 * Note: This is a placeholder implementation. In production, integrate with a service like:
 * - ipapi.co: https://ipapi.co/{ipAddress}/json/
 * - ip-api.com: http://ip-api.com/json/{ipAddress}
 * - MaxMind GeoIP2: https://www.maxmind.com/en/geoip2-services-and-databases
 *
 * @param _ipAddress - The IP address to look up (currently unused)
 * @returns Geolocation information or null if unavailable
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
 * Get client IP address from request headers
 * Handles various proxy and CDN headers
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
 * Hash a string using SHA-256 (for storing recovery codes)
 * Uses the Web Crypto API
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
 * Generate a cryptographically secure random token
 */
export function generateSecureToken(length = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}
