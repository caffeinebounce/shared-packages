---
"@caffeinebounce/ui": minor
---

Enhanced useWizardForm hook with data restoration and error extraction helpers

New utilities for multi-step wizard forms:

- **createDataRestorationHandler()**: Handles TanStack Form data restoration with proper timing for unmounted fields
- **extractZodErrors()**: Extracts human-readable error messages from Zod validation results with optional field filtering
- **getStepErrors option**: Pass actual validation error messages instead of just missing field names

Bug fixes:
- Fixed `handleBack` to preserve `highestStepReached` (no longer resets progress when navigating backward)
- Fixed `handleStepClick` to only update `highestStepReached` when navigating forward
- Updated `getStepTooltip` to prefer `getStepErrors` for better error messages
