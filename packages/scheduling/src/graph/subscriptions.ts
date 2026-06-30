/**
 * Microsoft Graph change-notification subscriptions for transcript/recording
 * readiness.
 *
 * We use tenant-wide "basic" notifications on
 * `communications/onlineMeetings/getAllTranscripts` /
 * `...getAllRecordings` (one long-lived subscription each, far fewer to renew
 * than one-per-meeting). Basic notifications carry only resource identifiers
 * (no encrypted payload), which we parse and then fetch via the artifacts API —
 * avoiding the encryption-certificate setup that rich notifications require.
 */
import type { GraphContext } from "./meetings";

export type ArtifactSubscriptionKind = "transcripts" | "recordings";

export interface SubscriptionResource {
  id: string;
  resource: string;
  expirationDateTime: string;
  clientState?: string;
}

export interface CreateSubscriptionInput {
  kind: ArtifactSubscriptionKind;
  notificationUrl: string;
  /** Echoed back on every notification; verify it to reject spoofed callbacks. */
  clientState: string;
  /** Subscription expiry, epoch ms. Capped to the Graph maximum for this resource. */
  expiresAt: number;
  lifecycleNotificationUrl?: string;
}

const RESOURCE: Record<ArtifactSubscriptionKind, string> = {
  transcripts: "communications/onlineMeetings/getAllTranscripts",
  recordings: "communications/onlineMeetings/getAllRecordings",
};

/** Graph caps these resources near ~3 days; clamp the requested expiry. */
const MAX_LIFETIME_MS = 3 * 24 * 60 * 60 * 1000 - 60_000;

export function clampExpiry(now: number, requested: number): number {
  return Math.min(requested, now + MAX_LIFETIME_MS);
}

export function buildSubscriptionBody(
  input: CreateSubscriptionInput,
  now: number,
) {
  return {
    changeType: "created",
    notificationUrl: input.notificationUrl,
    lifecycleNotificationUrl: input.lifecycleNotificationUrl,
    resource: RESOURCE[input.kind],
    expirationDateTime: new Date(
      clampExpiry(now, input.expiresAt),
    ).toISOString(),
    clientState: input.clientState,
  };
}

export async function createSubscription(
  ctx: GraphContext,
  input: CreateSubscriptionInput,
  now: number,
): Promise<SubscriptionResource> {
  return ctx.client.request<SubscriptionResource>("/subscriptions", {
    method: "POST",
    version: "v1.0",
    body: buildSubscriptionBody(input, now),
  });
}

export async function renewSubscription(
  ctx: GraphContext,
  subscriptionId: string,
  expiresAt: number,
  now: number,
): Promise<SubscriptionResource> {
  return ctx.client.request<SubscriptionResource>(
    `/subscriptions/${subscriptionId}`,
    {
      method: "PATCH",
      version: "v1.0",
      body: {
        expirationDateTime: new Date(clampExpiry(now, expiresAt)).toISOString(),
      },
    },
  );
}

export async function deleteSubscription(
  ctx: GraphContext,
  subscriptionId: string,
): Promise<void> {
  await ctx.client.request(`/subscriptions/${subscriptionId}`, {
    method: "DELETE",
    version: "v1.0",
  });
}

export interface ParsedArtifactNotification {
  onlineMeetingId: string;
  artifactId: string;
  kind: "transcript" | "recording";
}

/**
 * Parse a notification `resource` string into its meeting + artifact ids, e.g.
 * `communications/onlineMeetings('MSo...')/transcripts('abc==')`.
 * Returns null if it doesn't match the expected artifact shape.
 */
export function parseArtifactNotificationResource(
  resource: string,
): ParsedArtifactNotification | null {
  const match = resource.match(
    /onlineMeetings\('([^']+)'\)\/(transcripts|recordings)\('([^']+)'\)/,
  );
  if (!match) return null;
  return {
    onlineMeetingId: match[1],
    kind: match[2] === "transcripts" ? "transcript" : "recording",
    artifactId: match[3],
  };
}
