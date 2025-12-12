"use client";

import type * as React from "react";

import { Skeleton } from "../../components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { cn } from "../../utils";

export interface DataTableSkeletonProps extends React.ComponentProps<"div"> {
  /** Number of columns to display */
  columnCount: number;
  /** Number of rows to display */
  rowCount?: number;
  /** Number of filter skeletons to show in toolbar */
  filterCount?: number;
  /** Custom cell widths */
  cellWidths?: string[];
  /** Whether to show view options button */
  withViewOptions?: boolean;
  /** Whether to show pagination */
  withPagination?: boolean;
  /** Whether to shrink columns to zero when width is auto */
  shrinkZero?: boolean;
}

/**
 * Loading skeleton for the data table.
 * Shows placeholder rows while data is being fetched.
 */
export function DataTableSkeleton({
  columnCount,
  rowCount = 10,
  filterCount = 0,
  cellWidths = ["auto"],
  withViewOptions = true,
  withPagination = true,
  shrinkZero = false,
  className,
  ...props
}: DataTableSkeletonProps) {
  // Create array of widths that cycles through cellWidths
  const widths = Array.from(
    { length: columnCount },
    (_, index) => cellWidths[index % cellWidths.length] ?? "auto",
  );

  return (
    <div
      className={cn("flex w-full flex-col gap-2.5 overflow-auto", className)}
      {...props}
    >
      {/* Toolbar skeleton */}
      <div className="flex w-full items-center justify-between gap-2 overflow-auto p-1">
        <div className="flex flex-1 items-center gap-2">
          {/* Search */}
          <Skeleton className="h-8 w-[150px] lg:w-[250px]" />
          {/* Filters */}
          {filterCount > 0 &&
            Array.from({ length: filterCount }).map((_, i) => (
              <Skeleton
                key={`filter-${i}`}
                className="h-8 w-20 border-dashed"
              />
            ))}
        </div>
        {/* View options */}
        {withViewOptions && <Skeleton className="hidden h-8 w-20 lg:block" />}
      </div>

      {/* Table skeleton */}
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {widths.map((width, index) => (
                <TableHead
                  key={`header-${index}`}
                  style={{
                    width: shrinkZero && width === "auto" ? 0 : width,
                    minWidth: shrinkZero ? 0 : undefined,
                  }}
                >
                  <Skeleton className="h-6 w-full" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rowCount }).map((_, rowIndex) => (
              <TableRow
                key={`row-${rowIndex}`}
                className="hover:bg-transparent"
              >
                {widths.map((width, cellIndex) => (
                  <TableCell
                    key={`cell-${rowIndex}-${cellIndex}`}
                    style={{
                      width: shrinkZero && width === "auto" ? 0 : width,
                      minWidth: shrinkZero ? 0 : undefined,
                    }}
                  >
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination skeleton */}
      {withPagination && (
        <div className="flex w-full items-center justify-between gap-4 overflow-auto p-1 sm:gap-8">
          <Skeleton className="h-8 w-40 shrink-0" />
          <div className="flex items-center gap-4 sm:gap-6 lg:gap-8">
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-[70px]" />
            </div>
            <Skeleton className="h-8 w-20" />
            <div className="flex items-center gap-2">
              <Skeleton className="hidden size-8 lg:block" />
              <Skeleton className="size-8" />
              <Skeleton className="size-8" />
              <Skeleton className="hidden size-8 lg:block" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
