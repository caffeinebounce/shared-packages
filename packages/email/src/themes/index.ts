import React from "react";
import { getUnsubscribeHeadersFromConfig } from "../unsubscribe";
import { compassThemeTokens } from "./compass";
import { factoryThemeTokens } from "./factory";
import { tccThemeTokens } from "./tcc";
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
  /** Default logo alignment. Default: "center" */
  logoAlign?: "left" | "center" | "right";
  /** Faint watermark logo URL (rendered as low-opacity background image). Works best with a pre-faded PNG. */
  watermarkUrl?: string;
  /** Defaults to {siteUrl}/unsubscribe */
  unsubscribeUrl?: string;
  emailPreferencesUrl?: string;
  /** Secret for HMAC-signed unsubscribe tokens */
  unsubscribeSecret?: string;
}

export type ThemeName = "compass" | "factory" | "tcc" | "custom";

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

export async function getUnsubscribeHeaders(
  config: EmailThemeConfig,
  email: string,
): Promise<Record<string, string>> {
  return getUnsubscribeHeadersFromConfig(config, email);
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
  } else if (theme === "tcc") {
    baseTokens = tccThemeTokens;
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
      return getUnsubscribeHeadersFromConfig(config, email);
    },
  };
}
