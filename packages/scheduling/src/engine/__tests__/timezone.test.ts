import { describe, expect, it } from "vitest";
import {
  getLocalParts,
  localDateKey,
  localDayMinuteToUtc,
  offsetMinutes,
  zonedWallTimeToUtc,
} from "../timezone";

const CHICAGO = "America/Chicago";

describe("zonedWallTimeToUtc", () => {
  it("resolves a winter (CST, UTC-6) wall time", () => {
    const utc = zonedWallTimeToUtc(2026, 1, 15, 9, 0, CHICAGO);
    expect(new Date(utc).toISOString()).toBe("2026-01-15T15:00:00.000Z");
  });

  it("resolves a summer (CDT, UTC-5) wall time", () => {
    const utc = zonedWallTimeToUtc(2026, 7, 15, 9, 0, CHICAGO);
    expect(new Date(utc).toISOString()).toBe("2026-07-15T14:00:00.000Z");
  });

  it("round-trips through getLocalParts", () => {
    const utc = zonedWallTimeToUtc(2026, 3, 10, 9, 30, CHICAGO);
    const p = getLocalParts(utc, CHICAGO);
    expect([p.year, p.month, p.day, p.hour, p.minute]).toEqual([
      2026, 3, 10, 9, 30,
    ]);
  });
});

describe("offsetMinutes", () => {
  it("is -360 in CST and -300 in CDT", () => {
    const winter = zonedWallTimeToUtc(2026, 1, 15, 12, 0, CHICAGO);
    const summer = zonedWallTimeToUtc(2026, 7, 15, 12, 0, CHICAGO);
    expect(offsetMinutes(winter, CHICAGO)).toBe(-360);
    expect(offsetMinutes(summer, CHICAGO)).toBe(-300);
  });
});

describe("localDayMinuteToUtc", () => {
  it("maps minutes-from-midnight to a UTC instant", () => {
    // 09:00 = 540 minutes; winter → 15:00Z
    expect(
      new Date(localDayMinuteToUtc(2026, 1, 15, 540, CHICAGO)).toISOString(),
    ).toBe("2026-01-15T15:00:00.000Z");
  });
});

describe("localDateKey", () => {
  it("uses the local calendar date, not UTC", () => {
    // 2026-01-15T05:30:00Z is still 2026-01-14 (23:30) in Chicago.
    const instant = Date.parse("2026-01-15T05:30:00.000Z");
    expect(localDateKey(instant, CHICAGO)).toBe("2026-01-14");
    expect(localDateKey(instant, "UTC")).toBe("2026-01-15");
  });
});
