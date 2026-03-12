import React from "react";
import { compassThemeTokens } from "./compass";
import { factoryThemeTokens } from "./factory";
import { AccountApproved } from "./templates/AccountApproved";
import { Confirmation } from "./templates/Confirmation";
import { MagicLink } from "./templates/MagicLink";
import { Notification } from "./templates/Notification";
import { PasswordReset } from "./templates/PasswordReset";
import { Welcome } from "./templates/Welcome";
import type { EmailThemeTokens } from "./tokens";

export type { EmailThemeTokens } from "./tokens";

export type EmailCategory = "transactional" | "marketing";

export interface EmailThemeConfig {
  appName: string;
  companyName: string;
  /** REQUIRED — CAN-SPAM physical mailing address */
  address: string;
  accentColor: string;
  siteUrl: string;
  /** Full/wide logo URL (used when logoMode="full") */
  logoUrl?: string;
  /** Square logo/icon URL (used when logoMode="square") */
  logoSquareUrl?: string;
  /** Default logo display mode. Default: "square" */
  logoMode?: "square" | "full";
  /** Defaults to {siteUrl}/unsubscribe */
  unsubscribeUrl?: string;
  emailPreferencesUrl?: string;
  /** Secret for HMAC-signed unsubscribe tokens */
  unsubscribeSecret?: string;
}

export type ThemeName = "compass" | "factory" | "custom";

export interface CreateEmailThemeOptions {
  theme: ThemeName;
  config: EmailThemeConfig;
  /** Override individual tokens */
  tokens?: Partial<EmailThemeTokens>;
}

export interface EmailThemeResult {
  config: EmailThemeConfig;
  tokens: EmailThemeTokens;
  Confirmation: React.FC<{ confirmUrl: string; logoMode?: "square" | "full" }>;
  Welcome: React.FC<{ name?: string; logoMode?: "square" | "full" }>;
  AccountApproved: React.FC<{
    name?: string;
    ctaUrl?: string;
    ctaText?: string;
    logoMode?: "square" | "full";
  }>;
  PasswordReset: React.FC<{ resetUrl: string; logoMode?: "square" | "full" }>;
  MagicLink: React.FC<{ magicLinkUrl: string; logoMode?: "square" | "full" }>;
  Notification: React.FC<{
    title: string;
    body: string;
    ctaUrl?: string;
    ctaText?: string;
    email?: string;
    logoMode?: "square" | "full";
  }>;
  getUnsubscribeHeaders: (email: string) => Record<string, string>;
}

// ---------------------------------------------------------------------------
// Unsubscribe token helpers
// ---------------------------------------------------------------------------

async function generateUnsubscribeTokenAsync(
  email: string,
  secret?: string,
): Promise<string> {
  if (!secret) {
    return btoa(email);
  }
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, enc.encode(email));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function getUnsubscribeHeaders(
  config: EmailThemeConfig,
  email: string,
): Promise<Record<string, string>> {
  const token = await generateUnsubscribeTokenAsync(
    email,
    config.unsubscribeSecret,
  );
  const base = config.unsubscribeUrl || `${config.siteUrl}/unsubscribe`;
  const url = `${base}?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`;
  return {
    "List-Unsubscribe": `<${url}>`,
    "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
  };
}

// ---------------------------------------------------------------------------
// createEmailTheme
// ---------------------------------------------------------------------------

export function createEmailTheme(
  options: CreateEmailThemeOptions,
): EmailThemeResult {
  const { theme, config, tokens: tokenOverrides } = options;

  let baseTokens: EmailThemeTokens;
  if (theme === "factory") {
    baseTokens = factoryThemeTokens;
  } else if (theme === "compass") {
    baseTokens = compassThemeTokens;
  } else {
    // "custom" — caller must supply tokens; start from compass as fallback base
    baseTokens = compassThemeTokens;
  }

  // Merge tokens: base → accent override from config → caller overrides
  const tokens: EmailThemeTokens = {
    ...baseTokens,
    accentColor: config.accentColor,
    ...(tokenOverrides || {}),
  };

  return {
    config,
    tokens,

    Confirmation: ({ confirmUrl, logoMode }) =>
      React.createElement(Confirmation, {
        confirmUrl,
        logoMode,
        tokens,
        config,
      }),

    Welcome: ({ name, logoMode } = {}) =>
      React.createElement(Welcome, { name, logoMode, tokens, config }),

    AccountApproved: ({ name, ctaUrl, ctaText, logoMode } = {}) =>
      React.createElement(AccountApproved, {
        name,
        ctaUrl,
        ctaText,
        logoMode,
        tokens,
        config,
      }),

    PasswordReset: ({ resetUrl, logoMode }) =>
      React.createElement(PasswordReset, {
        resetUrl,
        logoMode,
        tokens,
        config,
      }),

    MagicLink: ({ magicLinkUrl, logoMode }) =>
      React.createElement(MagicLink, {
        magicLinkUrl,
        logoMode,
        tokens,
        config,
      }),

    Notification: ({ title, body, ctaUrl, ctaText, email, logoMode }) =>
      React.createElement(Notification, {
        title,
        body,
        ctaUrl,
        ctaText,
        email,
        logoMode,
        tokens,
        config,
      }),

    getUnsubscribeHeaders: (email: string) => {
      // Returns a promise-wrapped object for sync callers.
      // For async usage, call the exported getUnsubscribeHeaders() directly.
      const base = config.unsubscribeUrl || `${config.siteUrl}/unsubscribe`;
      const token = btoa(email); // sync fallback (no secret)
      const url = `${base}?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`;
      return {
        "List-Unsubscribe": `<${url}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      };
    },
  };
}
