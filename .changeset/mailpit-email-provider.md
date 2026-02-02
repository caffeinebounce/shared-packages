---
"@caffeinebounce/email": minor
---

Add multi-provider email support with SMTP and mock transports

- Add `createUniversalEmailClient()` factory supporting Resend, SMTP, and mock providers
- Add `createSmtpTransport()` for local development with Mailpit/Mailtrap
- Add `mockEmailTransport` for test assertions
- Add Docker Compose configuration for Mailpit local email testing
- Environment-based provider selection via `EMAIL_PROVIDER`
