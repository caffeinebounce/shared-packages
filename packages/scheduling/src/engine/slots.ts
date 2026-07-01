/**
 * The slot engine: given a meeting type and its required participants, compute
 * the mutually-available start times over a date range.
 *
 * Pipeline (all set arithmetic on UTC epoch-ms intervals):
 *   1. For each blocking participant, build their free set:
 *        availability (schedules ∪ open-exceptions, or fully-open if none)
 *        − block-exceptions − busy − existing bookings (buffer-expanded)
 *   2. Intersect every blocking participant's free set → mutually-free windows.
 *   3. Slice mutually-free windows into candidate starts on the granularity
 *      grid, requiring the meeting + its own buffers to fit entirely inside.
 *   4. Drop starts inside the min-notice horizon and those exceeding any
 *      participant's per-day cap.
 *
 * Pure and synchronous: all I/O (DB reads, calendar fetches) happens in the
 * caller, which hands fully-materialized inputs to this function.
 */
import type { ComputeSlotsInput, Participant, Slot, TimeRange } from "../types";
import {
  clamp,
  intersect,
  intersectMany,
  normalize,
  subtract,
  union,
} from "./intervals";
import { expandSchedules } from "./recurrence";
import { localDateKey } from "./timezone";

const MIN_MS = 60_000;

/** Build the free interval set for one participant over `[rangeStart, rangeEnd)`. */
function participantFreeSet(
  p: Participant,
  rangeStart: number,
  rangeEnd: number,
): TimeRange[] {
  // Base availability: explicit schedules, otherwise treat as fully open.
  let free: TimeRange[];
  if (p.schedules && p.schedules.length > 0) {
    free = clamp(
      expandSchedules(p.schedules, rangeStart, rangeEnd),
      rangeStart,
      rangeEnd,
    );
  } else {
    free = [{ start: rangeStart, end: rangeEnd }];
  }

  // One-off "open" exceptions add availability; "block" exceptions remove it.
  if (p.exceptions && p.exceptions.length > 0) {
    const opens = p.exceptions.filter((e) => e.kind === "open");
    const blocks = p.exceptions.filter((e) => e.kind === "block");
    if (opens.length > 0) {
      free = union(free, clamp(opens, rangeStart, rangeEnd));
    }
    if (blocks.length > 0) {
      free = subtract(free, blocks);
    }
  }

  // Synced external busy blocks.
  if (p.busy && p.busy.length > 0) {
    free = subtract(free, p.busy);
  }

  // Existing bookings, each expanded by its own buffers so back-to-back
  // meetings respect the gap the prior booking reserved.
  if (p.bookings && p.bookings.length > 0) {
    const padded = p.bookings.map((b) => ({
      start: b.start - (b.bufferBeforeMin ?? 0) * MIN_MS,
      end: b.end + (b.bufferAfterMin ?? 0) * MIN_MS,
    }));
    free = subtract(free, padded);
  }

  return normalize(free);
}

/** Count a participant's existing bookings that start on `dateKey` (viewer tz). */
function bookingsOnDay(
  p: Participant,
  dateKey: string,
  viewerTimezone: string,
): number {
  if (!p.bookings) return 0;
  let n = 0;
  for (const b of p.bookings) {
    if (localDateKey(b.start, viewerTimezone) === dateKey) n++;
  }
  return n;
}

/**
 * Compute bookable slots. Returns chronologically-sorted, de-duplicated slots.
 * Returns an empty array when there are no blocking participants (a meeting
 * needs at least one calendar to anchor availability).
 */
export function computeAvailableSlots(input: ComputeSlotsInput): Slot[] {
  const {
    meetingType,
    participants,
    rangeStart,
    rangeEnd,
    now,
    viewerTimezone,
  } = input;
  const {
    durationMin,
    bufferBeforeMin,
    bufferAfterMin,
    minNoticeHours,
    granularityMin,
  } = meetingType;

  const blocking = participants.filter((p) => p.blocking);
  if (blocking.length === 0) return [];
  if (durationMin <= 0 || granularityMin <= 0) return [];

  // Step 1-2: intersect every blocking participant's free time.
  const freeSets = blocking.map((p) =>
    participantFreeSet(p, rangeStart, rangeEnd),
  );
  const mutual = intersectMany(freeSets);
  if (mutual.length === 0) return [];

  // Step 3-4: slice into candidate starts.
  const durationMs = durationMin * MIN_MS;
  const padBeforeMs = bufferBeforeMin * MIN_MS;
  const padAfterMs = bufferAfterMin * MIN_MS;
  const gridMs = granularityMin * MIN_MS;
  const earliest = now + minNoticeHours * 60 * MIN_MS;

  // Per-participant per-day counters seeded from existing bookings, so a cap of
  // N accounts for meetings already on the calendar that day.
  const dayCounts = new Map<string, number>(); // key: `${participantId}|${dateKey}`

  const slots: Slot[] = [];
  const seen = new Set<number>();

  for (const window of mutual) {
    // First grid-aligned meeting start such that the leading buffer fits.
    const firstStart =
      Math.ceil((window.start + padBeforeMs) / gridMs) * gridMs;
    for (
      let start = firstStart;
      start + durationMs + padAfterMs <= window.end;
      start += gridMs
    ) {
      if (start - padBeforeMs < window.start) continue; // leading buffer must fit
      if (start < earliest) continue; // min-notice horizon
      if (seen.has(start)) continue;

      // Per-day cap check across every blocking participant.
      const dateKey = localDateKey(start, viewerTimezone);
      let capped = false;
      for (const p of blocking) {
        if (p.maxPerDay == null) continue;
        const counterKey = `${p.id}|${dateKey}`;
        let used = dayCounts.get(counterKey);
        if (used === undefined) {
          used = bookingsOnDay(p, dateKey, viewerTimezone);
          dayCounts.set(counterKey, used);
        }
        if (used >= p.maxPerDay) {
          capped = true;
          break;
        }
      }
      if (capped) continue;

      const endUtc = start + durationMs;
      slots.push({
        startUtc: start,
        endUtc,
        startIso: new Date(start).toISOString(),
        endIso: new Date(endUtc).toISOString(),
        durationMin,
      });
      seen.add(start);
    }
  }

  slots.sort((a, b) => a.startUtc - b.startUtc);
  return slots;
}

/** Re-export the intersection primitive for callers that need raw free windows. */
export { intersect };
