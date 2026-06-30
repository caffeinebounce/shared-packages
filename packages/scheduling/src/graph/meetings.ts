/**
 * High-level Teams meeting lifecycle, implementing the plan's hybrid strategy:
 *
 *   B → create the online meeting first (beta `/onlineMeetings`) so we control
 *       auto-record / auto-transcribe and capture the canonical joinUrl +
 *       onlineMeetingId (the transcript routing key).
 *   A → create an Outlook calendar event on the organizer mailbox that
 *       *references* that joinUrl, inviting internal/tenant attendees.
 *
 * If the beta create fails (the auto-record fields are beta and may drift), we
 * transparently fall back to a v1.0 online meeting without `recordAutomatically`
 * and rely on the tenant meeting policy + the transcript poll fallback.
 */
import type { Logger, SchedulingConfig } from "../ports";
import { noopLogger } from "../ports";
import { buildCalendarEventBody, buildOnlineMeetingBody } from "./bodies";
import { type GraphClient, GraphError } from "./client";
import type {
  CalendarEventResource,
  CreateTeamsMeetingInput,
  OnlineMeetingResource,
  TeamsMeeting,
} from "./types";

export interface GraphContext {
  client: GraphClient;
  config: SchedulingConfig;
  logger?: Logger;
}

/** Create the online meeting object, preferring the beta auto-record path. */
async function createOnlineMeeting(
  ctx: GraphContext,
  organizerId: string,
  input: CreateTeamsMeetingInput,
): Promise<{ meeting: OnlineMeetingResource; autoRecord: boolean }> {
  const path = `/users/${organizerId}/onlineMeetings`;
  try {
    const meeting = await ctx.client.request<OnlineMeetingResource>(path, {
      method: "POST",
      version: "beta",
      body: buildOnlineMeetingBody(input, true),
    });
    return { meeting, autoRecord: input.record };
  } catch (err) {
    if (!(err instanceof GraphError)) throw err;
    (ctx.logger ?? noopLogger).warn("graph.online_meeting.beta_fallback", {
      status: err.status,
      code: err.graphCode,
    });
    const meeting = await ctx.client.request<OnlineMeetingResource>(path, {
      method: "POST",
      version: "v1.0",
      body: buildOnlineMeetingBody(input, false),
    });
    return { meeting, autoRecord: false };
  }
}

/** Create a Teams meeting (online meeting + calendar event). */
export async function createTeamsMeeting(
  ctx: GraphContext,
  input: CreateTeamsMeetingInput,
): Promise<TeamsMeeting> {
  const organizerId = input.organizerId ?? ctx.config.microsoft.organizerId;
  const { meeting, autoRecord } = await createOnlineMeeting(
    ctx,
    organizerId,
    input,
  );

  let calendarEventId: string | null = null;
  try {
    const event = await ctx.client.request<CalendarEventResource>(
      `/users/${organizerId}/calendar/events`,
      {
        method: "POST",
        version: "v1.0",
        body: buildCalendarEventBody(input, meeting.joinWebUrl),
      },
    );
    calendarEventId = event.id;
  } catch (err) {
    // The online meeting is the source of truth; a failed calendar mirror is
    // non-fatal (attendees still get our branded email + ICS). Surface it.
    (ctx.logger ?? noopLogger).error("graph.calendar_event.create_failed", {
      onlineMeetingId: meeting.id,
      error: String(err),
    });
  }

  return {
    onlineMeetingId: meeting.id,
    joinUrl: meeting.joinWebUrl,
    organizerId,
    calendarEventId,
    autoRecord,
  };
}

/** Update the time/subject of an existing Teams meeting (online meeting + event). */
export async function updateTeamsMeeting(
  ctx: GraphContext,
  meeting: TeamsMeeting,
  patch: { subject?: string; startUtc?: number; endUtc?: number },
): Promise<void> {
  const body: Record<string, unknown> = {};
  if (patch.subject !== undefined) body.subject = patch.subject;
  if (patch.startUtc !== undefined)
    body.startDateTime = new Date(patch.startUtc).toISOString();
  if (patch.endUtc !== undefined)
    body.endDateTime = new Date(patch.endUtc).toISOString();
  if (Object.keys(body).length > 0) {
    await ctx.client.request(
      `/users/${meeting.organizerId}/onlineMeetings/${meeting.onlineMeetingId}`,
      {
        method: "PATCH",
        version: "v1.0",
        body,
      },
    );
  }

  if (meeting.calendarEventId) {
    const eventBody: Record<string, unknown> = {};
    if (patch.subject !== undefined) eventBody.subject = patch.subject;
    if (patch.startUtc !== undefined) {
      eventBody.start = {
        dateTime: new Date(patch.startUtc).toISOString(),
        timeZone: "UTC",
      };
    }
    if (patch.endUtc !== undefined) {
      eventBody.end = {
        dateTime: new Date(patch.endUtc).toISOString(),
        timeZone: "UTC",
      };
    }
    if (Object.keys(eventBody).length > 0) {
      await ctx.client.request(
        `/users/${meeting.organizerId}/calendar/events/${meeting.calendarEventId}`,
        { method: "PATCH", version: "v1.0", body: eventBody },
      );
    }
  }
}

/** Cancel a Teams meeting: delete the online meeting and its calendar event. */
export async function cancelTeamsMeeting(
  ctx: GraphContext,
  meeting: TeamsMeeting,
): Promise<void> {
  if (meeting.calendarEventId) {
    await ctx.client
      .request(
        `/users/${meeting.organizerId}/calendar/events/${meeting.calendarEventId}`,
        {
          method: "DELETE",
          version: "v1.0",
        },
      )
      .catch((err) =>
        (ctx.logger ?? noopLogger).warn("graph.event.delete_failed", {
          error: String(err),
        }),
      );
  }
  await ctx.client.request(
    `/users/${meeting.organizerId}/onlineMeetings/${meeting.onlineMeetingId}`,
    { method: "DELETE", version: "v1.0" },
  );
}
