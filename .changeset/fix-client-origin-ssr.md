---
"@caffeinebounce/shared-utils": patch
---

fix: prevent empty string return from getClientOrigin during SSR

When NEXT_PUBLIC_SITE_URL is not set at build time, getClientOrigin was returning
an empty string during SSR, which caused 'Failed to parse URL' errors when the
result was passed to new URL(). Now returns a safe fallback with a warning.

