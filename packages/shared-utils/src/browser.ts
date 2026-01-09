/**
 * Browser-related utilities for client-side operations.
 *
 * @module browser
 */

/**
 * Device fingerprint information collected from the browser.
 * Used for security features like device recognition and MFA recovery.
 */
export interface DeviceFingerprint {
  /** Full user agent string */
  userAgent: string;
  /** Platform identifier (e.g., "MacIntel", "Win32") */
  platform: string;
  /** Browser language preference */
  language: string;
  /** Screen dimensions in "WIDTHxHEIGHT" format */
  screenResolution: string;
  /** IANA timezone identifier */
  timezone: string;
  /** Detected browser name (Chrome, Safari, Firefox, Edge) */
  browserName?: string;
  /** Detected operating system name */
  osName?: string;
}

/**
 * Generate a device fingerprint from the browser environment.
 * Collects various browser properties for device identification.
 *
 * Note: This should only be called in a browser environment.
 *
 * @returns Device fingerprint object
 *
 * @example
 * ```typescript
 * const fingerprint = generateDeviceFingerprint();
 * console.log(fingerprint.browserName); // "Chrome"
 * console.log(fingerprint.osName); // "macOS"
 * ```
 */
export function generateDeviceFingerprint(): DeviceFingerprint {
  const userAgent = navigator.userAgent;
  const platform = navigator.platform;
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
