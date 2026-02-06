/**
 * URL Validation utilities for social media and general URLs.
 *
 * These validators work with Zod to validate URLs for various platforms.
 * They handle URLs with or without the protocol prefix (http:// or https://).
 *
 * @example
 * ```typescript
 * import { linkedinUrlSchema, facebookUrlSchema, createSocialUrlSchema } from "@caffeinebounce/shared-utils";
 * import { z } from "zod";
 *
 * // Use pre-built validators
 * const formSchema = z.object({
 *   linkedin: linkedinUrlSchema,
 *   facebook: facebookUrlSchema,
 * });
 *
 * // Or create custom validators
 * const tiktokUrlSchema = createSocialUrlSchema({
 *   name: "TikTok",
 *   hostnames: ["tiktok.com", "www.tiktok.com"],
 *   allowSubdomains: false,
 *   example: "https://tiktok.com/@your-company",
 * });
 * ```
 */
import { z } from "zod";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Configuration for creating a social URL validator.
 */
export interface SocialUrlSchemaConfig {
  /** Display name for error messages (e.g., "LinkedIn", "Facebook") */
  name: string;
  /** Valid hostnames for this platform (e.g., ["linkedin.com", "www.linkedin.com"]) */
  hostnames: string[];
  /** If true, allows subdomains like *.linkedin.com */
  allowSubdomains?: boolean;
  /** The base domain to check for subdomains (e.g., "linkedin.com") */
  baseDomain?: string;
  /** Example URL for error message (e.g., "https://linkedin.com/company/your-company") */
  example: string;
}

/**
 * Configuration for creating a social handle validator.
 */
export interface SocialHandleSchemaConfig {
  /** Display name for error messages (e.g., "Instagram", "X/Twitter") */
  name: string;
  /** Maximum length for the handle */
  maxLength: number;
  /** Regex pattern for valid characters */
  pattern: RegExp;
  /** Description of valid characters for error message */
  validCharsDescription: string;
}

// ---------------------------------------------------------------------------
// Helper Functions
// ---------------------------------------------------------------------------

/**
 * Ensures a URL has a protocol prefix, adding https:// if missing.
 */
function ensureProtocol(url: string): string {
  if (!url) return url;
  return url.startsWith("http://") || url.startsWith("https://")
    ? url
    : `https://${url}`;
}

/**
 * Safely parses a URL, returning null if invalid.
 */
function safeParseUrl(urlString: string): URL | null {
  try {
    return new URL(urlString);
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Factory Functions
// ---------------------------------------------------------------------------

/**
 * Creates a Zod schema for validating social media URLs.
 *
 * Features:
 * - Accepts URLs with or without protocol (http://, https://)
 * - Validates against specific hostnames for the platform
 * - Optionally allows subdomains (e.g., business.facebook.com)
 * - Returns helpful error messages with examples
 * - Empty strings are valid (use .min(1) or .refine() for required fields)
 *
 * @param config - Configuration for the validator
 * @returns A Zod string schema that validates URLs for the specified platform
 *
 * @example
 * ```typescript
 * const youtubeUrlSchema = createSocialUrlSchema({
 *   name: "YouTube",
 *   hostnames: ["youtube.com", "www.youtube.com", "youtu.be"],
 *   allowSubdomains: true,
 *   baseDomain: "youtube.com",
 *   example: "https://youtube.com/@your-channel",
 * });
 * ```
 */
export function createSocialUrlSchema(
  config: SocialUrlSchemaConfig,
): z.ZodEffects<z.ZodString, string, string> {
  const {
    name,
    hostnames,
    allowSubdomains = false,
    baseDomain,
    example,
  } = config;

  return z.string().refine(
    (val) => {
      // Empty values are valid (required validation done separately)
      if (!val) return true;

      const urlWithProtocol = ensureProtocol(val);
      const url = safeParseUrl(urlWithProtocol);

      if (!url) return false;

      const hostname = url.hostname.toLowerCase();

      // Check exact hostname matches
      if (hostnames.some((h) => hostname === h.toLowerCase())) {
        return true;
      }

      // Check subdomain matches if allowed
      if (allowSubdomains && baseDomain) {
        const normalizedBase = baseDomain.toLowerCase();
        if (hostname.endsWith(`.${normalizedBase}`)) {
          return true;
        }
      }

      return false;
    },
    {
      message: `Please enter a valid ${name} URL (e.g., ${example})`,
    },
  );
}

/**
 * Creates a Zod schema for validating social media handles (usernames).
 *
 * Features:
 * - Strips leading @ symbol before validation
 * - Validates max length
 * - Validates character pattern
 * - Empty strings are valid (use .min(1) or .refine() for required fields)
 *
 * @param config - Configuration for the validator
 * @returns A Zod string schema that validates handles for the specified platform
 *
 * @example
 * ```typescript
 * const tiktokHandleSchema = createSocialHandleSchema({
 *   name: "TikTok",
 *   maxLength: 24,
 *   pattern: /^[a-zA-Z0-9._]*$/,
 *   validCharsDescription: "letters, numbers, periods, underscores",
 * });
 * ```
 */
export function createSocialHandleSchema(
  config: SocialHandleSchemaConfig,
): z.ZodEffects<z.ZodString, string, string> {
  const { name, maxLength, pattern, validCharsDescription } = config;

  return z
    .string()
    .max(maxLength, `${name} handle must be at most ${maxLength} characters`)
    .refine(
      (val) => {
        if (!val) return true;
        // Remove @ if present
        const handle = val.replace(/^@/, "");
        return pattern.test(handle);
      },
      {
        message: `Invalid ${name} handle format (${validCharsDescription} only)`,
      },
    );
}

/**
 * Creates a generic URL schema that validates any properly formatted URL.
 *
 * Features:
 * - Accepts URLs with or without protocol
 * - Ensures URL has a valid hostname with at least one dot
 * - Allows localhost for development
 * - Empty strings are valid (use .min(1) or .refine() for required fields)
 *
 * @param errorMessage - Custom error message for invalid URLs
 * @returns A Zod string schema that validates general URLs
 *
 * @example
 * ```typescript
 * const websiteUrlSchema = createUrlSchema("Please enter a valid website URL");
 * ```
 */
export function createUrlSchema(
  errorMessage = "Please enter a valid URL",
): z.ZodEffects<z.ZodString, string, string> {
  return z.string().refine((val) => {
    if (!val) return true; // Empty is valid (handled by optional/required separately)

    const urlWithProtocol = ensureProtocol(val);
    const url = safeParseUrl(urlWithProtocol);

    if (!url) return false;

    // Must be a valid URL and have a hostname with at least one dot (e.g. example.com)
    // This prevents single words like "dscsdc" from being accepted
    // Exception: allow localhost for development
    return url.hostname.includes(".") || url.hostname === "localhost";
  }, errorMessage);
}

// ---------------------------------------------------------------------------
// Pre-built Validators
// ---------------------------------------------------------------------------

/**
 * Validates LinkedIn URLs.
 * Accepts: linkedin.com, www.linkedin.com, and *.linkedin.com subdomains.
 */
export const linkedinUrlSchema = createSocialUrlSchema({
  name: "LinkedIn",
  hostnames: ["linkedin.com", "www.linkedin.com"],
  allowSubdomains: true,
  baseDomain: "linkedin.com",
  example: "https://linkedin.com/company/your-company",
});

/**
 * Validates Facebook URLs.
 * Accepts: facebook.com, www.facebook.com, fb.com, www.fb.com, and subdomains.
 */
export const facebookUrlSchema = createSocialUrlSchema({
  name: "Facebook",
  hostnames: ["facebook.com", "www.facebook.com", "fb.com", "www.fb.com"],
  allowSubdomains: true,
  baseDomain: "facebook.com",
  example: "https://facebook.com/your-company",
});

/**
 * Validates Pinterest URLs.
 * Accepts: pinterest.com, www.pinterest.com, and *.pinterest.com subdomains.
 */
export const pinterestUrlSchema = createSocialUrlSchema({
  name: "Pinterest",
  hostnames: ["pinterest.com", "www.pinterest.com"],
  allowSubdomains: true,
  baseDomain: "pinterest.com",
  example: "https://pinterest.com/your-company",
});

/**
 * Validates X/Twitter URLs.
 * Accepts: x.com, www.x.com, twitter.com, www.twitter.com.
 */
export const xUrlSchema = createSocialUrlSchema({
  name: "X/Twitter",
  hostnames: ["x.com", "www.x.com", "twitter.com", "www.twitter.com"],
  allowSubdomains: false,
  example: "https://x.com/your-handle",
});

/**
 * Validates YouTube URLs.
 * Accepts: youtube.com, www.youtube.com, youtu.be, and *.youtube.com subdomains.
 */
export const youtubeUrlSchema = createSocialUrlSchema({
  name: "YouTube",
  hostnames: ["youtube.com", "www.youtube.com", "youtu.be"],
  allowSubdomains: true,
  baseDomain: "youtube.com",
  example: "https://youtube.com/@your-channel",
});

/**
 * Validates TikTok URLs.
 * Accepts: tiktok.com, www.tiktok.com.
 */
export const tiktokUrlSchema = createSocialUrlSchema({
  name: "TikTok",
  hostnames: ["tiktok.com", "www.tiktok.com"],
  allowSubdomains: false,
  example: "https://tiktok.com/@your-handle",
});

/**
 * Validates Instagram handles (username format, not full URLs).
 * Rules: max 30 chars, letters, numbers, periods, underscores only.
 */
export const instagramHandleSchema = createSocialHandleSchema({
  name: "Instagram",
  maxLength: 30,
  pattern: /^[a-zA-Z0-9._]*$/,
  validCharsDescription: "letters, numbers, periods, underscores",
});

/**
 * Validates X/Twitter handles (username format, not full URLs).
 * Rules: max 15 chars, letters, numbers, underscores only.
 */
export const xHandleSchema = createSocialHandleSchema({
  name: "X/Twitter",
  maxLength: 15,
  pattern: /^[a-zA-Z0-9_]*$/,
  validCharsDescription: "letters, numbers, underscores",
});

/**
 * Validates TikTok handles (username format, not full URLs).
 * Rules: max 24 chars, letters, numbers, periods, underscores only.
 */
export const tiktokHandleSchema = createSocialHandleSchema({
  name: "TikTok",
  maxLength: 24,
  pattern: /^[a-zA-Z0-9._]*$/,
  validCharsDescription: "letters, numbers, periods, underscores",
});

/**
 * Validates general website URLs.
 * Accepts any URL with a valid hostname containing at least one dot.
 */
export const websiteUrlSchema = createUrlSchema(
  "Please enter a valid website URL",
);

// ---------------------------------------------------------------------------
// Environment & Origin Detection
// ---------------------------------------------------------------------------

/**
 * List of domains that are considered "preview" environments.
 * These are deployment platforms that typically use different URLs than production.
 *
 * Note: This list is intentionally conservative. Teams using these domains for
 * production should either use custom domains or set FORCE_PRODUCTION_ORIGIN=true
 * in their environment to override preview detection.
 */
const PREVIEW_DOMAINS = [
  "onrender.com", // Render PR previews (e.g., app-pr-123.onrender.com)
  "vercel.app", // Vercel previews (production typically uses custom domains)
  "netlify.app", // Netlify previews
  "railway.app", // Railway previews
] as const;

/**
 * Strip port from hostname, handling both IPv4/domain and IPv6 formats.
 *
 * Note: This function assumes IPv6 addresses with ports use bracket notation
 * (e.g., "[::1]:3000"), which is the standard format returned by
 * `window.location.hostname` and HTTP Host headers. Raw IPv6 with port
 * like "::1:3000" is ambiguous and not handled.
 *
 * @example
 * ```typescript
 * stripPort("localhost:3000") // "localhost"
 * stripPort("127.0.0.1:3000") // "127.0.0.1"
 * stripPort("[::1]:3000") // "::1"
 * ```
 */
function stripPort(hostname: string): string {
  // Handle IPv6 with brackets: [::1]:3000 -> ::1
  if (hostname.startsWith("[")) {
    const bracketEnd = hostname.indexOf("]");
    if (bracketEnd > 0) {
      return hostname.slice(1, bracketEnd);
    }
  }

  // Handle IPv6 without port (contains multiple colons)
  // Assumes standard bracket notation is used when a port is present
  if ((hostname.match(/:/g) || []).length > 1) {
    return hostname;
  }

  // Handle IPv4/domain with optional port: localhost:3000 -> localhost
  return hostname.split(":")[0];
}

/**
 * Check if the hostname is a Render preview/PR deployment.
 * These domains don't support subdomains, so subdomain routing should be skipped.
 *
 * @example
 * ```typescript
 * isRenderPreviewDomain("compass-pr-194.onrender.com") // true
 * isRenderPreviewDomain("thecapitalcompass.ai") // false
 * ```
 */
export function isRenderPreviewDomain(hostname: string): boolean {
  const normalized = hostname.toLowerCase();
  const hostWithoutPort = stripPort(normalized);

  if (!hostWithoutPort.endsWith(".onrender.com")) {
    return false;
  }

  const suffix = ".onrender.com";
  const withoutSuffix = hostWithoutPort.slice(0, -suffix.length); // e.g., "compass-pr-194" or "app.compass"
  const labels = withoutSuffix.split(".").filter(Boolean);

  // No labels before the suffix is not a valid preview domain shape
  if (labels.length === 0) {
    return false;
  }

  // A single label before `.onrender.com` is treated as a preview domain
  // e.g., "compass-pr-194.onrender.com" or "application.onrender.com"
  if (labels.length === 1) {
    return true;
  }

  // Multiple labels before `.onrender.com`
  // If the first label is "app" or "admin" (e.g., app.compass.onrender.com),
  // treat this as a production-style domain, not a preview
  const [firstLabel] = labels;
  if (firstLabel === "app" || firstLabel === "admin") {
    return false;
  }

  // Other multi-label domains under *.onrender.com are considered preview
  return true;
}

/**
 * Check if the current hostname represents a preview/staging environment.
 *
 * Preview environments are detected by:
 * - Local development (localhost, 127.0.0.1, ::1)
 * - Render PR preview domains (*.onrender.com)
 * - Other preview platforms (Vercel, Netlify, Railway)
 *
 * @param hostname - The hostname to check (from `window.location.hostname` or `request.headers.get('host')`)
 * @returns true if this is a preview/non-production environment
 *
 * @example
 * ```typescript
 * // Client-side
 * if (isPreviewEnvironment(window.location.hostname)) {
 *   // Use window.location.origin instead of env vars
 * }
 *
 * // Server-side (in API route)
 * const host = request.headers.get('host') || '';
 * if (isPreviewEnvironment(host)) {
 *   // Use request origin instead of env vars
 * }
 * ```
 */
export function isPreviewEnvironment(hostname: string): boolean {
  const normalized = hostname.toLowerCase();
  const hostWithoutPort = stripPort(normalized);

  // Local development
  if (
    hostWithoutPort === "localhost" ||
    hostWithoutPort === "127.0.0.1" ||
    hostWithoutPort === "::1" ||
    hostWithoutPort.endsWith(".local")
  ) {
    return true;
  }

  // Check against known preview domains
  for (const domain of PREVIEW_DOMAINS) {
    if (hostWithoutPort.endsWith(`.${domain}`)) {
      return true;
    }
  }

  return false;
}

/**
 * Get the app origin for redirects and URL construction.
 *
 * This function solves a common problem with preview environments:
 * - Environment variables like `NEXT_PUBLIC_SITE_URL` are set to production URLs
 * - In preview environments (Render PR, Vercel preview, etc.), we need to use the actual origin
 * - The fallback `env || window.location.origin` doesn't work because env IS set (to production)
 *
 * **Client-side usage** (React components):
 * ```typescript
 * const origin = getClientOrigin(); // or getClientOrigin('NEXT_PUBLIC_APP_URL')
 * ```
 *
 * **Server-side usage** (API routes):
 * ```typescript
 * const host = request.headers.get('host') || '';
 * const protocol = request.headers.get('x-forwarded-proto') || 'https';
 * const origin = getServerOrigin(host, protocol); // or getServerOrigin(host, protocol, 'NEXT_PUBLIC_APP_URL')
 * ```
 *
 * @param envVarName - Optional env var name to use for production (defaults to NEXT_PUBLIC_SITE_URL)
 * @returns The origin URL appropriate for the current environment
 */
export function getClientOrigin(envVarName?: string): string {
  if (typeof window === "undefined") {
    // SSR context - use env var
    const envValue = envVarName
      ? process.env[envVarName]
      : process.env.NEXT_PUBLIC_SITE_URL;

    if (!envValue) {
      // In SSR without env var, we can't determine origin
      // Log warning and return a safe placeholder that won't crash URL parsing
      // but will be obviously wrong if used
      console.warn(
        `[getClientOrigin] Missing ${envVarName || "NEXT_PUBLIC_SITE_URL"} env var during SSR. ` +
          "Ensure NEXT_PUBLIC_* vars are set at build time.",
      );
      return "https://localhost:3000";
    }
    return envValue;
  }

  const hostname = window.location.hostname;

  // For preview environments, always use actual origin (ignore env vars)
  if (isPreviewEnvironment(hostname)) {
    return window.location.origin;
  }

  // Production: prefer env var if set
  // Note: process.env access here relies on build-time env injection
  // from the bundler (e.g., Next.js, Vite). In a plain browser environment
  // without such tooling, process.env will be undefined.
  const envValue = envVarName
    ? process.env[envVarName]
    : process.env.NEXT_PUBLIC_SITE_URL;

  if (envValue) {
    return envValue.replace(/\/$/, ""); // Remove trailing slash
  }

  // Fallback to current origin
  return window.location.origin;
}

/**
 * Get the app origin for server-side redirects and URL construction.
 *
 * @param host - The host header from the request (e.g., `request.headers.get('host')`)
 * @param protocol - The protocol (e.g., `request.headers.get('x-forwarded-proto') || 'https'`)
 * @param envVarName - Optional env var name to use for production
 * @returns The origin URL appropriate for the current environment
 *
 * @example
 * ```typescript
 * export async function GET(request: NextRequest) {
 *   const host = request.headers.get('host') || '';
 *   const protocol = request.headers.get('x-forwarded-proto') || 'https';
 *   const origin = getServerOrigin(host, protocol, 'NEXT_PUBLIC_APP_URL');
 *   // origin will be correct for both preview and production
 * }
 * ```
 */
export function getServerOrigin(
  host: string,
  protocol = "https",
  envVarName?: string,
): string {
  // For preview environments, always use actual request origin
  if (isPreviewEnvironment(host)) {
    return `${protocol}://${host}`;
  }

  // Production: prefer env var if set
  const envValue = envVarName
    ? process.env[envVarName]
    : process.env.NEXT_PUBLIC_SITE_URL;

  if (envValue) {
    return envValue.replace(/\/$/, "");
  }

  // Fallback to request origin
  return `${protocol}://${host}`;
}
