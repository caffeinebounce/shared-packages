import { describe, expect, it } from "vitest";
import {
  buildCalendarEventBody,
  buildEventHtml,
  buildOnlineMeetingBody,
} from "../bodies";
import type { CreateTeamsMeetingInput } from "../types";

const baseInput: CreateTeamsMeetingInput = {
  subject: "TCC × Cala Coffee advisor session",
  startUtc: Date.UTC(2026, 6, 2, 15, 0),
  endUtc: Date.UTC(2026, 6, 2, 15, 30),
  record: true,
  transcribe: true,
  attendees: [
    { email: "advisor@example.com", name: "Jane Advisor", type: "required" },
    { email: "staff@thecapitalcollective.org" },
  ],
};

describe("buildOnlineMeetingBody", () => {
  it("sets auto-record fields on the beta path when recording is opted-in", () => {
    const body = buildOnlineMeetingBody(baseInput, true);
    expect(body.recordAutomatically).toBe(true);
    expect(body.allowRecording).toBe(true);
    expect(body.allowTranscription).toBe(true);
    expect(body.startDateTime).toBe("2026-07-02T15:00:00.000Z");
    expect(body.allowedPresenters).toBe("organizer");
  });

  it("omits recordAutomatically when recording is not opted-in", () => {
    const body = buildOnlineMeetingBody({ ...baseInput, record: false }, true);
    expect(body.recordAutomatically).toBeUndefined();
    expect(body.allowRecording).toBe(false);
  });

  it("omits all beta-only fields on the v1.0 fallback path", () => {
    const body = buildOnlineMeetingBody(baseInput, false);
    expect(body.recordAutomatically).toBeUndefined();
    expect(body.allowRecording).toBeUndefined();
    expect(body.allowTranscription).toBeUndefined();
  });
});

describe("buildEventHtml", () => {
  it("embeds the join link and a recording/transcription notice", () => {
    const html = buildEventHtml(
      "<p>Agenda</p>",
      "https://teams.example/join/abc",
    );
    expect(html).toContain("https://teams.example/join/abc");
    expect(html).toContain("Agenda");
    expect(html.toLowerCase()).toContain("transcribed automatically");
  });
});

describe("buildCalendarEventBody", () => {
  it("maps attendees and references the join URL with UTC times", () => {
    const body = buildCalendarEventBody(
      baseInput,
      "https://teams.example/join/abc",
    );
    expect(body.start).toEqual({
      dateTime: "2026-07-02T15:00:00.000Z",
      timeZone: "UTC",
    });
    expect(body.attendees).toHaveLength(2);
    expect(body.attendees[0]).toEqual({
      emailAddress: { address: "advisor@example.com", name: "Jane Advisor" },
      type: "required",
    });
    expect(body.attendees[1].type).toBe("required"); // default
    expect(body.body.content).toContain("https://teams.example/join/abc");
    expect(body.isReminderOn).toBe(true);
  });
});
