---
"@caffeinebounce/ui": patch
---

DataTable: Standardize cell and header padding for consistent styling

- Updated cell padding to use `px-2` horizontally to match header button padding
- Compact density now uses `py-1` for better visual balance
- Simple string headers are now wrapped with matching `px-2` padding and styled text
- DataTableColumnHeader fallback (no actions) now includes proper `px-2` padding
- This ensures DataTable is "droppable" with consistent formatting regardless of whether columns use DataTableColumnHeader or simple string headers
