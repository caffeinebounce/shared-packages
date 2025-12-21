"use client";

import type { Column, Table } from "@tanstack/react-table";
import { ChevronDown } from "lucide-react";
import * as React from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { TableCell, TableRow } from "../../components/ui/table";
import { cn } from "../../utils";

/** Summary calculation type */
export type SummaryType =
  | "none"
  | "count"
  | "count_unique"
  | "sum"
  | "average"
  | "median"
  | "min"
  | "max"
  | "range"
  | "percent_empty"
  | "percent_filled";

/** Column type for determining available summaries */
export type ColumnDataType = "text" | "number" | "boolean" | "date";

/** Summary configuration for a column */
export interface ColumnSummaryConfig {
  /** Column ID */
  columnId: string;
  /** Active summary type */
  type: SummaryType;
}

export interface DataTableSummaryProps<TData> {
  /** TanStack Table instance */
  table: Table<TData>;
  /** All data (not just current page) for accurate calculations */
  allData: TData[];
  /** Summary configuration per column */
  summaryConfig: Record<string, SummaryType>;
  /** Callback when summary type changes */
  onSummaryChange: (columnId: string, type: SummaryType) => void;
  /** Get the data type of a column (for showing appropriate options) */
  getColumnDataType?: (columnId: string) => ColumnDataType;
  /** Width of gutter column (for alignment with DataTable gutter) */
  gutterWidth?: number;
  /** Optional class name */
  className?: string;
}

/** Available summaries for each data type */
const summaryOptions: Record<
  ColumnDataType,
  { value: SummaryType; label: string }[]
> = {
  text: [
    { value: "none", label: "None" },
    { value: "count", label: "Count" },
    { value: "count_unique", label: "Count unique" },
    { value: "percent_empty", label: "% Empty" },
    { value: "percent_filled", label: "% Filled" },
  ],
  number: [
    { value: "none", label: "None" },
    { value: "count", label: "Count" },
    { value: "sum", label: "Sum" },
    { value: "average", label: "Average" },
    { value: "median", label: "Median" },
    { value: "min", label: "Min" },
    { value: "max", label: "Max" },
    { value: "range", label: "Range" },
    { value: "percent_empty", label: "% Empty" },
    { value: "percent_filled", label: "% Filled" },
  ],
  boolean: [
    { value: "none", label: "None" },
    { value: "count", label: "Count" },
    { value: "percent_empty", label: "% Empty" },
    { value: "percent_filled", label: "% Filled" },
  ],
  date: [
    { value: "none", label: "None" },
    { value: "count", label: "Count" },
    { value: "min", label: "Earliest" },
    { value: "max", label: "Latest" },
    { value: "range", label: "Date range" },
    { value: "percent_empty", label: "% Empty" },
    { value: "percent_filled", label: "% Filled" },
  ],
};

/** Calculate summary value for a column */
function calculateSummary<TData>(
  column: Column<TData, unknown>,
  allData: TData[],
  type: SummaryType,
  dataType: ColumnDataType,
): string {
  if (type === "none") return "";

  // Get all values for this column, filtering out null/undefined
  const accessor = column.accessorFn;
  if (!accessor) return "";

  const allValues = allData
    .map((row) => accessor(row, 0))
    .filter((v) => v !== null && v !== undefined && v !== "");

  const totalCount = allData.length;
  const filledCount = allValues.length;
  const emptyCount = totalCount - filledCount;

  switch (type) {
    case "count":
      return `Count: ${filledCount.toLocaleString()}`;

    case "count_unique": {
      const uniqueValues = new Set(allValues.map((v) => String(v)));
      return `Unique: ${uniqueValues.size.toLocaleString()}`;
    }

    case "percent_empty":
      return totalCount > 0
        ? `Empty: ${((emptyCount / totalCount) * 100).toFixed(1)}%`
        : "Empty: 0%";

    case "percent_filled":
      return totalCount > 0
        ? `Filled: ${((filledCount / totalCount) * 100).toFixed(1)}%`
        : "Filled: 0%";

    case "sum":
    case "average":
    case "median":
    case "min":
    case "max":
    case "range": {
      // For numeric operations
      if (dataType === "number") {
        const numericValues = allValues
          .map((v) => Number(v))
          .filter((n) => !Number.isNaN(n));

        if (numericValues.length === 0) return "—";

        switch (type) {
          case "sum": {
            const sum = numericValues.reduce((a, b) => a + b, 0);
            return `Sum: ${formatNumber(sum)}`;
          }
          case "average": {
            const avg =
              numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
            return `Avg: ${formatNumber(avg)}`;
          }
          case "median": {
            const sorted = [...numericValues].sort((a, b) => a - b);
            const mid = Math.floor(sorted.length / 2);
            const median =
              sorted.length % 2 !== 0
                ? sorted[mid]
                : (sorted[mid - 1]! + sorted[mid]!) / 2;
            return `Median: ${formatNumber(median)}`;
          }
          case "min":
            return `Min: ${formatNumber(Math.min(...numericValues))}`;
          case "max":
            return `Max: ${formatNumber(Math.max(...numericValues))}`;
          case "range": {
            const min = Math.min(...numericValues);
            const max = Math.max(...numericValues);
            return `${formatNumber(min)} – ${formatNumber(max)}`;
          }
        }
      }

      // For date operations
      if (dataType === "date") {
        const dateValues = allValues
          .map((v) => {
            const d = v instanceof Date ? v : new Date(String(v));
            return d.getTime();
          })
          .filter((t) => !Number.isNaN(t));

        if (dateValues.length === 0) return "—";

        switch (type) {
          case "min":
            return formatDate(new Date(Math.min(...dateValues)));
          case "max":
            return formatDate(new Date(Math.max(...dateValues)));
          case "range": {
            const min = new Date(Math.min(...dateValues));
            const max = new Date(Math.max(...dateValues));
            return `${formatDate(min)} – ${formatDate(max)}`;
          }
          default:
            return "—";
        }
      }

      return "—";
    }

    default:
      return "";
  }
}

/** Format a number for display */
function formatNumber(n: number): string {
  if (Number.isInteger(n)) {
    return n.toLocaleString();
  }
  // Show 2 decimal places for non-integers
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Format a date for display */
function formatDate(d: Date): string {
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * DataTable Summary row component.
 * Displays calculated statistics for each column below the table.
 *
 * Features:
 * - Count (with null/undefined excluded)
 * - Sum, Average, Median, Min, Max for numeric columns
 * - Unique count for text columns
 * - Percent empty/filled
 * - Click to change summary type
 */
export function DataTableSummary<TData>({
  table,
  allData,
  summaryConfig,
  onSummaryChange,
  getColumnDataType,
  gutterWidth = 0,
  className,
}: DataTableSummaryProps<TData>) {
  // Filter out the select column since it's handled by gutter
  const visibleColumns = table
    .getVisibleLeafColumns()
    .filter((col) => col.id !== "select");
  const [hoveredColumnId, setHoveredColumnId] = React.useState<string | null>(
    null,
  );

  // Default data type detection
  const detectDataType = React.useCallback(
    (columnId: string): ColumnDataType => {
      if (getColumnDataType) return getColumnDataType(columnId);

      // Try to detect from meta or first value
      const column = table.getColumn(columnId);
      if (!column) return "text";

      const meta = column.columnDef.meta as { filterType?: string } | undefined;
      if (meta?.filterType === "number") return "number";
      if (meta?.filterType === "boolean") return "boolean";

      // Check first non-null value
      const accessor = column.accessorFn;
      if (!accessor) return "text";

      for (const row of allData) {
        const value = accessor(row, 0);
        if (value === null || value === undefined) continue;
        if (typeof value === "number") return "number";
        if (typeof value === "boolean") return "boolean";
        if (value instanceof Date) return "date";
        // Check if string looks like a date
        if (typeof value === "string" && !Number.isNaN(Date.parse(value))) {
          const parsed = new Date(value);
          if (parsed.getFullYear() > 1900 && parsed.getFullYear() < 2100) {
            return "date";
          }
        }
        break;
      }

      return "text";
    },
    [getColumnDataType, table, allData],
  );

  return (
    <TableRow className={cn("hover:bg-transparent border-t", className)}>
      {/* Gutter spacer to align with DataTable gutter */}
      {gutterWidth > 0 && (
        <TableCell className="p-0 border-r-0" style={{ width: gutterWidth }} />
      )}

      {visibleColumns.map((column) => {
        const columnId = column.id;
        const dataType = detectDataType(columnId);
        const currentType = summaryConfig[columnId] ?? "none";
        const options = summaryOptions[dataType] ?? summaryOptions.text;
        const summaryValue = calculateSummary(
          column,
          allData,
          currentType,
          dataType,
        );
        // const currentOption = options.find((o) => o.value === currentType);
        const isHovered = hoveredColumnId === columnId;

        return (
          <TableCell
            key={columnId}
            className="p-0 border-r border-border/30"
            style={{ width: column.getSize(), minWidth: column.getSize() }}
          >
            <SummaryCell
              columnId={columnId}
              column={column}
              currentType={currentType}
              summaryValue={summaryValue}
              options={options}
              isHovered={isHovered}
              onSummaryChange={onSummaryChange}
              onMouseEnter={() => setHoveredColumnId(columnId)}
              onMouseLeave={() => setHoveredColumnId(null)}
            />
          </TableCell>
        );
      })}
    </TableRow>
  );
}

/** Individual summary cell component to track dropdown open state */
function SummaryCell<TData>({
  columnId,
  column,
  currentType,
  summaryValue,
  options,
  isHovered,
  onSummaryChange,
  onMouseEnter,
  onMouseLeave,
}: {
  columnId: string;
  column: Column<TData, unknown>;
  currentType: SummaryType;
  summaryValue: string;
  options: { value: SummaryType; label: string }[];
  isHovered: boolean;
  onSummaryChange: (columnId: string, type: SummaryType) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  const [isOpen, setIsOpen] = React.useState(false);

  // Show "Calculate" when cell is hovered OR dropdown is open
  const showCalculate = currentType === "none" && (isHovered || isOpen);

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: Hover state for visual feedback only
    <div
      className="flex items-center px-3 py-1.5 min-w-0"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      role="presentation"
    >
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex items-center gap-1 text-xs transition-colors rounded px-1 py-0.5 -mx-1",
              currentType === "none"
                ? "text-muted-foreground/50 hover:text-muted-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {currentType === "none" ? (
              <span
                className={cn(
                  "italic transition-opacity",
                  showCalculate ? "opacity-100" : "opacity-0",
                )}
              >
                Calculate
              </span>
            ) : (
              <span className="truncate">{summaryValue}</span>
            )}
            {currentType !== "none" && (
              <ChevronDown className="size-3 shrink-0 opacity-50" />
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-40">
          {options.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => onSummaryChange(columnId, option.value)}
              className={cn(
                "text-xs",
                currentType === option.value && "bg-accent",
              )}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
