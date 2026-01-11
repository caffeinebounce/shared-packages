---
"@caffeinebounce/shared-utils": patch
"@caffeinebounce/identity": patch
---

Modernize device fingerprint utilities

- Use User-Agent Client Hints API (navigator.userAgentData) with fallback to deprecated navigator.platform
- Remove console.log statements from getGeolocationFromIP stub
- Add formatPhoneInput() function for phone number input masking
- Replace local formatPhoneNumber in PhoneSection with shared-utils import
