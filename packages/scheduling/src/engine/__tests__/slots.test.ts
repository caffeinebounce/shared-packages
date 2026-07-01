import { describe, expect, it } from "vitest";
import type { MeetingTypeConfig, Participant, Weekday } from "../../types";
import { computeAvailableSlots } from "../slots";

const HOUR = 3_600_000;
const MIN = 60_000;
const DAY = 86_400_000;

// Anchor on a fixed UTC day; compute its weekday so schedule rules always match.
const baseDay = Date.UTC(2026, 5, 2); // 2026-06-02 00:00:00Z
const wd = new Date(baseDay).getUTCDay() as Weekday;
const at = (h: number, m = 0) => baseDay + h * HOUR + m * MIN;

const mt = (over: Partial<MeetingTypeConfig> = {}): MeetingTypeConfig => ({
  durationMin: 30,
  bufferBeforeMin: 0,
  bufferAfterMin: 0,
  minNoticeHours: 0,
  granularityMin: 30,
  ...over,
});

/** Advisor with a single same-day window (minutes-from-midnight, UTC). */
const advisor = (
  startMin: number,
  endMin: number,
  extra: Partial<Participant> = {},
  id = "adv",
): Participant => ({
  id,
  kind: "advisor",
  blocking: true,
  schedules: [
    {
      timezone: "UTC",
      rules: [{ weekday: wd, startMinute: startMin, endMinute: endMin }],
    },
  ],
  ...extra,
});

const run = (
  participants: Participant[],
  mtOver: Partial<MeetingTypeConfig> = {},
  over: Partial<Parameters<typeof computeAvailableSlots>[0]> = {},
) =>
  computeAvailableSlots({
    meetingType: mt(mtOver),
    participants,
    rangeStart: baseDay,
    rangeEnd: baseDay + DAY,
    now: baseDay - DAY,
    viewerTimezone: "UTC",
    ...over,
  }).map((s) => s.startUtc);

describe("computeAvailableSlots", () => {
  it("slices a single window on the granularity grid", () => {
    expect(run([advisor(540, 600)])).toEqual([at(9), at(9, 30)]); // 09:00–10:00, two 30-min slots
  });

  it("returns the intersection of multiple blocking advisors", () => {
    const a = advisor(540, 660, {}, "a"); // 09:00–11:00
    const b = advisor(600, 720, {}, "b"); // 10:00–12:00
    expect(run([a, b], { durationMin: 60, granularityMin: 60 })).toEqual([
      at(10),
    ]);
  });

  it("requires the meeting plus its buffers to fit inside a window", () => {
    expect(
      run([advisor(540, 600)], {
        durationMin: 30,
        bufferBeforeMin: 10,
        bufferAfterMin: 10,
        granularityMin: 15,
      }),
    ).toEqual([at(9, 15)]); // only 09:15 leaves room for both buffers in 09:00–10:00
  });

  it("excludes slots inside the min-notice horizon", () => {
    expect(
      run(
        [advisor(540, 660)],
        {},
        { now: baseDay, meetingType: mt({ minNoticeHours: 10 }) },
      ),
    ).toEqual([at(10), at(10, 30)]); // earliest = 10:00
  });

  it("subtracts synced busy blocks", () => {
    const a = advisor(540, 660, { busy: [{ start: at(9, 30), end: at(10) }] });
    expect(run([a])).toEqual([at(9), at(10), at(10, 30)]);
  });

  it("respects buffers on existing bookings", () => {
    const a = advisor(540, 660, {
      bookings: [
        {
          start: at(10),
          end: at(10, 30),
          bufferBeforeMin: 15,
          bufferAfterMin: 15,
        },
      ],
    });
    // Booking padded to 09:45–10:45 → free 09:00–09:45 and 10:45–11:00.
    expect(run([a], { granularityMin: 15 })).toEqual([at(9), at(9, 15)]);
  });

  it("enforces per-day caps using existing same-day bookings", () => {
    const a = advisor(540, 600, {
      maxPerDay: 1,
      bookings: [{ start: at(14), end: at(14, 30) }], // outside the window, but counts toward the cap
    });
    expect(run([a])).toEqual([]);
  });

  it("treats a participant with no schedule as fully open", () => {
    const company: Participant = { id: "co", kind: "company", blocking: true };
    expect(
      run([advisor(540, 600), company], {
        durationMin: 60,
        granularityMin: 60,
      }),
    ).toEqual([at(9)]);
  });

  it("returns nothing when there are no blocking participants", () => {
    const optional: Participant = { id: "x", kind: "staff", blocking: false };
    expect(run([optional])).toEqual([]);
  });
});
