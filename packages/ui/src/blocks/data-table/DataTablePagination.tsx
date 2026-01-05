"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import type * as React from "react";

import { Button } from "../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { cn } from "../../utils";

export interface DataTablePaginationProps extends React.ComponentProps<"div"> {
  /** Current page (1-indexed) */
  page: number;
  /** Number of items per page */
  pageSize: number;
  /** Total number of pages */
  pageCount: number;
  /** Total number of items */
  totalCount?: number;
  /** Number of selected rows */
  selectedCount?: number;
  /** Available page size options */
  pageSizeOptions?: number[];
  /** Callback when page changes */
  onPageChange: (page: number) => void;
  /** Callback when page size changes */
  onPageSizeChange: (pageSize: number) => void;
}

/**
 * Pagination controls for the data table.
 * Shows page navigation, page size selector, and row counts.
 */
export function DataTablePagination({
  page,
  pageSize,
  pageCount,
  totalCount,
  selectedCount = 0,
  pageSizeOptions = [10, 20, 30, 40, 50],
  onPageChange,
  onPageSizeChange,
  className,
  ...props
}: DataTablePaginationProps) {
  // Ensure pageCount is at least 1 for display (show "1 of 1" instead of "1 of 0")
  const displayPageCount = Math.max(1, pageCount);
  const canGoPrevious = page > 1;
  const canGoNext = page < displayPageCount;

  return (
    <div
      className={cn(
        "flex w-full flex-row items-center justify-between gap-3 overflow-auto p-1 sm:gap-8",
        className,
      )}
      {...props}
    >
      <div className="flex-1 whitespace-nowrap text-xs font-light text-muted-foreground">
        {selectedCount > 0 ? (
          <>
            {selectedCount} of {totalCount ?? pageCount * pageSize} row(s)
            selected.
          </>
        ) : null}
      </div>
      <div className="flex items-center justify-end gap-1 sm:gap-2 lg:gap-6">
        <div className="flex items-center space-x-2">
          <p className="whitespace-nowrap text-xs font-light text-muted-foreground">
            <span className="hidden lg:inline">Rows per page</span>
            <span className="lg:hidden">Rows</span>
          </p>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-1">
          <Button
            aria-label="Go to first page"
            variant="outline"
            className="hidden size-8 p-0 lg:flex"
            onClick={() => onPageChange(1)}
            disabled={!canGoPrevious}
          >
            <ChevronsLeft className="size-4" />
          </Button>
          <Button
            aria-label="Go to previous page"
            variant="outline"
            className="size-8 p-0"
            onClick={() => onPageChange(page - 1)}
            disabled={!canGoPrevious}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <div className="flex items-center justify-center text-xs font-light text-muted-foreground whitespace-nowrap px-1">
            <span className="hidden lg:inline">
              Page {page} of {displayPageCount}
            </span>
            <span className="lg:hidden">
              {page} / {displayPageCount}
            </span>
          </div>
          <Button
            aria-label="Go to next page"
            variant="outline"
            className="size-8 p-0"
            onClick={() => onPageChange(page + 1)}
            disabled={!canGoNext}
          >
            <ChevronRight className="size-4" />
          </Button>
          <Button
            aria-label="Go to last page"
            variant="outline"
            className="hidden size-8 p-0 lg:flex"
            onClick={() => onPageChange(displayPageCount)}
            disabled={!canGoNext}
          >
            <ChevronsRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
