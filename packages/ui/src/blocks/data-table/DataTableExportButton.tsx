"use client";

import type { Table } from "@tanstack/react-table";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import * as React from "react";

import { Button } from "../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Spinner } from "../../components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../components/ui/tooltip";
import { cn } from "../../utils";
import { useDataTableContext } from "./DataTable";
import {
  dataTableTopperButtonProps,
  dataTableTopperIconClasses,
  dataTableTopperOpenStateClasses,
} from "./data-table-styles";

/**
 * Options for CSV export
 */
export interface ExportToCsvOptions<TData> {
  /** TanStack Table instance */
  table: Table<TData>;
  /** Custom filename (without extension) */
  filename?: string;
  /** Whether to include only visible columns (default: true) */
  visibleColumnsOnly?: boolean;
  /** Whether to include only selected rows (default: false, exports all rows) */
  selectedRowsOnly?: boolean;
  /** Custom column headers mapping (columnId -> headerText) */
  customHeaders?: Record<string, string>;
  /** Column IDs to exclude from export */
  excludeColumns?: string[];
  /** Custom value formatter for specific columns */
  formatters?: Record<string, (value: unknown) => string>;
}

/**
 * Escapes a field for CSV format
 * - Wraps in quotes if contains comma, quote, or newline
 * - Doubles internal quotes
 */
function escapeCsvField(value: string): string {
  if (
    value.includes(",") ||
    value.includes('"') ||
    value.includes("\n") ||
    value.includes("\r")
  ) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Formats a cell value for CSV export
 */
function formatCsvValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

/**
 * Exports table data to CSV and triggers download
 */
export function exportToCsv<TData>({
  table,
  filename = "export",
  visibleColumnsOnly = true,
  selectedRowsOnly = false,
  customHeaders = {},
  excludeColumns = [],
  formatters = {},
}: ExportToCsvOptions<TData>): void {
  // Get columns to export
  const allColumns = visibleColumnsOnly
    ? table.getVisibleLeafColumns()
    : table.getAllLeafColumns();

  // Filter out excluded columns and non-data columns (like selection, actions)
  const columns = allColumns.filter((col) => {
    const colId = col.id;
    // Skip common non-data columns
    if (["select", "selection", "actions", "_actions"].includes(colId)) {
      return false;
    }
    // Skip explicitly excluded columns
    if (excludeColumns.includes(colId)) {
      return false;
    }
    return true;
  });

  // Get rows to export
  const rows = selectedRowsOnly
    ? table.getFilteredSelectedRowModel().rows
    : table.getFilteredRowModel().rows;

  // Build header row
  const headers = columns.map((col) => {
    const header = customHeaders[col.id] ?? col.id;
    return escapeCsvField(header);
  });

  // Build data rows
  const dataRows = rows.map((row) => {
    return columns.map((col) => {
      const cellValue = row.getValue(col.id);
      const formatter = formatters[col.id];
      const formattedValue = formatter
        ? formatter(cellValue)
        : formatCsvValue(cellValue);
      return escapeCsvField(formattedValue);
    });
  });

  // Combine headers and data
  const csvContent = [
    headers.join(","),
    ...dataRows.map((row) => row.join(",")),
  ].join("\n");

  // Create and trigger download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Options for Excel export
 */
export interface ExportToExcelOptions<TData> {
  /** TanStack Table instance */
  table: Table<TData>;
  /** Custom filename (without extension) */
  filename?: string;
  /** Whether to include only visible columns (default: true) */
  visibleColumnsOnly?: boolean;
  /** Whether to include only selected rows (default: false, exports all rows) */
  selectedRowsOnly?: boolean;
  /** Custom column headers mapping (columnId -> headerText) */
  customHeaders?: Record<string, string>;
  /** Column IDs to exclude from export */
  excludeColumns?: string[];
  /** Custom value formatter for specific columns */
  formatters?: Record<string, (value: unknown) => string>;
}

/**
 * Escapes XML special characters for Excel XML format
 */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Exports table data to Excel (XML Spreadsheet format) and triggers download
 */
export function exportToExcel<TData>({
  table,
  filename = "export",
  visibleColumnsOnly = true,
  selectedRowsOnly = false,
  customHeaders = {},
  excludeColumns = [],
  formatters = {},
}: ExportToExcelOptions<TData>): void {
  // Get columns to export
  const allColumns = visibleColumnsOnly
    ? table.getVisibleLeafColumns()
    : table.getAllLeafColumns();

  // Filter out excluded columns and non-data columns (like selection, actions)
  const columns = allColumns.filter((col) => {
    const colId = col.id;
    // Skip common non-data columns
    if (["select", "selection", "actions", "_actions"].includes(colId)) {
      return false;
    }
    // Skip explicitly excluded columns
    if (excludeColumns.includes(colId)) {
      return false;
    }
    return true;
  });

  // Get rows to export
  const rows = selectedRowsOnly
    ? table.getFilteredSelectedRowModel().rows
    : table.getFilteredRowModel().rows;

  // Build header row
  const headers = columns.map((col) => customHeaders[col.id] ?? col.id);

  // Build data rows
  const dataRows = rows.map((row) => {
    return columns.map((col) => {
      const cellValue = row.getValue(col.id);
      const formatter = formatters[col.id];
      return formatter ? formatter(cellValue) : formatCsvValue(cellValue);
    });
  });

  // Build Excel XML content
  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Styles>
    <Style ss:ID="Header">
      <Font ss:Bold="1"/>
      <Interior ss:Color="#E0E0E0" ss:Pattern="Solid"/>
    </Style>
  </Styles>
  <Worksheet ss:Name="Data">
    <Table>
      <Row>
        ${headers.map((h) => `<Cell ss:StyleID="Header"><Data ss:Type="String">${escapeXml(h)}</Data></Cell>`).join("\n        ")}
      </Row>
      ${dataRows
        .map(
          (row) => `<Row>
        ${row
          .map((cell) => {
            // Detect if value should be treated as a number in Excel
            // Preserve leading zeros (e.g., "0001234" stays as string)
            const trimmed = cell.trim();
            const isNumericPattern =
              trimmed !== "" && /^-?\d+(\.\d+)?$/.test(trimmed);
            const hasLeadingZero =
              /^0\d+$/.test(trimmed) || /^-0\d+$/.test(trimmed);
            const numValue = Number(trimmed);
            const isNumber =
              isNumericPattern && !hasLeadingZero && !Number.isNaN(numValue);
            const type = isNumber ? "Number" : "String";
            const value = isNumber ? numValue : escapeXml(cell);
            return `<Cell><Data ss:Type="${type}">${value}</Data></Cell>`;
          })
          .join("\n        ")}
      </Row>`,
        )
        .join("\n      ")}
    </Table>
  </Worksheet>
</Workbook>`;

  // Create and trigger download
  const blob = new Blob([xmlContent], {
    type: "application/vnd.ms-excel;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.xls`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export type ExportFormat = "csv" | "excel";

export interface DataTableExportButtonProps<TData = unknown> {
  /**
   * TanStack Table instance for built-in export.
   * If provided, the component will handle CSV/Excel export automatically.
   */
  table?: Table<TData>;
  /**
   * Custom export callback for CSV. If provided (and table is not), this will be called instead.
   * Should return a Promise that resolves when export is complete.
   */
  onExportCsv?: () => Promise<void>;
  /**
   * Custom export callback for Excel. If provided (and table is not), this will be called instead.
   * Should return a Promise that resolves when export is complete.
   */
  onExportExcel?: () => Promise<void>;
  /**
   * @deprecated Use onExportCsv instead. Kept for backwards compatibility.
   */
  onExport?: () => Promise<void>;
  /** Custom filename for export (without extension) */
  filename?: string;
  /** Label for the tooltip */
  label?: string;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Whether to export only selected rows (default: false) */
  selectedRowsOnly?: boolean;
  /** Column IDs to exclude from export */
  excludeColumns?: string[];
  /** Custom column headers mapping (columnId -> headerText) */
  customHeaders?: Record<string, string>;
  /** Custom value formatters for specific columns */
  formatters?: Record<string, (value: unknown) => string>;
}

/**
 * Export dropdown button for DataTable with CSV and Excel options.
 * Styled consistently with other DataTable topper buttons.
 *
 * @example Built-in export (CSV and Excel)
 * ```tsx
 * <DataTableExportButton
 *   table={table}
 *   filename="my-data"
 *   excludeColumns={["actions"]}
 * />
 * ```
 *
 * @example Custom export handlers
 * ```tsx
 * <DataTableExportButton
 *   onExportCsv={async () => { ... }}
 *   onExportExcel={async () => { ... }}
 * />
 * ```
 */
export function DataTableExportButton<TData = unknown>({
  table,
  onExportCsv,
  onExportExcel,
  onExport, // deprecated, maps to CSV
  filename = "export",
  label = "Export",
  disabled = false,
  selectedRowsOnly = false,
  excludeColumns = [],
  customHeaders = {},
  formatters = {},
}: DataTableExportButtonProps<TData>) {
  const context = useDataTableContext();
  const fontSizeClass = context?.fontSizeClass ?? "text-xs";
  const [isExporting, setIsExporting] = React.useState(false);
  const [exportingFormat, setExportingFormat] =
    React.useState<ExportFormat | null>(null);

  const handleExport = React.useCallback(
    async (format: ExportFormat) => {
      if (disabled) return;
      setIsExporting(true);
      setExportingFormat(format);
      try {
        if (table) {
          // Use built-in export
          if (format === "csv") {
            exportToCsv({
              table,
              filename,
              selectedRowsOnly,
              excludeColumns,
              customHeaders,
              formatters,
            });
          } else {
            exportToExcel({
              table,
              filename,
              selectedRowsOnly,
              excludeColumns,
              customHeaders,
              formatters,
            });
          }
        } else {
          // Use custom export handlers
          if (format === "csv") {
            await (onExportCsv ?? onExport)?.();
          } else {
            await onExportExcel?.();
          }
        }
      } finally {
        setIsExporting(false);
        setExportingFormat(null);
      }
    },
    [
      table,
      onExportCsv,
      onExportExcel,
      onExport,
      filename,
      selectedRowsOnly,
      excludeColumns,
      customHeaders,
      formatters,
      disabled,
    ],
  );

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              {...dataTableTopperButtonProps}
              disabled={isExporting || disabled}
              aria-label={label}
              className={dataTableTopperOpenStateClasses}
            >
              {isExporting ? (
                <Spinner className="size-4" />
              ) : (
                <Download className="size-4" />
              )}
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent className={fontSizeClass}>{label}</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel
          className={cn("font-normal text-muted-foreground", fontSizeClass)}
        >
          Export Data
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => handleExport("csv")}
          disabled={isExporting}
          className={cn("gap-2", fontSizeClass)}
        >
          <FileText className={dataTableTopperIconClasses} />
          <span>CSV</span>
          {exportingFormat === "csv" && <Spinner className="size-3 ml-auto" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport("excel")}
          disabled={isExporting}
          className={cn("gap-2", fontSizeClass)}
        >
          <FileSpreadsheet className={dataTableTopperIconClasses} />
          <span>Excel</span>
          {exportingFormat === "excel" && (
            <Spinner className="size-3 ml-auto" />
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
