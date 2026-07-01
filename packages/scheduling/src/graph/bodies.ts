/**
 * Pure request-body builders for Microsoft Graph. Kept separate from the HTTP
 * client so they can be unit-tested without any network or auth.
 */
import type {
  CalendarEventCreateBody,
  CreateTeamsMeetingInput,
  MeetingAttendee,
  OnlineMeetingCreateBody,
} from "./types";

/** ISO-8601 with explicit `Z`, the shape Graph's onlineMeeting endpoint expects. */
function toGraphInstant(epochMs: number): string {
  return new Date(epochMs).toISOString();
}

/**
 * Build the `POST /onlineMeetings` body (path B). `recordAutomatically` is only
 * set when recording is opted-in AND `betaFields` is true — it lives on the beta
 * endpoint, so the v1.0 fallback omits it.
 */
export function buildOnlineMeetingBody(
  input: CreateTeamsMeetingInput,
  betaFields: boolean,
): OnlineMeetingCreateBody {
  const body: OnlineMeetingCreateBody = {
    startDateTime: toGraphInstant(input.startUtc),
    endDateTime: toGraphInstant(input.endUtc),
    subject: input.subject,
    lobbyBypassSettings: { scope: input.lobby ?? "organization" },
    allowedPresenters: input.allowedPresenters ?? "organizer",
  };
  if (betaFields) {
    body.allowRecording = input.record;
    body.allowTranscription = input.transcribe;
    if (input.record) body.recordAutomatically = true;
  }
  return body;
}

/** Compose the branded HTML body for the calendar event, appending the join link. */
export function buildEventHtml(
  descriptionHtml: string | undefined,
  joinUrl: string,
): string {
  const base = descriptionHtml?.trim() ? `${descriptionHtml}<br/><br/>` : "";
  return (
    `${base}` +
    `<div><strong>Microsoft Teams meeting</strong></div>` +
    `<div><a href="${joinUrl}">Join the meeting</a></div>` +
    `<div style="color:#5d676a;font-size:12px;margin-top:8px">` +
    `This meeting is transcribed automatically; recording may be enabled.</div>`
  );
}

/** Build the `POST /users/{id}/calendar/events` body (path A), referencing the join URL. */
export function buildCalendarEventBody(
  input: CreateTeamsMeetingInput,
  joinUrl: string,
): CalendarEventCreateBody {
  return {
    subject: input.subject,
    body: {
      contentType: "HTML",
      content: buildEventHtml(input.descriptionHtml, joinUrl),
    },
    start: { dateTime: toGraphInstant(input.startUtc), timeZone: "UTC" },
    end: { dateTime: toGraphInstant(input.endUtc), timeZone: "UTC" },
    attendees: input.attendees.map((a: MeetingAttendee) => ({
      emailAddress: { address: a.email, name: a.name },
      type: a.type ?? "required",
    })),
    isReminderOn: true,
    location: { displayName: "Microsoft Teams Meeting" },
  };
}
