// Server-side exports (no "use client" directive)
export {
  type AuthCallbackConfig,
  type AuthCallbackFlow,
  type AuthCallbackHook,
  type AuthCallbackHookContext,
  type AuthCallbackHookErrorMode,
  createAuthCallbackHandler,
} from "./handlers";

// Server-safe utilities
export {
  type GeolocationInfo,
  generateSecureToken,
  getClientIP,
  getGeolocationFromIP,
  hashString,
} from "./utils";
