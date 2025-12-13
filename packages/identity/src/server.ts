// Server-side exports (no "use client" directive)
export { type AuthCallbackConfig, createAuthCallbackHandler } from "./handlers";

// Server-safe utilities
export {
  type GeolocationInfo,
  generateSecureToken,
  getClientIP,
  getGeolocationFromIP,
  hashString,
} from "./utils";
