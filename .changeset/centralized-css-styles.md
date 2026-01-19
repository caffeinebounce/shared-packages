---
"@caffeinebounce/ui": minor
---

Add centralized base CSS styles export (`@caffeinebounce/ui/styles.css`)

This consolidates ~400 lines of common CSS that was previously duplicated across product repos:
- CSS custom properties (layout, colors, ripple effect variables)
- Dark mode variables and `.dark` class overrides
- `@custom-variant dark` declaration for Tailwind v4
- `@theme inline` mappings for semantic color tokens
- Base layer styles, container utilities, and component-specific styles

Product repos can now import this single CSS file and only need to define their own `@source` directives, `@plugin` directives, and brand color overrides.
