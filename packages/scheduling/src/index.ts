/**
 * @caffeinebounce/scheduling — framework-agnostic scheduling kernel.
 *
 * Subpath entries:
 *   - `@caffeinebounce/scheduling/engine`  — availability/slot computation
 *   - `@caffeinebounce/scheduling/crypto`  — AES-256-GCM token encryption
 *   - `@caffeinebounce/scheduling/graph`   — Microsoft Graph / Teams client
 *   - `@caffeinebounce/scheduling/google`  — Google Calendar (free/busy + OAuth)
 *   - `@caffeinebounce/scheduling/ics`     — iCalendar (.ics) generation
 *   - `@caffeinebounce/scheduling/ports`   — injected DI seams
 *   - `@caffeinebounce/scheduling/types`   — shared domain types
 *
 * The Graph / Google clients depend only on injected ports (`TokenStore`,
 * `Logger`, `Clock`, `SchedulingConfig`), so this package never imports a DB
 * or framework.
 */

export { decrypt, encrypt } from "./crypto";
export {
  clamp,
  computeAvailableSlots,
  contains,
  expandSchedule,
  expandSchedules,
  getLocalParts,
  intersect,
  intersectMany,
  localDateKey,
  localDayMinuteToUtc,
  normalize,
  offsetMinutes,
  subtract,
  totalMs,
  union,
  zonedWallTimeToUtc,
} from "./engine";
export * from "./google";
export * from "./graph";
export * from "./ics";
export * from "./ports";
export * from "./types";
