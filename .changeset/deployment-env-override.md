---
"@caffeinebounce/logger": patch
---

Add DEPLOYMENT_ENV environment variable override for explicit environment detection. Set DEPLOYMENT_ENV=preview on persistent preview environments to correctly identify them in logs.
