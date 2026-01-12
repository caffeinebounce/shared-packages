---
"@caffeinebounce/logger": minor
"@caffeinebounce/identity": patch
---

Fix @logtail/next dynamic require() issue with Turbopack

- Added `@caffeinebounce/logger/client` export with `useErrorLoggerSafe` hook that doesn't import @logtail/next
- Updated identity package components to use the client-safe logger hook
- This fixes SSG/SSR build errors when using identity components with Next.js Turbopack
