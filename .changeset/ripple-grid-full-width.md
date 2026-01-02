---
"@caffeinebounce/ui": patch
---

Fix BackgroundRippleEffect to fill full viewport width on 4K monitors

- Changed column calculation to use viewport width instead of container width
- Grid now auto-calculates columns based on window.innerWidth with SSR fallback to 4K (3840px)
- Added overflow handling in HeroSectionWithRipple wrapper
- Removed fixed w-full class in favor of explicit 100vw width styling
