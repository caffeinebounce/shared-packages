import { isPreviewEnvironment } from "@caffeinebounce/shared-utils";
import type { OAuthProvider } from "../../types";

const warnedSupabaseRedirectOrigins = new Set<string>();

type OAuthSignInOptions = {
  redirectTo: string;
  scopes?: string;
  skipBrowserRedirect?: boolean;
};

/**
 * Sanitize error messages to hide internal/technical details from users.
 * Returns a user-friendly message for known error patterns.
 */
export function sanitizeAuthError(message: string): string {
  const lowerMessage = message.toLowerCase();

  // User already exists - common signup error
  if (
    lowerMessage.includes("user already registered") ||
    lowerMessage.includes("already registered") ||
    lowerMessage.includes("already exists") ||
    lowerMessage.includes("email already") ||
    lowerMessage.includes("duplicate")
  ) {
    return "An account with this email already exists. Please sign in instead.";
  }

  // Invalid credentials
  if (
    lowerMessage.includes("invalid login credentials") ||
    lowerMessage.includes("invalid credentials") ||
    lowerMessage.includes("wrong password") ||
    lowerMessage.includes("incorrect password")
  ) {
    return "Invalid email or password. Please try again.";
  }

  // Known user-friendly errors - pass through
  if (
    lowerMessage.includes("invalid email") ||
    lowerMessage.includes("password")
  ) {
    return message;
  }

  // Email format error
  if (message === "The string did not match the expected pattern.") {
    return "Please check your email address format and try again.";
  }

  // Rate limiting
  if (
    lowerMessage.includes("rate limit") ||
    lowerMessage.includes("too many requests") ||
    lowerMessage.includes("try again later")
  ) {
    return "Too many attempts. Please wait a moment and try again.";
  }

  // Internal/technical errors - hide details
  if (
    lowerMessage.includes("hook") ||
    lowerMessage.includes("authorization") ||
    lowerMessage.includes("token") ||
    lowerMessage.includes("internal") ||
    lowerMessage.includes("server") ||
    lowerMessage.includes("database") ||
    lowerMessage.includes("connection")
  ) {
    return "An error occurred. Please try again.";
  }

  // Default fallback for any other unrecognized errors
  return "An error occurred. Please try again.";
}

/**
 * Sanitize signup-specific errors with context-appropriate messages.
 */
export function sanitizeSignupError(message: string): string {
  const sanitized = sanitizeAuthError(message);
  // Replace generic message with signup-specific one
  if (sanitized === "An error occurred. Please try again.") {
    return "An error occurred during sign up. Please try again.";
  }
  return sanitized;
}

/**
 * Sanitize signin-specific errors with context-appropriate messages.
 */
export function sanitizeSigninError(message: string): string {
  const sanitized = sanitizeAuthError(message);
  // Replace generic message with signin-specific one
  if (sanitized === "An error occurred. Please try again.") {
    return "An error occurred during sign in. Please try again.";
  }
  return sanitized;
}

/**
 * Build OAuth callback redirect URL anchored to the active browser origin.
 */
export function buildOAuthRedirectTo(origin: string, nextPath: string): string {
  const siteUrl = origin.replace(/\/$/, "");
  return `${siteUrl}/callback?next=${encodeURIComponent(nextPath)}`;
}

export function buildOAuthSignInOptions(
  provider: OAuthProvider,
  redirectTo: string,
  options: Omit<OAuthSignInOptions, "redirectTo" | "scopes"> = {},
): OAuthSignInOptions {
  return {
    redirectTo,
    ...(provider === "azure" ? { scopes: "email" } : {}),
    ...options,
  };
}

/**
 * Warn once per origin when preview/local auth redirects also need a Supabase
 * redirect allowlist entry.
 */
export function warnAboutSupabaseRedirectAllowlist(origin: string): void {
  const normalizedOrigin = origin.replace(/\/$/, "");

  let hostname = "";
  try {
    hostname = new URL(normalizedOrigin).host;
  } catch {
    return;
  }

  if (!isPreviewEnvironment(hostname)) {
    return;
  }

  if (warnedSupabaseRedirectOrigins.has(normalizedOrigin)) {
    return;
  }

  warnedSupabaseRedirectOrigins.add(normalizedOrigin);

  console.warn(
    `[identity] Supabase redirect allowlist reminder: add "${normalizedOrigin}/**" to Supabase Auth > URL Configuration > Additional Redirect URLs. The auth components already use the active origin for callbacks, but Supabase must allow that origin too or OAuth/email flows can bounce to another host.`,
  );
}

/**
 * Clear stale PKCE (Proof Key for Code Exchange) state from localStorage.
 *
 * Supabase stores PKCE code verifiers in localStorage with keys containing
 * "-code-verifier". These can become stale after sign-out and cause
 * "invalid session" errors on subsequent OAuth attempts.
 *
 * This function should be called before initiating a new OAuth flow.
 */
export function clearStalePKCEState(): void {
  if (typeof window === "undefined") return;

  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.includes("-code-verifier")) {
        keysToRemove.push(key);
      }
    }
    for (const key of keysToRemove) {
      localStorage.removeItem(key);
    }
  } catch {
    // Ignore storage access errors (e.g., in private browsing mode)
  }
}
