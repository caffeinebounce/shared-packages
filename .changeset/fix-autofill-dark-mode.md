---
"@caffeinebounce/ui": patch
---

Fix autofill background color unreadable in dark mode

- Override browser autofill styles to maintain proper text contrast
- Use CSS variables (--foreground, --background, --card) for theme consistency
- Support both WebKit/Blink (Chrome, Safari, Edge) and Firefox browsers
