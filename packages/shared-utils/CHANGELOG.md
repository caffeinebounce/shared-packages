# @caffeinebounce/shared-utils

## 0.7.134

### Patch Changes

- f389e8e: Replace several regex-based helpers with bounded string logic to clear
  post-public CodeQL alerts.
- e3d1867: Disable published source maps and mark package metadata as source-available for
  the public-readiness sweep.

## 0.7.133

### Patch Changes

- 358fe8a: Add an Aceternity-inspired images slider marketing component, shared Microsoft Clarity and Google Tag Manager utility helpers, and UI analytics wrapper hardening.

## 0.7.43

### Patch Changes

- ce8fea1: Migrate shared Zod usage to v4-compatible package versions and internal typings.

## 0.7.8

### Patch Changes

- 7a22a9c: Add .ts.net (Tailscale MagicDNS) to preview environment detection

## 0.7.3

### Patch Changes

- ffad606: fix: treat raw IP addresses as preview environments

  OAuth redirects were going to production when using dev servers accessed via IP
  (e.g., Tailscale). Now any raw IPv4 address is treated as a preview environment,
  using window.location.origin instead of NEXT_PUBLIC_SITE_URL.

## 0.7.2

### Patch Changes

- 288609a: fix: prevent empty string return from getClientOrigin during SSR

  When NEXT_PUBLIC_SITE_URL is not set at build time, getClientOrigin was returning
  an empty string during SSR, which caused 'Failed to parse URL' errors when the
  result was passed to new URL(). Now returns a safe fallback with a warning.

## 0.7.0

### Minor Changes

- e3a3a28: Add normalizeEmail and now() utilities for DRY refactoring

## 0.6.0

### Minor Changes

- 67c0c8b: Add formatCompactCurrency utility for compact currency formatting with K/M suffixes

## 0.5.0

### Minor Changes

- dbccb63: Add runtime origin detection for preview environments

  - Added `isPreviewEnvironment()` to detect localhost, \*.local, and preview platform domains (onrender.com, vercel.app, etc.)
  - Added `isRenderPreviewDomain()` to specifically detect Render preview deployments
  - Added `getClientOrigin()` for client-side origin detection that prefers actual window.location.origin in preview environments
  - Added `getServerOrigin()` for server-side origin detection using request headers
  - Updated auth forms (SigninForm, SignupForm, ForgotPasswordForm) to use `getClientOrigin()` for correct redirect URLs in previews
  - Updated LinkedAccountsSection to use `getClientOrigin()` for OAuth redirect URLs

  This fixes an issue where preview environments would redirect users to production URLs after authentication because environment variables are baked at build time.

## 0.4.1

### Patch Changes

- 0704b46: Modernize device fingerprint utilities

  - Use User-Agent Client Hints API (navigator.userAgentData) with fallback to deprecated navigator.platform
  - Remove console.log statements from getGeolocationFromIP stub
  - Add formatPhoneInput() function for phone number input masking
  - Replace local formatPhoneNumber in PhoneSection with shared-utils import

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
