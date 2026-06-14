// Server-side exports (no "use client" directive)
export {
  type AuthCallbackConfig,
  type AuthCallbackErrorSource,
  type AuthCallbackFlow,
  type AuthCallbackHook,
  type AuthCallbackHookContext,
  type AuthCallbackHookErrorMode,
  type AuthCallbackLinkingErrorContext,
  type AuthCallbackLinkingErrorMessageResolver,
  type AuthCallbackLinkingFlowContext,
  type AuthCallbackLinkingFlowDetector,
  type AuthCallbackRedirectTarget,
  type AuthCallbackSuccessRedirectResolver,
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
