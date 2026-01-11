---
"@caffeinebounce/identity": patch
---

Replace console.error calls with structured logging via useErrorLogger hook

Migrates all console.error calls in the identity package to use the
`useErrorLogger` hook from `@caffeinebounce/logger` for improved
observability in Better Stack.

Components updated:
- PasswordSection, DeleteAccountSection, PhoneSection, RecoverySection
- SigninForm, ResetPasswordForm
- MFARecovery, MFAProvider, TOTPEnrollmentDialog, TwoFactorSection

Total: 17 console.error calls replaced
