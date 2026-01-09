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
  formatCurrency,
  formatDate,
  formatDateTime,
  formatNumber,
  formatPercentage,
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
  // Factory functions (alphabetical)
  createSocialHandleSchema,
  createSocialUrlSchema,
  createUrlSchema,
  // Pre-built URL validators (alphabetical)
  facebookUrlSchema,
  // Pre-built handle validators (alphabetical)
  instagramHandleSchema,
  linkedinUrlSchema,
  pinterestUrlSchema,
  // Types (alphabetical)
  type SocialHandleSchemaConfig,
  type SocialUrlSchemaConfig,
  tiktokHandleSchema,
  tiktokUrlSchema,
  websiteUrlSchema,
  xHandleSchema,
  xUrlSchema,
  youtubeUrlSchema,
} from "./url";
