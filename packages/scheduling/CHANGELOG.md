# @caffeinebounce/scheduling

## 0.1.1

### Patch Changes

- Publish `@caffeinebounce/*` to the public npm registry. Migrates `publishConfig` from restricted GitHub Packages to public npm (`access: public`), so the packages install without a token.
- 2be7e18: Declare the MIT license in the package manifest (consistent with the repo license and the other `@caffeinebounce/*` packages).
- e662d7a: Land the `@caffeinebounce/scheduling` kernel — slot engine (timezone/DST-correct expansion, recurrence, exception-aware `computeAvailableSlots`), Microsoft Graph/Teams client (app-only auth, hybrid online-meeting + calendar event, transcripts/recordings, change-notification subscriptions), Google + Microsoft delegated OAuth + free/busy, AES-256-GCM token crypto, hand-rolled RFC-5545 ICS, and DI ports — and add a reusable `tcc` email theme to `@caffeinebounce/email`. Powers the TCC Scheduler app.
