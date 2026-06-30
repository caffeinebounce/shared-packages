/**
 * Minimal, dependency-free RFC-5545 (iCalendar) generator for meeting invites.
 *
 * External advisors and company contacts aren't in TCC's M365 tenant, so they
 * never receive a native Outlook invite — we attach a `.ics` to a branded email
 * instead. Correct lifecycle threading is the load-bearing detail:
 *   - `UID` is stable per booking (so updates/cancels thread together),
 *   - `SEQUENCE` MUST increment on every update/cancel (clients ignore a
 *     reschedule whose SEQUENCE didn't advance),
 *   - `METHOD:REQUEST` for create/update, `METHOD:CANCEL` + `STATUS:CANCELLED`
 *     for cancellation.
 *
 * We hand-roll the serializer (rather than pull a dependency) because our needs
 * are narrow and we want the package to stay dependency-free and exhaustively
 * testable.
 */

export interface IcsAttendee {
  email: string;
  name?: string;
  /** Ask the client to prompt for an RSVP. Default true for REQUEST. */
  rsvp?: boolean;
}

export interface IcsEvent {
  /** Stable per booking, e.g. `booking-<id>@scheduler.thecapitalcollective.org`. */
  uid: string;
  /** Monotonic revision; increment on each update/cancel. */
  sequence: number;
  method: "REQUEST" | "CANCEL";
  /** Meeting start/end, epoch ms (serialized as UTC). */
  start: number;
  end: number;
  title: string;
  description?: string;
  /** Human location label, e.g. "Microsoft Teams Meeting". */
  location?: string;
  /** Teams join URL — embedded in LOCATION/DESCRIPTION/URL. */
  joinUrl?: string;
  organizer: { email: string; name?: string };
  attendees: IcsAttendee[];
  /** Stamp time, epoch ms. Pass `clock.now()`; defaults to real time. */
  dtstamp?: number;
}

export interface IcsResult {
  content: string;
  filename: string;
  /** The calendar method, for the email's `Content-Type` parameter. */
  method: "REQUEST" | "CANCEL";
}

const PRODID = "-//The Capital Collective//TCC Scheduler//EN";

/** Format an instant as an RFC-5545 UTC date-time: `YYYYMMDDTHHMMSSZ`. */
export function formatIcsUtc(epochMs: number): string {
  const d = new Date(epochMs);
  const p = (n: number, w = 2) => String(n).padStart(w, "0");
  return (
    `${p(d.getUTCFullYear(), 4)}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}` +
    `T${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}Z`
  );
}

/** Escape a TEXT value per RFC-5545 §3.3.11. */
function escapeText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/**
 * Fold a content line to ≤75 octets per RFC-5545 §3.1, continuing with a leading
 * space. Operates on UTF-8 octets so multi-byte characters aren't split mid-fold.
 */
function foldLine(line: string): string {
  const bytes = Buffer.from(line, "utf-8");
  if (bytes.length <= 75) return line;

  const chunks: string[] = [];
  let chunkBytes = 0;
  let chunkChars = "";
  let limit = 75; // first line: 75 octets
  for (const ch of line) {
    const chLen = Buffer.byteLength(ch, "utf-8");
    if (chunkBytes + chLen > limit) {
      chunks.push(chunkChars);
      chunkChars = "";
      chunkBytes = 0;
      limit = 74; // continuation lines: leading space consumes one octet
    }
    chunkChars += ch;
    chunkBytes += chLen;
  }
  if (chunkChars) chunks.push(chunkChars);
  return chunks.join("\r\n ");
}

function line(name: string, value: string): string {
  return foldLine(`${name}:${value}`);
}

/** Build a `.ics` (single VEVENT) for a meeting invite or cancellation. */
export function buildIcs(event: IcsEvent): IcsResult {
  const dtstamp = event.dtstamp ?? Date.now();
  const isCancel = event.method === "CANCEL";

  const descriptionParts: string[] = [];
  if (event.description) descriptionParts.push(event.description);
  if (event.joinUrl)
    descriptionParts.push(`Join Microsoft Teams meeting: ${event.joinUrl}`);
  const description = descriptionParts.join("\n\n");
  const location =
    event.location ?? (event.joinUrl ? "Microsoft Teams Meeting" : "");

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    line("PRODID", PRODID),
    "CALSCALE:GREGORIAN",
    `METHOD:${event.method}`,
    "BEGIN:VEVENT",
    line("UID", event.uid),
    `SEQUENCE:${event.sequence}`,
    `DTSTAMP:${formatIcsUtc(dtstamp)}`,
    `DTSTART:${formatIcsUtc(event.start)}`,
    `DTEND:${formatIcsUtc(event.end)}`,
    line("SUMMARY", escapeText(event.title)),
    `STATUS:${isCancel ? "CANCELLED" : "CONFIRMED"}`,
    line(
      "ORGANIZER",
      `${event.organizer.name ? `CN=${escapeText(event.organizer.name)}:` : ""}mailto:${event.organizer.email}`,
    ),
  ];

  if (description) lines.push(line("DESCRIPTION", escapeText(description)));
  if (location) lines.push(line("LOCATION", escapeText(location)));
  if (event.joinUrl) lines.push(line("URL", event.joinUrl));

  for (const a of event.attendees) {
    const rsvp = a.rsvp ?? !isCancel;
    const params = [
      `ROLE=REQ-PARTICIPANT`,
      `PARTSTAT=${isCancel ? "DECLINED" : "NEEDS-ACTION"}`,
      `RSVP=${rsvp ? "TRUE" : "FALSE"}`,
      a.name ? `CN=${escapeText(a.name)}` : null,
    ]
      .filter(Boolean)
      .join(";");
    lines.push(line(`ATTENDEE;${params}`, `mailto:${a.email}`));
  }

  lines.push("END:VEVENT", "END:VCALENDAR");

  return {
    content: `${lines.join("\r\n")}\r\n`,
    filename: "invite.ics",
    method: event.method,
  };
}
