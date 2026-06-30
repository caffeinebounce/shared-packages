import { describe, expect, it, vi } from "vitest";
import type { SchedulingConfig } from "../../ports";
import { GraphClient } from "../client";
import { createTeamsMeeting, type GraphContext } from "../meetings";
import type { CreateTeamsMeetingInput } from "../types";

const cfg: SchedulingConfig = {
  microsoft: {
    clientId: "c",
    clientSecret: "s",
    tenantId: "t",
    organizerId: "organizer-guid",
  },
  encryptionSecret: "e",
  publicBaseUrl: "https://scheduler.example",
};

function resp(status: number, body: unknown): Response {
  return {
    status,
    ok: status >= 200 && status < 300,
    headers: { get: () => null },
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as unknown as Response;
}

const input: CreateTeamsMeetingInput = {
  subject: "TCC × Cala Coffee",
  startUtc: Date.UTC(2026, 6, 2, 15, 0),
  endUtc: Date.UTC(2026, 6, 2, 15, 30),
  record: true,
  transcribe: true,
  attendees: [{ email: "advisor@example.com" }],
};

const ctxWith = (
  fetchImpl: (url: string, init?: RequestInit) => Promise<Response>,
): GraphContext => ({
  client: new GraphClient(cfg, { fetch: fetchImpl, sleep: async () => {} }),
  config: cfg,
});

describe("createTeamsMeeting", () => {
  it("creates the online meeting (beta) then the calendar event", async () => {
    const fetchImpl = vi.fn(async (url: string) => {
      if (url.includes("/oauth2/v2.0/token")) {
        return resp(200, { access_token: "tok", expires_in: 3600 });
      }
      if (url.includes("/onlineMeetings")) {
        expect(url).toContain("/beta/users/organizer-guid/onlineMeetings");
        return resp(201, {
          id: "MM1",
          joinWebUrl: "https://teams.example/join/abc",
        });
      }
      if (url.includes("/calendar/events")) return resp(201, { id: "EV1" });
      throw new Error(`unexpected url ${url}`);
    });

    const meeting = await createTeamsMeeting(ctxWith(fetchImpl), input);
    expect(meeting).toEqual({
      onlineMeetingId: "MM1",
      joinUrl: "https://teams.example/join/abc",
      organizerId: "organizer-guid",
      calendarEventId: "EV1",
      autoRecord: true,
    });
  });

  it("falls back to v1.0 (no auto-record) when the beta create fails", async () => {
    const fetchImpl = vi.fn(async (url: string) => {
      if (url.includes("/oauth2/v2.0/token")) {
        return resp(200, { access_token: "tok", expires_in: 3600 });
      }
      if (url.includes("/onlineMeetings")) {
        if (url.includes("/beta/"))
          return resp(400, { error: { code: "BadRequest" } });
        return resp(201, {
          id: "MM2",
          joinWebUrl: "https://teams.example/join/def",
        });
      }
      if (url.includes("/calendar/events")) return resp(201, { id: "EV2" });
      throw new Error(`unexpected url ${url}`);
    });

    const meeting = await createTeamsMeeting(ctxWith(fetchImpl), input);
    expect(meeting.onlineMeetingId).toBe("MM2");
    expect(meeting.autoRecord).toBe(false);
    expect(meeting.calendarEventId).toBe("EV2");
  });

  it("still returns the meeting when the calendar event mirror fails", async () => {
    const fetchImpl = vi.fn(async (url: string) => {
      if (url.includes("/oauth2/v2.0/token")) {
        return resp(200, { access_token: "tok", expires_in: 3600 });
      }
      if (url.includes("/onlineMeetings")) {
        return resp(201, {
          id: "MM3",
          joinWebUrl: "https://teams.example/join/ghi",
        });
      }
      if (url.includes("/calendar/events"))
        return resp(500, { error: { code: "ServerError" } });
      throw new Error(`unexpected url ${url}`);
    });

    const meeting = await createTeamsMeeting(ctxWith(fetchImpl), input);
    expect(meeting.onlineMeetingId).toBe("MM3");
    expect(meeting.calendarEventId).toBeNull();
  });
});
