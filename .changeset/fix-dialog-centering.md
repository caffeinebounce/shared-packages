---
"@caffeinebounce/ui": patch
---

Fix Dialog centering issue where dialogs appeared offset to bottom-left instead of centered.

Changed from transform-based centering (translate-x/y -50%) to flexbox-based centering to avoid conflicts with animate-in animation transforms. The slide animation has been simplified to a vertical-only slide (slide-in-from-top-[2%]) which works correctly with the new flexbox positioning.
