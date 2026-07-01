import { describe, expect, it } from "vitest";
import { buildIcs, formatIcsUtc, type IcsEvent } from "../build";

const base: IcsEvent = {
  uid: "booking-abc@scheduler.thecapitalcollective.org",
  sequence: 0,
  method: "REQUEST",
  start: Date.UTC(2026, 6, 2, 15, 0),
  end: Date.UTC(2026, 6, 2, 15, 30),
  title: "TCC advisor session",
  joinUrl: "https://teams.example/join/abc",
  organizer: {
    email: "scheduling@thecapitalcollective.org",
    name: "TCC Scheduling",
  },
  attendees: [{ email: "advisor@example.com", name: "Jane Advisor" }],
  dtstamp: Date.UTC(2026, 5, 30, 12, 0),
};

const lines = (ics: string) => ics.split("\r\n");
/** Reconstruct logical (unfolded) lines by removing RFC-5545 line folds. */
const unfolded = (ics: string) => ics.replace(/\r\n /g, "").split("\r\n");

describe("formatIcsUtc", () => {
  it("formats epoch ms as a UTC iCalendar timestamp", () => {
    expect(formatIcsUtc(Date.UTC(2026, 6, 2, 15, 0, 5))).toBe(
      "20260702T150005Z",
    );
  });
});

describe("buildIcs — REQUEST", () => {
  const { content, filename, method } = buildIcs(base);

  it("uses CRLF line endings and the .ics filename", () => {
    expect(content).toContain("\r\n");
    expect(filename).toBe("invite.ics");
    expect(method).toBe("REQUEST");
  });

  it("emits the core VEVENT properties", () => {
    expect(content).toContain("METHOD:REQUEST");
    expect(content).toContain(
      "UID:booking-abc@scheduler.thecapitalcollective.org",
    );
    expect(content).toContain("SEQUENCE:0");
    expect(content).toContain("DTSTART:20260702T150000Z");
    expect(content).toContain("DTEND:20260702T153000Z");
    expect(content).toContain("STATUS:CONFIRMED");
    expect(content).toContain("URL:https://teams.example/join/abc");
  });

  it("invites the attendee with an RSVP request", () => {
    const attendee = unfolded(content).find((l) => l.startsWith("ATTENDEE"));
    expect(attendee).toBeDefined();
    expect(attendee).toContain("RSVP=TRUE");
    expect(attendee).toContain("mailto:advisor@example.com");
  });
});

describe("buildIcs — CANCEL", () => {
  it("flips method/status and carries the incremented sequence", () => {
    const { content } = buildIcs({ ...base, method: "CANCEL", sequence: 1 });
    expect(content).toContain("METHOD:CANCEL");
    expect(content).toContain("STATUS:CANCELLED");
    expect(content).toContain("SEQUENCE:1");
    expect(content).toContain(
      "UID:booking-abc@scheduler.thecapitalcollective.org",
    ); // same UID threads it
  });
});

describe("buildIcs — escaping & folding", () => {
  it("escapes commas and semicolons in TEXT values", () => {
    const { content } = buildIcs({
      ...base,
      title: "Coffee, Cake; and strategy",
    });
    expect(content).toContain("SUMMARY:Coffee\\, Cake\\; and strategy");
  });

  it("folds long content lines to <=75 octets", () => {
    const { content } = buildIcs({ ...base, description: "x".repeat(400) });
    for (const l of lines(content)) {
      expect(Buffer.byteLength(l, "utf-8")).toBeLessThanOrEqual(75);
    }
  });
});
