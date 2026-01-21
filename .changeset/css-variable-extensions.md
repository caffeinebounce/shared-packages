---
"@caffeinebounce/ui": minor
---

Add CSS variable extensions and data-theme support for brand customization

- Add 10 new CSS custom properties for brand customization (accent colors, gradients, typography, shadow/spacing multipliers)
- Implement 8 theme variants via data-theme attribute (light, dark, colorful, high-contrast, high-contrast-dark, deuteranopia, protanopia, tritanopia)
- Add accessibility media queries for prefers-contrast and prefers-reduced-motion
- Map new brand variables to Tailwind color utilities
- Add TypeScript types for brand customization variables (brandVariables, brandDefaults)
