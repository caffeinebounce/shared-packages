---
"@caffeinebounce/identity": patch
---

Reduce polling frequency for EmailVerificationPending component from 2 seconds to 60 seconds. Uses Supabase auth state change listener as primary update mechanism with polling as fallback. Stops polling after 1 hour with manual refresh option.
