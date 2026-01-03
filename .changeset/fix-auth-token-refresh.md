---
"@caffeinebounce/identity": patch
---

Fix token refresh loops in EmailVerificationPending and MFAProvider

- Changed EmailVerificationPending to use getSession() instead of getUser() when polling
- Changed MFAProvider.refreshAAL() to use getSession() instead of getUser()
- getSession() reads from cookies locally (no API call) vs getUser() which makes API calls that can trigger token refresh
