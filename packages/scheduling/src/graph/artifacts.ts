/**
 * Transcript & recording capture, plus deterministic routing to a cohort company.
 *
 * Routing is *not* inference: the booking row recorded `online_meeting_id →
 * company_id` at creation time, so `routeArtifact` is a pure lookup. A meeting
 * with no matching booking is filed under an `_unassigned` bucket and flagged
 * for manual triage (never guessed).
 */
import type { GraphContext } from "./meetings";
import type { RecordingRef, TranscriptRef } from "./types";

interface GraphList<T> {
  value: T[];
}

/** List transcripts available for a meeting. */
export async function listTranscripts(
  ctx: GraphContext,
  organizerId: string,
  onlineMeetingId: string,
): Promise<TranscriptRef[]> {
  const res = await ctx.client.request<
    GraphList<{ id: string; createdDateTime?: string }>
  >(`/users/${organizerId}/onlineMeetings/${onlineMeetingId}/transcripts`, {
    version: "v1.0",
  });
  return res.value.map((t) => ({
    id: t.id,
    onlineMeetingId,
    createdDateTime: t.createdDateTime,
  }));
}

/** Fetch a transcript's content as WebVTT text. */
export async function fetchTranscriptVtt(
  ctx: GraphContext,
  organizerId: string,
  onlineMeetingId: string,
  transcriptId: string,
): Promise<string> {
  return ctx.client.request<string>(
    `/users/${organizerId}/onlineMeetings/${onlineMeetingId}/transcripts/${transcriptId}/content?$format=text/vtt`,
    { version: "v1.0", raw: true, headers: { Accept: "text/vtt" } },
  );
}

/** List recordings available for a meeting. */
export async function listRecordings(
  ctx: GraphContext,
  organizerId: string,
  onlineMeetingId: string,
): Promise<RecordingRef[]> {
  const res = await ctx.client.request<
    GraphList<{
      id: string;
      createdDateTime?: string;
      recordingContentUrl?: string;
    }>
  >(`/users/${organizerId}/onlineMeetings/${onlineMeetingId}/recordings`, {
    version: "v1.0",
  });
  return res.value.map((r) => ({
    id: r.id,
    onlineMeetingId,
    createdDateTime: r.createdDateTime,
    recordingContentUrl: r.recordingContentUrl,
  }));
}

// ── Routing (pure) ──────────────────────────────────────────────────────────

export type ArtifactKind = "transcript" | "recording";

/** What a booking knows about where its artifacts should be filed. */
export interface BookingRoutingRecord {
  bookingId: string;
  companyId: string | null;
  cohortSlug: string | null;
}

export interface ArtifactRoutingResult {
  bookingId: string | null;
  companyId: string | null;
  cohortSlug: string | null;
  storagePath: string;
  routingStatus: "auto_routed" | "ambiguous";
}

const EXT: Record<ArtifactKind, string> = {
  transcript: "vtt",
  recording: "mp4",
};

/**
 * Resolve where an artifact should be stored, keyed off the booking that owns
 * its `onlineMeetingId`. Returns an `ambiguous` result (filed under
 * `_unassigned`) when there is no matching booking.
 */
export function routeArtifact(
  onlineMeetingId: string,
  kind: ArtifactKind,
  artifactId: string,
  lookup: Map<string, BookingRoutingRecord>,
): ArtifactRoutingResult {
  const record = lookup.get(onlineMeetingId);
  const cohort = record?.cohortSlug ?? "_unassigned";
  const company = record?.companyId ?? "_unassigned";
  const bookingSeg = record?.bookingId ?? `unmatched-${onlineMeetingId}`;
  return {
    bookingId: record?.bookingId ?? null,
    companyId: record?.companyId ?? null,
    cohortSlug: record?.cohortSlug ?? null,
    storagePath: `cohort/${cohort}/company/${company}/meetings/${bookingSeg}/${kind}/${artifactId}.${EXT[kind]}`,
    routingStatus: record ? "auto_routed" : "ambiguous",
  };
}
