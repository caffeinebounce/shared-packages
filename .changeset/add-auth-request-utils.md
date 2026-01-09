---
"@caffeinebounce/shared-utils": minor
"@caffeinebounce/ui": patch
"@caffeinebounce/identity": patch
---

Add new utility modules for auth, browser, email, and request handling:

- **auth.ts**: `parseUserMetadata()`, `getDisplayName()`, `generateRecoveryCodes()` for OAuth metadata parsing and recovery code generation
- **browser.ts**: `generateDeviceFingerprint()` for collecting browser/device information
- **email.ts**: `getEmailDomain()` for extracting domains from email addresses
- **request.ts**: `getClientIP()`, `getGeolocationFromIP()`, `hashString()`, `generateSecureToken()` for server-side request handling

All utilities include comprehensive TypeScript types and test coverage.

**@caffeinebounce/ui**: Replaced local `formatDate` with shared utility in DataTableSummary
**@caffeinebounce/identity**: Replaced local `formatDate` with shared utility in RecoverySection
