/**
 * @caffeinebounce/shared-utils
 *
 * Shared utility functions for Capital Collective projects.
 */

// Re-export auth utilities
export {
  generateRecoveryCodes,
  getDisplayName,
  type ParsedUserMetadata,
  parseUserMetadata,
  type RawUserMetadata,
} from "./auth";
// Re-export browser utilities
export { type DeviceFingerprint, generateDeviceFingerprint } from "./browser";
// Re-export email utilities
export { getEmailDomain } from "./email";
// Re-export all formatters
export {
  formatCompactCurrency,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatNumber,
  formatPercentage,
  formatPhoneInput,
  formatPhoneNumber,
} from "./formatters";
// Re-export all image utilities
export {
  type CompressImageOptions,
  compressImage,
  compressImageAsFile,
  getImageDimensions,
} from "./image";
// Re-export request/server utilities
export {
  type GeolocationInfo,
  generateSecureToken,
  getClientIP,
  getGeolocationFromIP,
  hashString,
} from "./request";
// Re-export all string utilities
export {
  capitalize,
  ensureAbsoluteUrl,
  getInitials,
  pluralize,
  slugify,
  truncate,
} from "./string";
// Re-export URL validators
export {
  // Factory functions
  createSocialHandleSchema,
  createSocialUrlSchema,
  createUrlSchema,
  // Pre-built URL validators
  facebookUrlSchema,
  // Environment detection
  getClientOrigin,
  getServerOrigin,
  // Pre-built handle validators
  instagramHandleSchema,
  isPreviewEnvironment,
  isRenderPreviewDomain,
  linkedinUrlSchema,
  pinterestUrlSchema,
  // Types
  type SocialHandleSchemaConfig,
  type SocialUrlSchemaConfig,
  tiktokHandleSchema,
  tiktokUrlSchema,
  websiteUrlSchema,
  xHandleSchema,
  xUrlSchema,
  youtubeUrlSchema,
} from "./url";
