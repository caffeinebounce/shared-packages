# @caffeinebounce/email

## 0.6.0

### Minor Changes

- d9a5ac4: Add multi-provider email support with SMTP and mock transports

  - Add `createUniversalEmailClient()` factory supporting Resend, SMTP, and mock providers
  - Add `createSmtpTransport()` for local development with Mailpit/Mailtrap
  - Add `mockEmailTransport` for test assertions
  - Add Docker Compose configuration for Mailpit local email testing
  - Environment-based provider selection via `EMAIL_PROVIDER`

## 0.2.0

### Minor Changes

- 84b153f: Add newsletter welcome email template

  - New `NewsletterWelcomeTemplate` component for welcoming newsletter subscribers
  - Added `unsubscribeLink` and `unsubscribeText` props to `EmailFooter` for marketing email compliance
  - Exported new template from package index
