---
"@caffeinebounce/scheduling": patch
"@caffeinebounce/email": patch
---

Land the `@caffeinebounce/scheduling` kernel — slot engine (timezone/DST-correct expansion, recurrence, exception-aware `computeAvailableSlots`), Microsoft Graph/Teams client (app-only auth, hybrid online-meeting + calendar event, transcripts/recordings, change-notification subscriptions), Google + Microsoft delegated OAuth + free/busy, AES-256-GCM token crypto, hand-rolled RFC-5545 ICS, and DI ports — and add a reusable `tcc` email theme to `@caffeinebounce/email`. Powers the TCC Scheduler app.
