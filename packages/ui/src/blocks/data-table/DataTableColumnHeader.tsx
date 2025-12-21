"use client";

import type { Column } from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  Calendar,
  CheckSquare,
  EyeOff,
  Filter,
  Hash,
  List,
  ListOrdered,
  type LucideIcon,
  Text,
} from "lucide-react";
import type * as React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { cn } from "../../utils";
import {
  DataTableColumnFilterContent,
  type FilterOption,
  type FilterType,
} from "./DataTableColumnFilter";

/** Column data types for default icon mapping */
export type ColumnType =
  | "text"
  | "number"
  | "date"
  | "boolean"
  | "enum"
  | "custom";

/** Default icons for each column type */
const defaultColumnIcons: Record<ColumnType, LucideIcon> = {
  text: Text,
  number: Hash,
  date: Calendar,
  boolean: CheckSquare,
  enum: List,
  custom: Text,
};

/**
 * Column metadata interface for custom display names, icons, and filtering.
 * Use this in columnDef.meta to customize column appearance and behavior.
 *
 * @example
 * ```tsx
 * const columns = [
 *   {
 *     id: "status",
 *     header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
 *     meta: {
 *       displayName: "Status",
 *       columnType: "enum",
 *       filterable: true,
 *       filterType: "select",
 *       filterOptions: [
 *         { label: "Active", value: "active" },
 *         { label: "Pending", value: "pending" },
 *       ],
 *     } satisfies DataTableColumnMeta,
 *   },
 * ];
 * ```
 */
export interface DataTableColumnMeta {
  /** User-friendly display name for View Options and other UI */
  displayName: string;
  /** Column data type for default icon selection */
  columnType?: ColumnType;
  /** Custom icon override (Lucide icon component) */
  icon?: LucideIcon;
  /** Whether this column should show filter option */
  filterable?: boolean;
  /** Type of filter UI to show (text, select, boolean, number) */
  filterType?: FilterType;
  /** Options for select/enum filters */
  filterOptions?: FilterOption[];
  /** Placeholder text for filter input */
  filterPlaceholder?: string;
}

export interface DataTableColumnHeaderProps<TData, TValue>
  extends React.ComponentProps<"div"> {
  /** TanStack Table column instance */
  column: Column<TData, TValue>;
  /** Header title to display */
  title: string;
  /** Column data type for default icon (optional, can also use column.meta.columnType) */
  columnType?: ColumnType;
  /** Custom icon override (optional, can also use column.meta.icon) */
  icon?: LucideIcon;
  /** Whether to show filter option (defaults to meta.filterable) */
  filterable?: boolean;
  /** Type of filter UI (defaults to meta.filterType or 'text') */
  filterType?: FilterType;
  /** Options for select filters (defaults to meta.filterOptions) */
  filterOptions?: FilterOption[];
  /** Callback when filter value changes */
  onFilterChange?: (columnId: string, value: unknown) => void;
}

/**
 * Get the icon for a column based on props and meta.
 */
function getColumnIcon<TData, TValue>(
  column: Column<TData, TValue>,
  propIcon?: LucideIcon,
  propColumnType?: ColumnType,
): LucideIcon | undefined {
  // Priority: prop icon > meta icon > default icon based on type
  const meta = column.columnDef.meta as DataTableColumnMeta | undefined;

  if (propIcon) return propIcon;
  if (meta?.icon) return meta.icon;

  const columnType = propColumnType ?? meta?.columnType;
  if (columnType) return defaultColumnIcons[columnType];

  return undefined;
}

/**
 * Notion-style column header with dropdown menu.
 *
 * Features:
 * - Clean header without sort arrows when unsorted
 * - Optional column type icon in header
 * - Entire header is clickable to open menu
 * - Menu options: Filter (with intelligent UI), Sort (nested Asc/Desc), Hide
 * - Sort indicator only shows when column is actively sorted
 * - Filter shows popover with appropriate UI based on filterType
 */
export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
  columnType,
  icon,
  filterable,
  filterType,
  filterOptions,
  onFilterChange,
}: DataTableColumnHeaderProps<TData, TValue>) {
  const meta = column.columnDef.meta as DataTableColumnMeta | undefined;

  const canSort = column.getCanSort();
  const canHide = column.getCanHide();
  const isSorted = column.getIsSorted();
  const isFiltered = column.getIsFiltered();

  const Icon = getColumnIcon(column, icon, columnType);

  // Resolve filter settings from props or meta
  const showFilter = filterable ?? meta?.filterable ?? false;
  const resolvedFilterType = filterType ?? meta?.filterType ?? "text";
  const resolvedFilterOptions = filterOptions ?? meta?.filterOptions;
  const filterPlaceholder = meta?.filterPlaceholder;

  // If no actions available, just render the title
  if (!canSort && !canHide && !showFilter) {
    return (
      <div className={cn("flex items-center gap-1.5", className)}>
        {Icon && <Icon className="size-4 text-muted-foreground" />}
        <span>{title}</span>
      </div>
    );
  }

  return (
    <div className={cn("flex h-full", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex items-center gap-1.5 w-full h-full px-2 text-left cursor-pointer",
              "hover:bg-accent/50 data-[state=open]:bg-accent transition-colors",
              "focus:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            )}
          >
            {Icon && (
              <Icon className="size-3.5 text-muted-foreground shrink-0" />
            )}
            <span className="text-xs font-medium">{title}</span>
            {/* Show filter indicator when column is filtered */}
            {isFiltered && <Filter className="size-3 text-primary shrink-0" />}
            {/* Only show sort indicator when actively sorted */}
            {isSorted === "desc" && (
              <ArrowDown className="size-3.5 text-muted-foreground shrink-0" />
            )}
            {isSorted === "asc" && (
              <ArrowUp className="size-3.5 text-muted-foreground shrink-0" />
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-36">
          {/* Filter option as submenu (side-opening) */}
          {showFilter && (
            <>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="text-xs">
                  <Filter className="mr-2 size-3.5 text-muted-foreground" />
                  Filter
                  {isFiltered && (
                    <span className="ml-auto text-[10px] text-muted-foreground">
                      Active
                    </span>
                  )}
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent alignOffset={-5} sideOffset={5}>
                  <DataTableColumnFilterContent
                    title={title}
                    value={column.getFilterValue() as string | undefined}
                    onChange={(v: string | undefined) => {
                      column.setFilterValue(v);
                      onFilterChange?.(column.id, v);
                    }}
                    onClear={() => column.setFilterValue(undefined)}
                    filterType={resolvedFilterType}
                    filterOptions={resolvedFilterOptions}
                    placeholder={filterPlaceholder}
                    showDeleteMenu={false}
                  />
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              {isFiltered && (
                <DropdownMenuItem
                  onClick={() => column.setFilterValue(undefined)}
                  className="text-xs"
                >
                  Clear filter
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
            </>
          )}

          {/* Sort submenu */}
          {canSort && (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="text-xs">
                <ListOrdered className="mr-2 size-3.5 text-muted-foreground" />
                Sort
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent alignOffset={-5} sideOffset={5}>
                <DropdownMenuItem
                  onClick={() => column.toggleSorting(false)}
                  className={cn("text-xs", isSorted === "asc" && "bg-accent")}
                >
                  <ArrowUp className="mr-2 size-3.5 text-muted-foreground" />
                  Ascending
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => column.toggleSorting(true)}
                  className={cn("text-xs", isSorted === "desc" && "bg-accent")}
                >
                  <ArrowDown className="mr-2 size-3.5 text-muted-foreground" />
                  Descending
                </DropdownMenuItem>
                {isSorted && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => column.clearSorting()}
                      className="text-xs"
                    >
                      Clear sort
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          )}

          {/* Hide option */}
          {canHide && (
            <>
              {canSort && <DropdownMenuSeparator />}
              <DropdownMenuItem
                onClick={() => column.toggleVisibility(false)}
                className="text-xs"
              >
                <EyeOff className="mr-2 size-3.5 text-muted-foreground" />
                Hide
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
