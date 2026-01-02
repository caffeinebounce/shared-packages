---
"@caffeinebounce/identity": patch
---

Fix auth redirects to use NEXT_PUBLIC_SITE_URL

- ForgotPasswordForm: use callback route with PKCE flow for password reset
- SigninForm: use production site URL for OAuth redirects
- SignupForm: use production site URL for OAuth and email verification
- Add 'callback' link to AuthLinks type for PKCE code exchange routing

This ensures auth redirects work correctly in production environments.
