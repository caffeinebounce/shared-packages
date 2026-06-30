/**
 * Microsoft Graph / Teams client. Import from `@caffeinebounce/scheduling/graph`.
 *
 * Construct a `GraphClient` with your `SchedulingConfig`, then pass a
 * `GraphContext` ({ client, config, logger }) to the meeting/artifact helpers.
 */

export {
  type ArtifactKind,
  type ArtifactRoutingResult,
  type BookingRoutingRecord,
  fetchTranscriptVtt,
  listRecordings,
  listTranscripts,
  routeArtifact,
} from "./artifacts";
export {
  buildCalendarEventBody,
  buildEventHtml,
  buildOnlineMeetingBody,
} from "./bodies";
export type {
  GraphClientDeps,
  GraphRequestOptions,
  GraphVersion,
} from "./client";
export { GraphClient, GraphError } from "./client";
export { type GetScheduleInput, getMicrosoftBusy } from "./freebusy";
export {
  cancelTeamsMeeting,
  createTeamsMeeting,
  type GraphContext,
  updateTeamsMeeting,
} from "./meetings";
export {
  buildMicrosoftAuthUrl,
  exchangeMicrosoftCode,
  type MicrosoftOAuthDeps,
  refreshMicrosoftToken,
} from "./oauth";
export {
  buildSubscriptionBody,
  type CreateSubscriptionInput,
  clampExpiry,
  createSubscription,
  deleteSubscription,
  type ParsedArtifactNotification,
  parseArtifactNotificationResource,
  renewSubscription,
  type SubscriptionResource,
} from "./subscriptions";
export type * from "./types";
