---
"@caffeinebounce/shared-utils": minor
"@caffeinebounce/identity": patch
---

Add runtime origin detection for preview environments

- Added `isPreviewEnvironment()` to detect localhost, *.local, and preview platform domains (onrender.com, vercel.app, etc.)
- Added `isRenderPreviewDomain()` to specifically detect Render preview deployments
- Added `getClientOrigin()` for client-side origin detection that prefers actual window.location.origin in preview environments
- Added `getServerOrigin()` for server-side origin detection using request headers
- Updated auth forms (SigninForm, SignupForm, ForgotPasswordForm) to use `getClientOrigin()` for correct redirect URLs in previews
- Updated LinkedAccountsSection to use `getClientOrigin()` for OAuth redirect URLs

This fixes an issue where preview environments would redirect users to production URLs after authentication because environment variables are baked at build time.
