/**
 * Microsoft Graph request/response shapes and the domain inputs the high-level
 * meeting helpers accept. Hand-typed (rather than depending on
 * `@microsoft/microsoft-graph-types`) to keep the package dependency-free; we
 * only model the fields we actually send/read.
 */

export type LobbyScope =
  | "everyone"
  | "organization"
  | "organizationAndFederated"
  | "organizer";
export type PresenterScope =
  | "everyone"
  | "organization"
  | "roleIsPresenter"
  | "organizer";
export type AttendeeType = "required" | "optional";

/** A participant on the Outlook calendar event (path A). */
export interface MeetingAttendee {
  email: string;
  name?: string;
  type?: AttendeeType;
}

/** Domain input for creating a Teams meeting (hybrid online-meeting + event). */
export interface CreateTeamsMeetingInput {
  subject: string;
  /** Meeting start/end, epoch ms (UTC). */
  startUtc: number;
  endUtc: number;
  /** Opt-in cloud recording (auto-starts, no host required). */
  record: boolean;
  /** Auto-transcription (default policy is on for TCC). */
  transcribe: boolean;
  /** Attendees to invite on the Outlook event (internal/tenant recipients). */
  attendees: MeetingAttendee[];
  /** Organizer mailbox object id; defaults to `config.microsoft.organizerId`. */
  organizerId?: string;
  /** Branded HTML for the calendar event body (join link is appended). */
  descriptionHtml?: string;
  lobby?: LobbyScope;
  allowedPresenters?: PresenterScope;
}

/** Request body for `POST /onlineMeetings` (beta superset). */
export interface OnlineMeetingCreateBody {
  startDateTime: string;
  endDateTime: string;
  subject: string;
  recordAutomatically?: boolean;
  allowRecording?: boolean;
  allowTranscription?: boolean;
  lobbyBypassSettings?: { scope: LobbyScope };
  allowedPresenters?: PresenterScope;
}

/** Subset of the `onlineMeeting` resource we consume. */
export interface OnlineMeetingResource {
  id: string;
  joinWebUrl: string;
}

/** Request body for `POST /users/{id}/calendar/events`. */
export interface CalendarEventCreateBody {
  subject: string;
  body: { contentType: "HTML" | "Text"; content: string };
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  attendees: Array<{
    emailAddress: { address: string; name?: string };
    type: AttendeeType;
  }>;
  isReminderOn: boolean;
  location?: { displayName: string };
}

/** Subset of the `event` resource we consume. */
export interface CalendarEventResource {
  id: string;
  webLink?: string;
}

/** The persisted result of creating a Teams meeting. */
export interface TeamsMeeting {
  onlineMeetingId: string;
  joinUrl: string;
  organizerId: string;
  calendarEventId: string | null;
  /** True when `recordAutomatically` was accepted (beta path succeeded). */
  autoRecord: boolean;
}

/** A transcript artifact reference from Graph. */
export interface TranscriptRef {
  id: string;
  onlineMeetingId: string;
  createdDateTime?: string;
}

/** A recording artifact reference from Graph. */
export interface RecordingRef {
  id: string;
  onlineMeetingId: string;
  createdDateTime?: string;
  recordingContentUrl?: string;
}
