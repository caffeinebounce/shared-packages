import { createHmac, timingSafeEqual } from "node:crypto";
import type { EmailThemeConfig } from "./themes";

export type UnsubscribeTokenInput = {
  email: string;
  secret: string;
};

export type VerifyUnsubscribeTokenInput = {
  email: string;
  token: string;
  secret?: string;
};

export type UnsubscribeHeadersConfig = Pick<
  EmailThemeConfig,
  "siteUrl" | "unsubscribeUrl"
> & {
  unsubscribeSecret: string;
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function normalizeSecret(secret?: string): string {
  const normalizedSecret = secret?.trim();
  if (!normalizedSecret) {
    throw new Error("unsubscribeSecret is required for unsubscribe tokens");
  }

  return normalizedSecret;
}

export function generateUnsubscribeToken({
  email,
  secret,
}: UnsubscribeTokenInput): string {
  const normalizedEmail = normalizeEmail(email);
  const normalizedSecret = normalizeSecret(secret);

  return createHmac("sha256", normalizedSecret)
    .update(normalizedEmail)
    .digest("hex");
}

export function verifyUnsubscribeToken({
  email,
  token,
  secret,
}: VerifyUnsubscribeTokenInput): boolean {
  const normalizedEmail = normalizeEmail(email);
  let normalizedSecret: string;

  try {
    normalizedSecret = normalizeSecret(secret);
  } catch {
    return false;
  }

  const expected = Buffer.from(
    generateUnsubscribeToken({
      email: normalizedEmail,
      secret: normalizedSecret,
    }),
    "utf8",
  );
  const received = Buffer.from(token, "utf8");

  if (expected.length !== received.length) {
    return false;
  }

  return timingSafeEqual(expected, received);
}

export function buildUnsubscribeUrl({
  baseUrl,
  email,
  token,
}: {
  baseUrl: string;
  email: string;
  token: string;
}): string {
  return `${baseUrl}?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`;
}

export function buildUnsubscribeUrlFromConfig(
  config: Pick<EmailThemeConfig, "siteUrl" | "unsubscribeUrl">,
  email: string,
  token: string,
): string {
  const baseUrl = config.unsubscribeUrl || `${config.siteUrl}/unsubscribe`;
  return buildUnsubscribeUrl({ baseUrl, email, token });
}

export function getUnsubscribeHeadersFromConfig(
  config: UnsubscribeHeadersConfig,
  email: string,
): Record<string, string> {
  const token = generateUnsubscribeToken({
    email,
    secret: config.unsubscribeSecret,
  });

  return {
    "List-Unsubscribe": `<${buildUnsubscribeUrlFromConfig(config, email, token)}>`,
    "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
  };
}

export function parseListUnsubscribeHeader(
  value?: string | null,
): string | undefined {
  if (!value) return undefined;
  const start = value.indexOf("<");
  if (start === -1) return undefined;

  const end = value.indexOf(">", start + 1);
  if (end === -1 || end === start + 1) return undefined;

  return value.slice(start + 1, end);
}
