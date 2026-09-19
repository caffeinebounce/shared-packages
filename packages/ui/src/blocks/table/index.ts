/**
 * Data table — tablecn (sadmann7/shadcn-table) components over TanStack Table,
 * vendored under `blocks/table`, plus local add-ons under `./addons`.
 *
 * The tablecn pieces are kept as close to upstream as possible so they can be
 * re-vendored; local changes are marked in-file. `useDataTable` keeps table
 * state in the URL via nuqs and needs a `NuqsAdapter` at the app root; the
 * components work with any TanStack table instance and need no adapter.
 */
import type { ColumnMeta } from "@tanstack/react-table";

// --- tablecn ---------------------------------------------------------------

// --- local add-ons -----------------------------------------------------------
/**
 * Column `meta` shape the toolbar and header read (`label`, `variant`,
 * `options`, `placeholder`, `icon`, …). Alias of the augmented TanStack
 * `ColumnMeta` so column files can write `satisfies DataTableColumnMeta`.
 */
export type DataTableColumnMeta<TData = unknown, TValue = unknown> = ColumnMeta<
  TData,
  TValue
>;
export {
  DataTableAddButton,
  type DataTableAddButtonProps,
} from "./addons/DataTableAddButton";
export {
  DataTableExportButton,
  type DataTableExportButtonProps,
  type ExportFormat,
  type ExportToCsvOptions,
  type ExportToExcelOptions,
  exportToCsv,
  exportToExcel,
} from "./addons/DataTableExportButton";
export {
  type DataTableRowAction,
  DataTableRowActions,
  type DataTableRowActionsProps,
} from "./addons/DataTableRowActions";
export { DataTableSearch } from "./addons/DataTableSearch";
export {
  type ColumnDataType,
  type ColumnSummaryConfig,
  DataTableSummary,
  type DataTableSummaryProps,
  type SummaryType,
} from "./addons/DataTableSummary";
export {
  type DataTableTab,
  DataTableTopper,
  type DataTableTopperProps,
} from "./addons/DataTableTopper";
export {
  type DataTableView,
  type DataTableViewState,
  DataTableViews,
  type DataTableViewsProps,
} from "./addons/DataTableViews";
export {
  dataTableTopperButtonProps,
  dataTableTopperIconClasses,
  dataTableTopperOpenStateClasses,
  dataTableTopperResponsiveClasses,
} from "./addons/data-table-styles";
export { type DataTableConfig, dataTableConfig } from "./config";
export { DataTable } from "./data-table";
export { DataTableColumnHeader } from "./data-table-column-header";
export { DataTableDateFilter } from "./data-table-date-filter";
export { DataTableFacetedFilter } from "./data-table-faceted-filter";
export { DataTablePagination } from "./data-table-pagination";
export { DataTableSkeleton } from "./data-table-skeleton";
export { DataTableSliderFilter } from "./data-table-slider-filter";
export { DataTableToolbar } from "./data-table-toolbar";
export { DataTableViewOptions } from "./data-table-view-options";
export {
  getColumnPinningStyle,
  getDefaultFilterOperator,
  getFilterOperators,
  getValidFilters,
} from "./lib/data-table";
export { getFiltersStateParser, getSortingStateParser } from "./lib/parsers";
export type {
  DataTableRowAction as DataTableRowActionRef,
  ExtendedColumnFilter,
  ExtendedColumnSort,
  FilterOperator,
  FilterVariant,
  JoinOperator,
  Option as DataTableFilterOption,
  QueryKeys as DataTableQueryKeys,
} from "./types";
export { useDataTable } from "./use-data-table";
