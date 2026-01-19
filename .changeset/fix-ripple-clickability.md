---
"@caffeinebounce/identity": patch
---

Fix ripple effect clickability on auth pages

- Remove extra pointer-events-auto wrapper in AuthPageLayout that was blocking clicks to the ripple effect
- Add pointer-events-auto to Home link in AuthFormLayout to ensure it remains clickable
