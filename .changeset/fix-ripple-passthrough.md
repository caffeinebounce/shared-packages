---
"@caffeinebounce/identity": patch
---

Fix ripple effect click passthrough on auth pages

Content wrapper now uses pointer-events-none to allow clicks to pass through
to the ripple grid, with pointer-events-auto on actual content (form).
