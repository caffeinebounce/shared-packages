"use client";

import { Search, X } from "lucide-react";
import type * as React from "react";

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { cn } from "../../utils";

export interface DataTableToolbarProps extends React.ComponentProps<"div"> {
  /** Search value */
  searchValue?: string;
  /** Search placeholder */
  searchPlaceholder?: string;
  /** Callback when search value changes */
  onSearchChange?: (value: string) => void;
  /** Whether filters are currently applied */
  isFiltered?: boolean;
  /** Callback to reset all filters */
  onResetFilters?: () => void;
}

/**
 * Toolbar container for the data table.
 * Provides search input and container for filter/view controls.
 */
export function DataTableToolbar({
  searchValue = "",
  searchPlaceholder = "Search...",
  onSearchChange,
  isFiltered = false,
  onResetFilters,
  className,
  children,
  ...props
}: DataTableToolbarProps) {
  return (
    <div
      role="toolbar"
      aria-orientation="horizontal"
      className={cn(
        "flex w-full items-start justify-between gap-2 p-1",
        className,
      )}
      {...props}
    >
      <div className="flex flex-1 flex-wrap items-center gap-2">
        {onSearchChange && (
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-9 w-[150px] pl-8 lg:w-[250px]"
            />
          </div>
        )}
        {children}
        {isFiltered && onResetFilters && (
          <Button
            aria-label="Reset filters"
            variant="ghost"
            onClick={onResetFilters}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X className="ml-2 size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
