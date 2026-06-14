---
"@caffeinebounce/identity": minor
---

Make auth callback policy configurable by adding success redirect, linking-flow,
and linking-error message hooks. The default callback handler now keeps
app-specific role, approval, domain, and branded copy out of the shared package.
