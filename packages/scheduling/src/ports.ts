/**
 * Injected ports — the seams that keep this package framework- and DB-agnostic.
 *
 * The Microsoft Graph / Google clients never read environment variables, talk
 * to a database, or import a logger. Instead the host application (tcc-scheduler)
 * supplies a `SchedulingConfig`, a `TokenStore` backed by Supabase, a `Clock`,
 * a `Logger`, and (optionally) a `fetch` implementation. This makes the whole
 * kernel unit-testable with in-memory fakes.
 */

/** Static configuration for the calendar/meeting providers. */
export interface SchedulingConfig {
  microsoft: {
    clientId: string;
    clientSecret: string;
    /** Entra tenant GUID — never "common" for app-only flows. */
    tenantId: string;
    /** Object id of the licensed mailbox that organizes meetings. */
    organizerId: string;
  };
  google?: {
    clientId: string;
    clientSecret: string;
  };
  /** Secret used to derive the AES-256-GCM key for token encryption at rest. */
  encryptionSecret: string;
  /** Public base URL (no trailing slash) for OAuth redirects + webhook callbacks. */
  publicBaseUrl: string;
}

/** Wall-clock source. Injected so time-dependent logic is deterministic in tests. */
export interface Clock {
  /** Current time, epoch ms. */
  now(): number;
}

/** Minimal structured logger. */
export interface Logger {
  error(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  info?(message: string, context?: Record<string, unknown>): void;
}

/** A `fetch`-compatible function (global fetch by default; mockable in tests). */
export type FetchLike = (
  input: string,
  init?: RequestInit,
) => Promise<Response>;

export type CalendarProvider = "google" | "microsoft";
export type CalendarOwnerKind = "advisor" | "staff";

/** Identifies a single external-calendar connection in the host's store. */
export interface IntegrationKey {
  ownerKind: CalendarOwnerKind;
  ownerId: string;
  provider: CalendarProvider;
}

/** Decrypted OAuth credentials + sync state for one connection. */
export interface StoredIntegration {
  accessToken: string | null;
  refreshToken: string | null;
  /** Access-token expiry, epoch ms. */
  expiresAt: number | null;
  accountEmail: string | null;
  calendarId: string;
  /** Google incremental-sync token. */
  syncToken?: string | null;
  /** Google watch channel id. */
  webhookChannelId?: string | null;
  /** Google watch resource id. */
  webhookResourceId?: string | null;
  /** Microsoft Graph subscription id. */
  subscriptionId?: string | null;
  /** Webhook/subscription expiry, epoch ms. */
  webhookExpiresAt?: number | null;
}

/** Tokens to persist after an OAuth exchange or refresh. */
export interface TokenUpdate {
  accessToken: string;
  refreshToken?: string | null;
  expiresAt: number | null;
  accountEmail?: string | null;
}

/** Webhook/subscription state to persist after (re)subscribing. */
export interface WebhookUpdate {
  webhookChannelId?: string | null;
  webhookResourceId?: string | null;
  subscriptionId?: string | null;
  webhookExpiresAt?: number | null;
}

/**
 * Persistence port for external-calendar connections. Implemented in the host
 * app over the Supabase service-role client; this package only sees decrypted
 * values via this interface and never touches the database directly.
 */
export interface TokenStore {
  getIntegration(key: IntegrationKey): Promise<StoredIntegration | null>;
  saveTokens(key: IntegrationKey, update: TokenUpdate): Promise<void>;
  saveWebhook(key: IntegrationKey, update: WebhookUpdate): Promise<void>;
  saveSyncToken(key: IntegrationKey, syncToken: string | null): Promise<void>;
}

/** Default real-time clock. */
export const systemClock: Clock = {
  now: () => Date.now(),
};

/** No-op logger for when the host doesn't supply one. */
export const noopLogger: Logger = {
  error: () => {},
  warn: () => {},
  info: () => {},
};
