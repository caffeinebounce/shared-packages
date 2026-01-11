---
"@caffeinebounce/ui": patch
---

Replace console.error with useErrorLogger for structured logging

Migrates 7 instances of console.error to use the structured logging hook from @caffeinebounce/logger:

- **FeedbackDialog**: Log feedback submission errors with component context
- **EditableCell**: Log cell update errors with column and row metadata
- **CompanyNameEditableCell**: Log company name update errors
- **UserNameEditableCell**: Log user name update errors
- **FormWizard**: Log localStorage save/clear errors on unmount and reset

This change improves error visibility in Better Stack dashboards while maintaining identical user-facing behavior (toast notifications). Development-only warnings (GoogleAnalytics invalid ID, EditableCell select option mismatch) are intentionally preserved as console.warn for developer debugging.
