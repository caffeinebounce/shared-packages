# @caffeinebounce/email

## 0.6.127

### Patch Changes

- f389e8e: Replace several regex-based helpers with bounded string logic to clear
  post-public CodeQL alerts.
- e3d1867: Disable published source maps and mark package metadata as source-available for
  the public-readiness sweep.

## 0.6.126

### Patch Changes

- f14321a: Update vulnerable runtime dependency trees for email delivery and the Studio editor.

## 0.6.125

### Patch Changes

- Promote Factory portal legal layout, footer logo, and email card radius support into the published shared packages.

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
