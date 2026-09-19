---
"@caffeinebounce/ui": minor
---

Replace the custom data-table engine with tablecn (shadcn) and split finance out.

- `@caffeinebounce/ui/data-table` now ships the tablecn components (`DataTable`,
  `DataTableColumnHeader`, `DataTablePagination`, `DataTableToolbar`,
  `DataTableViewOptions`, faceted/slider/date filters, `DataTableSkeleton`) and the
  `useDataTable` hook (URL state via nuqs — add a `NuqsAdapter` at the app root
  to use the hook; the components work with any TanStack table instance). Column
  pinning is TanStack-native (`getColumnPinningStyle`); the hand-rolled sticky,
  resizing, tree-view and HTML5 drag code is gone.
- Local add-ons stay and no longer depend on a table context: `DataTableTopper`,
  `DataTableViews`, `DataTableExportButton`, `DataTableSummary` (render it in the
  new `footer` slot), `DataTableRowActions`, `DataTableSearch`, `DataTableAddButton`.
- New entry `@caffeinebounce/ui/finance`: `FinancialStatementTable`,
  `FinancialSummaryChart`, period/comparison controls, currency cell, unified
  controls. These moved out of `data-table`; the root export keeps working.
- New entry `@caffeinebounce/ui/data-grid`: the tablecn editable grid
  (virtualized, keyboard, undo/redo), not in the root bundle.
- Removed: `DataTableColumnFilter`, `DataTableColumnMenuSub`, `DataTableFilterBadges`,
  `DataTableToolbar` (old), `useDataTableContext`, `DataTableDensity`,
  `DataTableFontSize`, `RowSelectionStyle`, `ColumnType`, `FilterType`,
  `FilterOption` (old). Column metadata now uses TanStack's `ColumnMeta`
  (`label`, `placeholder`, `variant`, `options`, `icon`); `DataTableColumnMeta`
  is kept as an alias of that augmented type so `satisfies` still works, and
  `DataTableFilterOption` is the option shape.
- Breaking for `DataTable` props: `density`, `fontSize`, `enableColumnResizing`,
  `rowSelectionStyle`, `enableRowDrag`, `enableColumnDrag`, `enableTreeView`,
  `stickyColumns`, `columnWrapping`, `filters`/`onRemoveFilter`/`onChangeFilter`
  are gone (the toolbar reads `meta.variant`); `DataTablePagination` renders
  inside `DataTable` and takes `{ table }`; `DataTableColumnHeader` takes
  `label` instead of `title`. Local extensions over tablecn: `footer`,
  `onRowClick(row)` and `getRowClassName(row)`.
