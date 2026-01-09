# @caffeinebounce/shared-utils

## 0.4.0

### Minor Changes

- 825ad96: Add new utility modules for auth, browser, email, and request handling:

  - **auth.ts**: `parseUserMetadata()`, `getDisplayName()`, `generateRecoveryCodes()` for OAuth metadata parsing and recovery code generation
  - **browser.ts**: `generateDeviceFingerprint()` for collecting browser/device information
  - **email.ts**: `getEmailDomain()` for extracting domains from email addresses
  - **request.ts**: `getClientIP()`, `getGeolocationFromIP()`, `hashString()`, `generateSecureToken()` for server-side request handling

  All utilities include comprehensive TypeScript types and test coverage.

  **@caffeinebounce/ui**: Replaced local `formatDate` with shared utility in DataTableSummary
  **@caffeinebounce/identity**: Replaced local `formatDate` with shared utility in RecoverySection

## 0.3.0

### Minor Changes

- 847611f: Add social media URL and handle validators

  New features:

  - `createSocialUrlSchema()` - Factory function to create platform-specific URL validators
  - `createSocialHandleSchema()` - Factory function to create platform-specific handle validators
  - `createUrlSchema()` - Generic URL validator factory

  Pre-built validators for URLs:

  - `linkedinUrlSchema` - LinkedIn URLs (supports subdomains)
  - `facebookUrlSchema` - Facebook URLs (including fb.com)
  - `pinterestUrlSchema` - Pinterest URLs
  - `xUrlSchema` - X/Twitter URLs (supports both x.com and twitter.com)
  - `youtubeUrlSchema` - YouTube URLs (including youtu.be)
  - `tiktokUrlSchema` - TikTok URLs
  - `websiteUrlSchema` - Generic website URLs

  Pre-built validators for handles:

  - `instagramHandleSchema` - Instagram handles (max 30 chars)
  - `xHandleSchema` - X/Twitter handles (max 15 chars)
  - `tiktokHandleSchema` - TikTok handles (max 24 chars)

  All validators:

  - Accept URLs with or without protocol prefix
  - Handle empty strings gracefully (for optional fields)
  - Return helpful error messages with examples

## 0.2.0

### Minor Changes

- 9e96f8a: Create new @caffeinebounce/shared-utils package

  This new package contains shared utility functions extracted from Compass to reduce code duplication across projects:

  **Formatters** (`@caffeinebounce/shared-utils/formatters`)

  - `formatDate` - Format dates with customizable options
  - `formatDateTime` - Format dates with time
  - `formatPhoneNumber` - Format US phone numbers
  - `formatCurrency` - Format numbers as currency
  - `formatPercentage` - Format numbers as percentages
  - `formatNumber` - Format numbers with locale-aware separators

  **String utilities** (`@caffeinebounce/shared-utils/string`)

  - `getInitials` - Extract initials from names
  - `ensureAbsoluteUrl` - Add https:// to URLs missing protocol
  - `truncate` - Truncate text with ellipsis
  - `slugify` - Convert text to URL-safe slugs
  - `capitalize` - Capitalize first letter
  - `pluralize` - Pluralize words based on count

  **Image utilities** (`@caffeinebounce/shared-utils/image`)

  - `compressImage` - Compress images using Canvas API (returns base64)
  - `compressImageAsFile` - Compress images (returns File object)
  - `getImageDimensions` - Get image dimensions from File

  All utilities handle null/undefined gracefully with sensible defaults.

## 0.1.0

### Minor Changes

- Initial release with formatting, string, and image utilities
