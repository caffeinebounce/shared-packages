/**
 * Expand recurring weekly availability rules into concrete UTC intervals over a
 * search range. Each rule's local wall-clock window is materialized per
 * calendar day in the schedule's timezone, so a "09:00-17:00 Tuesday" window
 * stays anchored to 09:00 local even across a DST transition.
 *
 * RRULE-based schedules (irregular cadences) are reserved for a later pass and
 * intentionally ignored here — see `AvailabilitySchedule.rrule`.
 */
import type { AvailabilitySchedule, TimeRange, Weekday } from "../types";
import { localDayMinuteToUtc } from "./timezone";

const DAY_MS = 86_400_000;

/** Weekday (0=Sun..6=Sat) of a calendar date, independent of timezone. */
function weekdayOf(year: number, month: number, day: number): Weekday {
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay() as Weekday;
}

/** UTC components of the calendar date that a UTC-anchored day cursor points at. */
function datePartsOfCursor(cursorMs: number): {
  year: number;
  month: number;
  day: number;
} {
  const d = new Date(cursorMs);
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
  };
}

/**
 * Expand one schedule into UTC intervals intersecting `[rangeStart, rangeEnd)`.
 *
 * We iterate calendar dates by a UTC-midnight cursor (immune to DST since it's
 * pure date arithmetic), widening the iteration window by one day on each side
 * so a window whose local start/end straddles the range boundary is still
 * captured before being clamped by the caller.
 */
export function expandSchedule(
  schedule: AvailabilitySchedule,
  rangeStart: number,
  rangeEnd: number,
): TimeRange[] {
  const { timezone, rules, effectiveFrom, effectiveTo } = schedule;
  if (!rules || rules.length === 0) return [];

  const lo =
    effectiveFrom != null ? Math.max(rangeStart, effectiveFrom) : rangeStart;
  const hi = effectiveTo != null ? Math.min(rangeEnd, effectiveTo) : rangeEnd;
  if (hi <= lo) return [];

  // Group rules by weekday for quick lookup.
  const byWeekday = new Map<Weekday, typeof rules>();
  for (const rule of rules) {
    const list = byWeekday.get(rule.weekday) ?? [];
    list.push(rule);
    byWeekday.set(rule.weekday, list);
  }

  const out: TimeRange[] = [];
  // Pad one day each side to catch windows that cross the range boundary.
  const firstCursor = Math.floor((lo - DAY_MS) / DAY_MS) * DAY_MS;
  const lastCursor = Math.floor((hi + DAY_MS) / DAY_MS) * DAY_MS;

  for (let cursor = firstCursor; cursor <= lastCursor; cursor += DAY_MS) {
    const { year, month, day } = datePartsOfCursor(cursor);
    const wd = weekdayOf(year, month, day);
    const dayRules = byWeekday.get(wd);
    if (!dayRules) continue;

    for (const rule of dayRules) {
      if (rule.endMinute <= rule.startMinute) continue;
      const start = localDayMinuteToUtc(
        year,
        month,
        day,
        rule.startMinute,
        timezone,
      );
      const end = localDayMinuteToUtc(
        year,
        month,
        day,
        rule.endMinute,
        timezone,
      );
      // Cheap range pre-filter; precise clamping happens in the engine.
      if (end <= lo || start >= hi) continue;
      out.push({ start, end });
    }
  }
  return out;
}

/** Expand many schedules and return their combined (un-normalized) intervals. */
export function expandSchedules(
  schedules: AvailabilitySchedule[],
  rangeStart: number,
  rangeEnd: number,
): TimeRange[] {
  const out: TimeRange[] = [];
  for (const s of schedules) {
    out.push(...expandSchedule(s, rangeStart, rangeEnd));
  }
  return out;
}
