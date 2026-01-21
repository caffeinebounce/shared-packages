---
"@caffeinebounce/identity": patch
---

Fix OAuth button loading state layout issues

- Remove unnecessary `<span>` wrapper around button text that caused layout conflicts
- Use canonical Tailwind `size-5` class instead of `h-5 w-5` for consistency
- Text is now a direct child of the button, matching the pattern used by other buttons
