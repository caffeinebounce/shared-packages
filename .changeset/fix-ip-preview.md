---
"@caffeinebounce/shared-utils": patch
---

fix: treat raw IP addresses as preview environments

OAuth redirects were going to production when using dev servers accessed via IP
(e.g., Tailscale). Now any raw IPv4 address is treated as a preview environment,
using window.location.origin instead of NEXT_PUBLIC_SITE_URL.

