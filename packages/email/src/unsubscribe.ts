import { createHmac, timingSafeEqual } from "node:crypto";
import type { EmailThemeConfig } from "./themes";

export type UnsubscribeTokenInput = {
  email: string;
  secret?: string;
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function toUrlSafeBase64(value: string): string {
  return Buffer.from(value, "utf8").toString("base64url");
}

function fromUrlSafeBase64(value: string): string | null {
  try {
    return Buffer.from(value, "base64url").toString("utf8");
  } catch {
    return null;
  }
}

export function generateUnsubscribeToken({
  email,
  secret,
}: UnsubscribeTokenInput): string {
  const normalizedEmail = normalizeEmail(email);

  if (!secret) {
    return toUrlSafeBase64(normalizedEmail);
  }

  return createHmac("sha256", secret).update(normalizedEmail).digest("hex");
}

export function verifyUnsubscribeToken({
  email,
  token,
  secret,
}: UnsubscribeTokenInput & { token: string }): boolean {
  const normalizedEmail = normalizeEmail(email);

  if (!secret) {
    const decoded = fromUrlSafeBase64(token);
    return decoded === normalizedEmail;
  }

  const expected = Buffer.from(
    generateUnsubscribeToken({ email: normalizedEmail, secret }),
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
  config: Pick<
    EmailThemeConfig,
    "siteUrl" | "unsubscribeUrl" | "unsubscribeSecret"
  >,
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
  const match = value.match(/<([^>]+)>/);
  return match?.[1];
}
