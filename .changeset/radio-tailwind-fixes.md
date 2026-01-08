---
"@caffeinebounce/ui": patch
---

Fix RadioGroup dark mode styling and migrate Tailwind v4 class names

- Improved RadioGroup border and focus ring styling for better dark mode visibility
- Migrated deprecated `bg-gradient-to-*` classes to canonical `bg-linear-to-*` in CohortCard and ImpactSection
- Added pre-commit hook script to detect deprecated Tailwind v4 class names
