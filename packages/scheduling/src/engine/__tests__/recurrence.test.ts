import { describe, expect, it } from "vitest";
import type { AvailabilitySchedule, Weekday } from "../../types";
import { expandSchedule } from "../recurrence";
import { getLocalParts, offsetMinutes } from "../timezone";

const CHICAGO = "America/Chicago";

describe("expandSchedule", () => {
  it("materializes a single weekly rule on each matching date", () => {
    // Weekday of 2026-03-03; the same weekday recurs every 7 days.
    const wd = new Date(Date.UTC(2026, 2, 3)).getUTCDay() as Weekday;
    const schedule: AvailabilitySchedule = {
      timezone: CHICAGO,
      rules: [{ weekday: wd, startMinute: 540, endMinute: 600 }], // 09:00–10:00
    };
    const out = expandSchedule(
      schedule,
      Date.UTC(2026, 2, 1),
      Date.UTC(2026, 2, 15),
    );
    const isos = out.map((r) => new Date(r.start).toISOString()).sort();
    // 2026-03-03 is CST (UTC-6) → 15:00Z; 2026-03-10 is CDT (UTC-5) → 14:00Z.
    expect(isos).toEqual([
      "2026-03-03T15:00:00.000Z",
      "2026-03-10T14:00:00.000Z",
    ]);
  });

  it("keeps wall-clock anchored across the spring-forward DST boundary", () => {
    // A rule for every weekday → one 09:00–10:00 window per calendar day.
    const rules = Array.from({ length: 7 }, (_, weekday) => ({
      weekday: weekday as Weekday,
      startMinute: 540,
      endMinute: 600,
    }));
    const schedule: AvailabilitySchedule = { timezone: CHICAGO, rules };
    // DST begins 2026-03-08; this range straddles it.
    const out = expandSchedule(
      schedule,
      Date.UTC(2026, 2, 1),
      Date.UTC(2026, 2, 21),
    );

    expect(out).toHaveLength(20); // March 1–20 inclusive

    for (const window of out) {
      const start = getLocalParts(window.start, CHICAGO);
      const end = getLocalParts(window.end, CHICAGO);
      expect([start.hour, start.minute]).toEqual([9, 0]);
      expect([end.hour, end.minute]).toEqual([10, 0]);
      // Never crosses the 02:00 transition, so duration is exactly one hour.
      expect(window.end - window.start).toBe(3_600_000);
    }

    const offsets = new Set(out.map((w) => offsetMinutes(w.start, CHICAGO)));
    expect(offsets.has(-360)).toBe(true); // CST, before DST
    expect(offsets.has(-300)).toBe(true); // CDT, after DST
  });

  it("respects effectiveFrom/effectiveTo bounds", () => {
    const wd = new Date(Date.UTC(2026, 2, 10)).getUTCDay() as Weekday;
    const schedule: AvailabilitySchedule = {
      timezone: CHICAGO,
      rules: [{ weekday: wd, startMinute: 540, endMinute: 600 }],
      effectiveFrom: Date.UTC(2026, 2, 9),
    };
    const out = expandSchedule(
      schedule,
      Date.UTC(2026, 2, 1),
      Date.UTC(2026, 2, 15),
    );
    // Only 2026-03-10 survives (its same-weekday sibling 2026-03-03 is before effectiveFrom).
    expect(out).toHaveLength(1);
    expect(new Date(out[0].start).toISOString()).toBe(
      "2026-03-10T14:00:00.000Z",
    );
  });
});
