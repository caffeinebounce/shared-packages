// Server-side exports (no "use client" directive)
export { type AuthCallbackConfig, createAuthCallbackHandler } from "./handlers";

// Server-safe utilities
export {
  type GeolocationInfo,
  getGeolocationFromIP,
  getClientIP,
  hashString,
  generateSecureToken,
} from "./utils";
