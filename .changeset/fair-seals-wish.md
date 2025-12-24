---
"@caffeinebounce/ui": patch
---

Fix DashboardGrid spacing and DataTableViews layout bugs:
- Remove horizontal padding from DashboardGrid (use gap-6 for consistent spacing)
- Fix DataTableViews where 'onUpdateView &&' text was rendered outside JSX
- Move "Save changes" button inside the dropdown menu for consistency
