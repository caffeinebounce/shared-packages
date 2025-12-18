"use client";

import {
  type ColumnDef,
  flexRender,
  type Table as TanStackTable,
} from "@tanstack/react-table";
import * as React from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { cn } from "../../utils";
import {
  type DataTableFilter,
  DataTableFilterBadges,
} from "./DataTableFilterBadges";

/** Display density mode for the data table */
export type DataTableDensity = "compact" | "comfy";

/** Font size for data table content */
export type DataTableFontSize = "xs" | "sm" | "md" | "lg";

export interface DataTableProps<TData, TValue>
  extends React.ComponentProps<"div"> {
  /** TanStack Table instance */
  table: TanStackTable<TData>;
  /** Column definitions */
  columns: ColumnDef<TData, TValue>[];
  /** Optional action bar shown when rows are selected */
  actionBar?: React.ReactNode;
  /** Whether to show floating action bar for selections */
  floatingBar?: React.ReactNode;
  /** Active filters to display as badges */
  filters?: DataTableFilter[];
  /** Remove a filter by id */
  onRemoveFilter?: (filterId: string) => void;
  /** Change a filter value (from badge edit) */
  onChangeFilter?: (filterId: string, value?: string) => void;
  /** Clear all filters */
  onClearAllFilters?: () => void;
  /** Add a new filter (shows "+ Filter" button) */
  onAddFilter?: () => void;
  /** Display density mode - affects row/cell padding */
  density?: DataTableDensity;
  /** Font size for table content */
  fontSize?: DataTableFontSize;
  /** Enable column resizing by dragging */
  enableColumnResizing?: boolean;
}

/**
 * A data table component built on TanStack Table.
 * Renders the table with headers and body rows.
 *
 * @example
 * const columns = [
 *   { accessorKey: "name", header: "Name" },
 *   { accessorKey: "email", header: "Email" },
 * ];
 *
 * const table = useReactTable({
 *   data,
 *   columns,
 *   getCoreRowModel: getCoreRowModel(),
 * });
 *
 * <DataTable table={table} columns={columns} />
 */
export function DataTable<TData, TValue>({
  table,
  columns,
  actionBar,
  floatingBar,
  filters,
  onRemoveFilter,
  onChangeFilter,
  onClearAllFilters,
  onAddFilter,
  density = "comfy",
  fontSize = "sm",
  enableColumnResizing = false,
  className,
  children,
  ...props
}: DataTableProps<TData, TValue>) {
  // Density-based classes - compact is tighter, comfy has more breathing room
  const cellPadding = density === "compact" ? "px-1.5 py-0.5" : "px-3 py-2";
  const headerHeight = density === "compact" ? "h-8" : "h-10";
  
  // Font size classes
  const fontSizeClass = {
    xs: "text-[10px]",
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  }[fontSize];

  // Column resizing state
  const [columnSizing, setColumnSizing] = React.useState<Record<string, number>>({});
  const [resizingColumn, setResizingColumn] = React.useState<string | null>(null);

  // Handle resize start - track initial position for smooth dragging
  const handleResizeStart = React.useCallback((columnId: string, startX: number, startWidth: number) => {
    setResizingColumn(columnId);
    
    // Store the offset between mouse and column edge
    let lastX = startX;
    let currentWidth = startWidth;

    const handleMouseMove = (e: MouseEvent) => {
      // Calculate delta from last position for smoother tracking
      const delta = e.clientX - lastX;
      currentWidth = Math.max(30, currentWidth + delta);
      lastX = e.clientX;
      
      // Use requestAnimationFrame for smoother updates
      requestAnimationFrame(() => {
        setColumnSizing(prev => ({ ...prev, [columnId]: currentWidth }));
      });
    };

    const handleMouseUp = () => {
      setResizingColumn(null);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    // Prevent text selection while dragging
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, []);

  return (
    <div
      className={cn("flex w-full flex-col gap-2.5 overflow-auto", className)}
      {...props}
    >
      {children}

      {/* Filter badges */}
      {(filters && filters.length > 0) || onAddFilter ? (
        <div className="px-1">
          <DataTableFilterBadges
            filters={filters ?? []}
            onRemoveFilter={(id) => onRemoveFilter?.(id)}
            onChangeFilter={(id, value) => onChangeFilter?.(id, value)}
            onClearAll={onClearAllFilters}
            onAddFilter={onAddFilter}
          />
        </div>
      ) : null}

      <div className={cn("overflow-hidden rounded-md border mx-1", fontSizeClass)}>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header, index) => {
                  const isLastColumn = index === headerGroup.headers.length - 1;
                  const columnWidth = columnSizing[header.id];

                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={cn(
                        "p-0", // No padding - header button handles all styling
                        headerHeight,
                        "relative",
                        !isLastColumn && "border-r border-border/30"
                      )}
                      style={{
                        width: columnWidth ?? (header.getSize() !== 150 ? header.getSize() : undefined),
                        minWidth: columnWidth ? columnWidth : undefined,
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                      {/* Resize handle */}
                      {enableColumnResizing && !isLastColumn && (
                        <button
                          type="button"
                          aria-label="Resize column"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            const th = e.currentTarget.parentElement;
                            if (th) {
                              handleResizeStart(header.id, e.clientX, th.offsetWidth);
                            }
                          }}
                          className={cn(
                            "absolute right-0 top-0 h-full w-1 cursor-col-resize border-0 bg-transparent p-0",
                            "hover:bg-primary/30 transition-colors",
                            resizingColumn === header.id && "bg-primary/50"
                          )}
                        />
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell, index) => {
                    const isLastColumn = index === row.getVisibleCells().length - 1;
                    const columnWidth = columnSizing[cell.column.id];

                    return (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          cellPadding,
                          "whitespace-nowrap overflow-hidden",
                          !isLastColumn && "border-r border-border/30"
                        )}
                        style={{
                          width: columnWidth,
                          minWidth: columnWidth,
                        }}
                      >
                        <div className="truncate">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </div>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {actionBar &&
        table.getFilteredSelectedRowModel().rows.length > 0 &&
        actionBar}
      {floatingBar &&
        table.getFilteredSelectedRowModel().rows.length > 0 &&
        floatingBar}
    </div>
  );
}
