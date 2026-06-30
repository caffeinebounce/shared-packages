/**
 * Shared domain types for the scheduling kernel.
 *
 * These are plain TypeScript types (no runtime import) so the engine stays
 * dependency-free and trivially unit-testable. Runtime validators (Zod) live
 * separately in `validators.ts` and are layered on top by callers that parse
 * untrusted input.
 *
 * Time convention: every absolute instant is an epoch-milliseconds `number`
 * in UTC. Wall-clock availability (weekly rules) is authored in an IANA
 * timezone and expanded to UTC by the engine. We never pass `Date` objects
 * across the public API — epoch ms removes all ambiguity.
 */

/** Day of week, 0 = Sunday … 6 = Saturday (matches `Date.prototype.getUTCDay`). */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** A half-open interval `[start, end)` of epoch-millisecond instants (UTC). */
export interface TimeRange {
  /** Inclusive start, epoch ms UTC. */
  start: number;
  /** Exclusive end, epoch ms UTC. */
  end: number;
}

/** Kind of principal whose calendar can gate a meeting slot. */
export type PrincipalKind = "advisor" | "staff" | "company";

/** A recurring weekly availability window, authored in `AvailabilitySchedule.timezone`. */
export interface WeeklyAvailabilityRule {
  weekday: Weekday;
  /** Minutes from local midnight, e.g. 540 = 09:00. */
  startMinute: number;
  /** Minutes from local midnight, exclusive end. Must be > startMinute. */
  endMinute: number;
}

/**
 * A named set of recurring weekly windows in a single authoring timezone.
 * A principal may have several (e.g. TCC-authored + self-serve).
 */
export interface AvailabilitySchedule {
  /** IANA timezone the rules are authored in (e.g. "America/Chicago"). */
  timezone: string;
  rules: WeeklyAvailabilityRule[];
  /** Optional inclusive lower bound (epoch ms) before which the schedule is inert. */
  effectiveFrom?: number | null;
  /** Optional exclusive upper bound (epoch ms) after which the schedule is inert. */
  effectiveTo?: number | null;
  /**
   * Optional recurrence override (RFC-5545 RRULE). Reserved for irregular
   * cadences ("every other Tuesday"); not yet expanded by the engine and
   * ignored if present in this version.
   */
  rrule?: string | null;
}

/**
 * A one-off deviation. `open` adds extra availability; `block` removes it
 * (time off / PTO / a hard conflict). Both are absolute UTC ranges.
 */
export interface AvailabilityException {
  kind: "open" | "block";
  start: number;
  end: number;
}

/** An opaque busy block synced from an external calendar (Google/Microsoft). */
export interface BusyBlock {
  start: number;
  end: number;
}

/** An already-scheduled booking on a principal's calendar. */
export interface ExistingBooking {
  start: number;
  end: number;
  /** Buffer reserved before this booking (minutes). */
  bufferBeforeMin?: number;
  /** Buffer reserved after this booking (minutes). */
  bufferAfterMin?: number;
}

/**
 * A participant in a prospective meeting. The engine intersects the free time
 * of every `blocking` participant; non-blocking (optional) attendees are
 * ignored for slot computation.
 *
 * A participant with no `schedules` is treated as fully available within the
 * search range (only their busy blocks and existing bookings constrain them) —
 * this models cohort-company contacts who don't publish availability.
 */
export interface Participant {
  id: string;
  kind: PrincipalKind;
  blocking: boolean;
  schedules?: AvailabilitySchedule[];
  exceptions?: AvailabilityException[];
  busy?: BusyBlock[];
  bookings?: ExistingBooking[];
  /** Cap on total meetings of this type per calendar day (in `viewerTimezone`). */
  maxPerDay?: number | null;
}

/** Booking rules for the meeting type being scheduled. */
export interface MeetingTypeConfig {
  durationMin: number;
  bufferBeforeMin: number;
  bufferAfterMin: number;
  /** Earliest a slot may start, expressed as hours of notice from `now`. */
  minNoticeHours: number;
  /** Slot grid step in minutes (e.g. 15 → :00, :15, :30, :45 starts). */
  granularityMin: number;
}

/** Inputs to {@link computeAvailableSlots}. All instants are epoch ms UTC. */
export interface ComputeSlotsInput {
  meetingType: MeetingTypeConfig;
  participants: Participant[];
  rangeStart: number;
  rangeEnd: number;
  /** Injected clock (epoch ms). Required so the engine stays pure/testable. */
  now: number;
  /** IANA timezone for day-cap grouping and rendered display strings. */
  viewerTimezone: string;
}

/** A bookable slot returned by the engine. */
export interface Slot {
  /** Meeting start, epoch ms UTC. */
  startUtc: number;
  /** Meeting end (start + duration), epoch ms UTC. */
  endUtc: number;
  /** ISO-8601 UTC start, convenience for transport/display. */
  startIso: string;
  /** ISO-8601 UTC end. */
  endIso: string;
  durationMin: number;
}
