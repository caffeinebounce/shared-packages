"use client";

import type { LucideIcon } from "lucide-react";
import { Plus, X } from "lucide-react";
import * as React from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { cn } from "../../utils";
import {
  DataTableColumnFilterContent,
  type FilterOption,
} from "./DataTableColumnFilter";

/** Individual filter definition */
export interface DataTableFilter {
  /** Unique identifier for the filter */
  id: string;
  /** Column or field name */
  label: string;
  /** Display value of the filter */
  value: string;
  /** Raw/underlying value for the filter */
  rawValue?: string;
  /** Optional icon to show (can be a React element or a Lucide icon component) */
  icon?: React.ReactNode | LucideIcon;
  /** Underlying column id (optional) */
  columnId?: string;
  /** Filter UI type */
  filterType?: "text" | "select" | "boolean" | "number";
  /** Options (for select) */
  filterOptions?: FilterOption[];
  /** Placeholder for input */
  filterPlaceholder?: string;
}

export interface DataTableFilterBadgesProps
  extends React.ComponentProps<"div"> {
  /** Array of active filters */
  filters: DataTableFilter[];
  /** Callback when a filter is removed */
  onRemoveFilter: (filterId: string) => void;
  /** Callback to change filter value (id, newValue) */
  onChangeFilter?: (filterId: string, value?: string) => void;
  /** Callback to clear all filters */
  onClearAll?: () => void;
  /** Callback to add a new filter */
  onAddFilter?: () => void;
}

/**
 * Notion-style filter badges displayed above the table.
 *
 * Shows active filters as removable badges with an optional "Clear all" button.
 */
export function DataTableFilterBadges({
  filters,
  onRemoveFilter,
  onChangeFilter,
  onClearAll,
  onAddFilter,
  className,
  ...props
}: DataTableFilterBadgesProps) {
  if (filters.length === 0 && !onAddFilter) {
    return null;
  }

  return (
    <div
      className={cn("flex flex-wrap items-center gap-1.5", className)}
      {...props}
    >
      {filters.map((filter) => (
        <DropdownMenu key={filter.id}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                "inline-flex items-center gap-1 rounded border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/30 px-1.5 py-0.5",
                "text-xs hover:bg-sky-100 dark:hover:bg-sky-900/40 transition-colors cursor-pointer",
              )}
            >
              {filter.icon && (
                <span className="text-muted-foreground shrink-0 [&>svg]:size-3">
                  {React.isValidElement(filter.icon) 
                    ? filter.icon
                    : (() => { const Icon = filter.icon as LucideIcon; return <Icon className="size-3" />; })()}
                </span>
              )}
              <span className="text-muted-foreground">{filter.label}</span>
              <span className="text-muted-foreground/50">·</span>
              <span className="font-medium truncate max-w-28">
                {filter.value}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveFilter(filter.id);
                }}
                className="ml-0.5 rounded-sm p-0.5 hover:bg-sky-200/50 dark:hover:bg-sky-800/50 -mr-0.5"
                aria-label={`Remove ${filter.label} filter`}
              >
                <X className="size-3 text-muted-foreground" />
              </button>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent sideOffset={4} align="start" className="p-0">
            <DataTableColumnFilterContent
              title={filter.label}
              value={filter.rawValue ?? filter.value}
              onChange={(v: string | undefined) =>
                onChangeFilter?.(filter.id, v)
              }
              onClear={() => onRemoveFilter(filter.id)}
              onDelete={() => onRemoveFilter(filter.id)}
              filterType={filter.filterType}
              filterOptions={filter.filterOptions}
              placeholder={filter.filterPlaceholder}
              showDeleteMenu={true}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      ))}

      {/* Add Filter button */}
      {onAddFilter && (
        <button
          type="button"
          onClick={onAddFilter}
          className={cn(
            "inline-flex items-center gap-1 rounded px-1.5 py-0.5",
            "text-xs text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors",
          )}
        >
          <Plus className="size-3" />
          <span>Filter</span>
        </button>
      )}

      {/* Clear all link */}
      {onClearAll && filters.length > 1 && (
        <button
          type="button"
          onClick={onClearAll}
          className="text-xs text-muted-foreground hover:text-foreground ml-0.5"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
