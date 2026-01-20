---
"@caffeinebounce/ui": minor
---

Add sticky navbar with hide-on-scroll-down behavior and fix dark mode primary colors

**Navbar improvements:**
- Add `hideOnScrollDown` prop for marketing pages
- When enabled, navbar hides on scroll down and reappears on scroll up
- Uses new `useScrollDirection` hook with requestAnimationFrame for smooth performance

**CSS fixes:**
- Remove dark mode `--primary` and `--primary-foreground` overrides from base.css
- Products setting brand colors in `:root` now work consistently in both light and dark modes
- Dark brand primaries (L < 0.7) automatically get white text without additional overrides
