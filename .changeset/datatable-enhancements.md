---
"@caffeinebounce/ui": minor
"@caffeinebounce/logger": patch
---

Enhance DataTable with column/row drag-drop, export button, and styling improvements

**DataTable Enhancements:**
- Add DataTableContext for shared state (density, font size, column wrapping)
- Add column drag/drop reordering via ViewOptions panel
- Add row drag/drop reordering with visual drag handles
- Add DataTableAddButton component for standardized add actions
- Add DataTableExportButton with loading state and tooltip
- Add WrapText toggle to column header menu
- Update comfy density padding for better visual balance
- Add data-table-styles.ts for consistent topper button styling

**UI Component Updates:**
- Add 'success' variant to IconButton for green hover effect
- Add 'icon-xs' size to Button component
- Fix min-width overflow in AdminPageLayout and AppLayout

**Logger Fix:**
- Fix api-wrapper.ts Next.js cross-version type compatibility
