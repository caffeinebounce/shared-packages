/**
 * Google Calendar free/busy via the REST API (`freeBusy.query`).
 * Uses the advisor's delegated access token; returns only busy blocks.
 */
import type { FetchLike } from "../ports";
import type { BusyBlock } from "../types";

const FREEBUSY_ENDPOINT = "https://www.googleapis.com/calendar/v3/freeBusy";

export interface GoogleFreeBusyInput {
  accessToken: string;
  windowStart: number;
  windowEnd: number;
  /** Calendar id; "primary" by default. */
  calendarId?: string;
}

interface FreeBusyResponse {
  calendars: Record<string, { busy?: Array<{ start: string; end: string }> }>;
}

/** Query busy intervals for one calendar. */
export async function getGoogleBusy(
  input: GoogleFreeBusyInput,
  fetchImpl: FetchLike = (i, init) => fetch(i, init),
): Promise<BusyBlock[]> {
  const calendarId = input.calendarId ?? "primary";
  const res = await fetchImpl(FREEBUSY_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      timeMin: new Date(input.windowStart).toISOString(),
      timeMax: new Date(input.windowEnd).toISOString(),
      items: [{ id: calendarId }],
    }),
  });
  if (!res.ok)
    throw new Error(
      `Google freeBusy failed (${res.status}): ${await res.text()}`,
    );

  const json = (await res.json()) as FreeBusyResponse;
  const busy = json.calendars[calendarId]?.busy ?? [];
  return busy.map((b) => ({
    start: Date.parse(b.start),
    end: Date.parse(b.end),
  }));
}
