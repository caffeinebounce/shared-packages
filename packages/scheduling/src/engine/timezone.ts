/**
 * Dependency-free, DST-correct timezone math built on `Intl.DateTimeFormat`.
 *
 * We intentionally avoid a tz library here so the engine has zero runtime
 * dependencies and identical behaviour everywhere a modern `Intl` exists
 * (Node ≥ 18, all evergreen browsers). The two-pass offset resolution below
 * is the standard technique for converting a wall-clock time in a named zone
 * to an absolute UTC instant across DST transitions.
 */

export interface LocalDateParts {
  year: number;
  /** 1-12 */
  month: number;
  /** 1-31 */
  day: number;
  hour: number;
  minute: number;
  second: number;
}

const cache = new Map<string, Intl.DateTimeFormat>();

function formatter(timeZone: string): Intl.DateTimeFormat {
  let f = cache.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    cache.set(timeZone, f);
  }
  return f;
}

/** Decompose an absolute instant into wall-clock parts in `timeZone`. */
export function getLocalParts(
  instant: number,
  timeZone: string,
): LocalDateParts {
  const parts = formatter(timeZone).formatToParts(new Date(instant));
  const map: Record<string, number> = {};
  for (const p of parts) {
    if (p.type !== "literal") map[p.type] = Number(p.value);
  }
  return {
    year: map.year,
    month: map.month,
    day: map.day,
    hour: map.hour,
    minute: map.minute,
    second: map.second,
  };
}

/**
 * UTC offset (minutes) in effect at `instant` for `timeZone`.
 * Positive east of UTC (e.g. +60 for CET), negative west (e.g. -300 for EST).
 */
export function offsetMinutes(instant: number, timeZone: string): number {
  const p = getLocalParts(instant, timeZone);
  const asIfUtc = Date.UTC(
    p.year,
    p.month - 1,
    p.day,
    p.hour,
    p.minute,
    p.second,
  );
  return (asIfUtc - instant) / 60000;
}

/**
 * Convert a wall-clock time in `timeZone` to an absolute UTC instant (epoch ms).
 *
 * Uses a two-pass refinement: guess the offset by treating the wall time as
 * UTC, then recompute using the offset that actually applies at the resulting
 * instant. This resolves DST "spring-forward"/"fall-back" boundaries correctly.
 */
export function zonedWallTimeToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string,
): number {
  const guess = Date.UTC(year, month - 1, day, hour, minute);
  const off1 = offsetMinutes(guess, timeZone);
  let utc = guess - off1 * 60000;
  const off2 = offsetMinutes(utc, timeZone);
  if (off2 !== off1) utc = guess - off2 * 60000;
  return utc;
}

/** Convenience: UTC instant for `minutesFromMidnight` on a local calendar date. */
export function localDayMinuteToUtc(
  year: number,
  month: number,
  day: number,
  minutesFromMidnight: number,
  timeZone: string,
): number {
  const hour = Math.floor(minutesFromMidnight / 60);
  const minute = minutesFromMidnight % 60;
  return zonedWallTimeToUtc(year, month, day, hour, minute, timeZone);
}

/**
 * The calendar-date key (YYYY-MM-DD) of an instant in `timeZone`. Used to group
 * candidate slots by local day for per-day caps.
 */
export function localDateKey(instant: number, timeZone: string): string {
  const p = getLocalParts(instant, timeZone);
  const mm = String(p.month).padStart(2, "0");
  const dd = String(p.day).padStart(2, "0");
  return `${p.year}-${mm}-${dd}`;
}
