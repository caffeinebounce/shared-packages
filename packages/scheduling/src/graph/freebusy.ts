/**
 * Free/busy retrieval via Graph `calendar/getSchedule`.
 *
 * Used for TCC tenant staff (app-only token on `/users/{id}/...`) and for an
 * external advisor's own Microsoft calendar (delegated token on `/me/...`).
 * We request times in UTC so response `dateTime` values can be parsed directly.
 */
import type { BusyBlock } from "../types";
import type { GraphContext } from "./meetings";

export interface GetScheduleInput {
  /** Mailbox addresses to query (usually one). */
  schedules: string[];
  windowStart: number;
  windowEnd: number;
  /** Slot granularity Graph aggregates to (minutes). */
  intervalMinutes?: number;
  /**
   * Delegated user token. When provided, queries `/me/calendar/getSchedule`
   * (the external advisor's own calendar). Omit for app-only tenant queries.
   */
  token?: string;
  /** Mailbox to scope an app-only query to (ignored when `token` is set). */
  asUserId?: string;
}

interface ScheduleResponse {
  value: Array<{
    scheduleId: string;
    scheduleItems?: Array<{
      status: string;
      start: { dateTime: string; timeZone: string };
      end: { dateTime: string; timeZone: string };
    }>;
  }>;
}

/** Parse a Graph UTC schedule dateTime (no offset suffix) into epoch ms. */
function parseUtc(dateTime: string): number {
  // Graph returns e.g. "2026-06-02T09:00:00.0000000" with timeZone "UTC".
  return Date.parse(dateTime.endsWith("Z") ? dateTime : `${dateTime}Z`);
}

const BUSY_STATUSES = new Set(["busy", "tentative", "oof", "workingElsewhere"]);

/** Fetch busy blocks for the given mailbox(es). Free slots are omitted. */
export async function getMicrosoftBusy(
  ctx: GraphContext,
  input: GetScheduleInput,
): Promise<BusyBlock[]> {
  const path = input.token
    ? "/me/calendar/getSchedule"
    : `/users/${input.asUserId ?? ctx.config.microsoft.organizerId}/calendar/getSchedule`;

  const res = await ctx.client.request<ScheduleResponse>(path, {
    method: "POST",
    version: "v1.0",
    token: input.token,
    body: {
      schedules: input.schedules,
      startTime: {
        dateTime: new Date(input.windowStart).toISOString(),
        timeZone: "UTC",
      },
      endTime: {
        dateTime: new Date(input.windowEnd).toISOString(),
        timeZone: "UTC",
      },
      availabilityViewInterval: input.intervalMinutes ?? 15,
    },
  });

  const blocks: BusyBlock[] = [];
  for (const entry of res.value) {
    for (const item of entry.scheduleItems ?? []) {
      if (!BUSY_STATUSES.has(item.status)) continue;
      blocks.push({
        start: parseUtc(item.start.dateTime),
        end: parseUtc(item.end.dateTime),
      });
    }
  }
  return blocks;
}
