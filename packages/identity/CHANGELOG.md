# @caffeinebounce/identity

## 0.5.4

### Patch Changes

- c009dc0: Fix @logtail/next dynamic require() issue with Turbopack

  - Added `@caffeinebounce/logger/client` export with `useErrorLoggerSafe` hook that doesn't import @logtail/next
  - Updated identity package components to use the client-safe logger hook
  - This fixes SSG/SSR build errors when using identity components with Next.js Turbopack

- Updated dependencies [c009dc0]
  - @caffeinebounce/logger@0.6.0

## 0.5.3

### Patch Changes

- Updated dependencies
  - @caffeinebounce/ui@0.34.0

## 0.5.2

### Patch Changes

- 0704b46: Modernize device fingerprint utilities

  - Use User-Agent Client Hints API (navigator.userAgentData) with fallback to deprecated navigator.platform
  - Remove console.log statements from getGeolocationFromIP stub
  - Add formatPhoneInput() function for phone number input masking
  - Replace local formatPhoneNumber in PhoneSection with shared-utils import

- f9f5e85: Replace console.error calls with structured logging via useErrorLogger hook

  Migrates all console.error calls in the identity package to use the
  `useErrorLogger` hook from `@caffeinebounce/logger` for improved
  observability in Better Stack.

  Components updated:

  - PasswordSection, DeleteAccountSection, PhoneSection, RecoverySection
  - SigninForm, ResetPasswordForm
  - MFARecovery, MFAProvider, TOTPEnrollmentDialog, TwoFactorSection

  Total: 17 console.error calls replaced

- Updated dependencies [76c7b79]
- Updated dependencies [0704b46]
- Updated dependencies [cf2b175]
  - @caffeinebounce/ui@0.33.1
  - @caffeinebounce/shared-utils@0.4.1

## 0.4.7

### Patch Changes

- 825ad96: Add new utility modules for auth, browser, email, and request handling:

  - **auth.ts**: `parseUserMetadata()`, `getDisplayName()`, `generateRecoveryCodes()` for OAuth metadata parsing and recovery code generation
  - **browser.ts**: `generateDeviceFingerprint()` for collecting browser/device information
  - **email.ts**: `getEmailDomain()` for extracting domains from email addresses
  - **request.ts**: `getClientIP()`, `getGeolocationFromIP()`, `hashString()`, `generateSecureToken()` for server-side request handling

  All utilities include comprehensive TypeScript types and test coverage.

  **@caffeinebounce/ui**: Replaced local `formatDate` with shared utility in DataTableSummary
  **@caffeinebounce/identity**: Replaced local `formatDate` with shared utility in RecoverySection

- Updated dependencies [825ad96]
  - @caffeinebounce/shared-utils@0.4.0
  - @caffeinebounce/ui@0.28.2

## 0.4.6

### Patch Changes

- Updated dependencies [14f9f9e]
  - @caffeinebounce/ui@0.25.0

## 0.4.5

### Patch Changes

- Updated dependencies [519457f]
- Updated dependencies [3e45e2d]
- Updated dependencies [b191a12]
  - @caffeinebounce/ui@0.24.0

## 0.4.4

### Patch Changes

- Updated dependencies [c68a21a]
  - @caffeinebounce/ui@0.23.0

## 0.4.3

### Patch Changes

- cebe01b: Reduce polling frequency for EmailVerificationPending component from 2 seconds to 60 seconds. Uses Supabase auth state change listener as primary update mechanism with polling as fallback. Stops polling after 1 hour with manual refresh option.

## 0.4.2

### Patch Changes

- d9f7705: Fix token refresh loops in EmailVerificationPending and MFAProvider

  - Changed EmailVerificationPending to use getSession() instead of getUser() when polling
  - Changed MFAProvider.refreshAAL() to use getSession() instead of getUser()
  - getSession() reads from cookies locally (no API call) vs getUser() which makes API calls that can trigger token refresh

## 0.4.1

### Patch Changes

- 65d6515: Fix security settings UI issues:
  - Move recovery email tooltip next to the setting header instead of the button
  - Change delete account button text from "Delete Account" to "Delete"
  - Add hover effect to delete account button
  - Fix delete account button alignment to match other page buttons

## 0.4.0

### Minor Changes

- 9b4db96: Add cursor-pointer to buttons, variant prop to SettingsTabs, and convert inline hints to tooltips

  **@caffeinebounce/ui:**

  - Added `cursor-pointer` and `disabled:cursor-not-allowed` to Button base styles
  - Added `variant` prop to SettingsTabs supporting "default" (pill) and "underline" styles

  **@caffeinebounce/identity:**

  - RecoverySection: Converted inline recovery email hint to tooltip with Info icon
  - DeleteAccountSection: Converted inline data retention description to tooltip with Info icon
  - DeleteAccountSection: Changed layout for horizontal alignment with right-aligned delete button

### Patch Changes

- Updated dependencies [9b4db96]
  - @caffeinebounce/ui@0.22.0

## 0.3.1

### Patch Changes

- 29d515e: Fix: Replace workspace:\* with npm version for @caffeinebounce/ui dependency

  The workspace:\* protocol doesn't work for consumers who install these packages from npm/GitHub Packages since they don't have a local workspace with @caffeinebounce/ui. This caused "workspace not found" errors when installing in consuming projects like Compass.

- Updated dependencies [29d515e]
- Updated dependencies [29d515e]
  - @caffeinebounce/ui@0.21.1

## 0.3.0

### Minor Changes

- d9bc2e1: Fixes

### Patch Changes

- Updated dependencies [d9bc2e1]
- Updated dependencies [d9bc2e1]
- Updated dependencies [d9bc2e1]
  - @caffeinebounce/ui@0.21.0

## 0.2.6

### Patch Changes

- 1db65fa: Fix auth redirects to use NEXT_PUBLIC_SITE_URL

  - ForgotPasswordForm: use callback route with PKCE flow for password reset
  - SigninForm: use production site URL for OAuth redirects
  - SignupForm: use production site URL for OAuth and email verification
  - Add 'callback' link to AuthLinks type for PKCE code exchange routing

  This ensures auth redirects work correctly in production environments.

## 0.2.5

### Patch Changes

- Updated dependencies [5019ddf]
- Updated dependencies [5019ddf]
  - @caffeinebounce/ui@1.0.0

## 0.2.4

### Patch Changes

- Updated dependencies
  - @caffeinebounce/ui@0.17.0

## 0.2.3

### Patch Changes

- Updated dependencies
- Updated dependencies [643fdb6]
- Updated dependencies [3b2e926]
- Updated dependencies [898eda5]
  - @caffeinebounce/ui@0.16.0

## 0.2.2

### Patch Changes

- Updated dependencies
  - @caffeinebounce/ui@0.15.2

## 0.2.1

### Patch Changes

- Updated dependencies
  - @caffeinebounce/ui@0.15.1

## 0.2.0

### Minor Changes

- Email verification fix

## 0.1.14

### Patch Changes

- Updated dependencies [92f0a7a]
- Updated dependencies [92f0a7a]
- Updated dependencies [92f0a7a]
- Updated dependencies [92f0a7a]
- Updated dependencies [92f0a7a]
- Updated dependencies [92f0a7a]
- Updated dependencies [92f0a7a]
- Updated dependencies [92f0a7a]
- Updated dependencies [92f0a7a]
  - @caffeinebounce/ui@0.15.0

## 0.1.13

### Patch Changes

- Updated dependencies [5d4a257]
  - @caffeinebounce/ui@0.14.1

## 0.1.12

### Patch Changes

- Updated dependencies [fa443a8]
  - @caffeinebounce/ui@0.14.0

## 0.1.11

### Patch Changes

- Updated dependencies
  - @caffeinebounce/ui@0.13.0

## 0.1.10

### Patch Changes

- df90d1c: Upgrade dependencies and align versions.
- Updated dependencies [965b44c]
- Updated dependencies
- Updated dependencies [df90d1c]
  - @caffeinebounce/ui@0.12.0

## 0.1.9

### Patch Changes

- Updated dependencies
  - @caffeinebounce/ui@0.11.0

## 0.1.8

### Patch Changes

- Updated dependencies [bc310ab]
- Updated dependencies [bc310ab]
  - @caffeinebounce/ui@0.10.0

## 0.1.7

### Patch Changes

- Updated dependencies
  - @caffeinebounce/ui@0.9.14

## 0.1.6

### Patch Changes

- Updated dependencies
  - @caffeinebounce/ui@0.9.13

## 0.1.5

### Patch Changes

- Export MFAConfirmDialog component

## 0.1.4

### Patch Changes

- Updated dependencies
  - @caffeinebounce/ui@0.4.0

## 0.1.3

### Patch Changes

- Updated dependencies
  - @caffeinebounce/ui@0.3.0

## 0.1.2

### Patch Changes

- Updated dependencies
  - @caffeinebounce/ui@0.2.0
