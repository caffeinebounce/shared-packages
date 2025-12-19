"use client";

import {
  type ColumnDef,
  flexRender,
  type Table as TanStackTable,
} from "@tanstack/react-table";
import { GripVertical } from "lucide-react";
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

/** Row selection style - controls how checkboxes appear */
export type RowSelectionStyle = "always" | "hover";

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
  /** Row selection style - "hover" shows checkboxes only on hover (Notion-style) */
  rowSelectionStyle?: RowSelectionStyle;
  /** Enable row drag to reorder */
  enableRowDrag?: boolean;
  /** Callback when row order changes via drag */
  onRowDragEnd?: (fromIndex: number, toIndex: number) => void;
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
  rowSelectionStyle = "always",
  enableRowDrag = false,
  onRowDragEnd,
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
  const [columnSizing, setColumnSizing] = React.useState<
    Record<string, number>
  >({});
  const [resizingColumn, setResizingColumn] = React.useState<string | null>(
    null,
  );

  // Hover state for Notion-style row selection
  const [hoveredRowId, setHoveredRowId] = React.useState<string | null>(null);

  // Handle resize start - track initial position for smooth dragging
  const handleResizeStart = React.useCallback(
    (columnId: string, startX: number, startWidth: number) => {
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
          setColumnSizing((prev) => ({ ...prev, [columnId]: currentWidth }));
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
    },
    [],
  );

  return (
    <div
      className={cn(
        "flex w-full max-w-full min-w-0 flex-col gap-2.5",
        className,
      )}
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

      {/* Table with gutter for selection/drag handles */}
      <div className={cn("mx-1 max-w-full", fontSizeClass)}>
        <div className="overflow-x-auto rounded-md border w-full">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                  {/* Gutter header cell */}
                  {(rowSelectionStyle === "hover" || enableRowDrag) && (
                    <TableHead
                      className={cn("p-0 border-r-0", headerHeight)}
                      style={{ width: enableRowDrag ? 56 : 32 }}
                    />
                  )}
                  {headerGroup.headers.map((header) => {
                    // Skip select column when using gutter
                    if (
                      (rowSelectionStyle === "hover" || enableRowDrag) &&
                      header.id === "select"
                    ) {
                      return null;
                    }

                    const visibleHeaders = headerGroup.headers.filter(
                      (h) =>
                        !(
                          (rowSelectionStyle === "hover" || enableRowDrag) &&
                          h.id === "select"
                        ),
                    );
                    const adjustedIndex = visibleHeaders.findIndex(
                      (h) => h.id === header.id,
                    );
                    const isLastColumn =
                      adjustedIndex === visibleHeaders.length - 1;
                    const columnWidth = columnSizing[header.id];

                    return (
                      <TableHead
                        key={header.id}
                        colSpan={header.colSpan}
                        className={cn(
                          "p-0", // No padding - header button handles all styling
                          headerHeight,
                          "relative",
                          !isLastColumn && "border-r border-border/30",
                        )}
                        style={{
                          width:
                            columnWidth ??
                            (header.getSize() !== 150
                              ? header.getSize()
                              : undefined),
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
                                handleResizeStart(
                                  header.id,
                                  e.clientX,
                                  th.offsetWidth,
                                );
                              }
                            }}
                            className={cn(
                              "absolute right-0 top-0 h-full w-1 cursor-col-resize border-0 bg-transparent p-0",
                              "hover:bg-primary/30 transition-colors",
                              resizingColumn === header.id && "bg-primary/50",
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
                table.getRowModel().rows.map((row) => {
                  const isHovered = hoveredRowId === row.id;
                  const isSelected = row.getIsSelected();
                  const showRowControls = isHovered || isSelected;

                  return (
                    <TableRow
                      key={row.id}
                      data-state={isSelected && "selected"}
                      data-hovered={isHovered}
                      onMouseEnter={() => setHoveredRowId(row.id)}
                      onMouseLeave={() => setHoveredRowId(null)}
                      className="group/row"
                    >
                      {/* Gutter cell with controls - inside the row so perfectly aligned */}
                      {(rowSelectionStyle === "hover" || enableRowDrag) && (
                        <TableCell
                          className="p-0 border-r-0"
                          style={{ width: enableRowDrag ? 56 : 32 }}
                        >
                          <div
                            className={cn(
                              "flex items-center justify-end gap-0.5 px-1 h-full transition-opacity",
                              showRowControls ? "opacity-100" : "opacity-0",
                            )}
                          >
                            {enableRowDrag && (
                              <button
                                type="button"
                                className="flex items-center justify-center size-6 text-muted-foreground/50 hover:text-muted-foreground cursor-grab rounded hover:bg-accent"
                                aria-label="Drag to reorder"
                                draggable
                              >
                                <GripVertical className="size-4" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() =>
                                row.toggleSelected(!row.getIsSelected())
                              }
                              className={cn(
                                "flex items-center justify-center size-5 rounded border transition-colors",
                                isSelected
                                  ? "bg-primary border-primary text-primary-foreground"
                                  : "border-border hover:border-primary/50 hover:bg-accent",
                              )}
                              aria-label={
                                isSelected ? "Deselect row" : "Select row"
                              }
                            >
                              {isSelected && (
                                <svg
                                  className="size-3"
                                  viewBox="0 0 12 12"
                                  fill="none"
                                >
                                  <path
                                    d="M2.5 6L5 8.5L9.5 3.5"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              )}
                            </button>
                          </div>
                        </TableCell>
                      )}
                      {row.getVisibleCells().map((cell) => {
                        // Skip select column when using gutter
                        if (
                          (rowSelectionStyle === "hover" || enableRowDrag) &&
                          cell.column.id === "select"
                        ) {
                          return null;
                        }

                        const visibleCells = row
                          .getVisibleCells()
                          .filter(
                            (c) =>
                              !(
                                (rowSelectionStyle === "hover" ||
                                  enableRowDrag) &&
                                c.column.id === "select"
                              ),
                          );
                        const adjustedIndex = visibleCells.findIndex(
                          (c) => c.id === cell.id,
                        );
                        const isLastColumn =
                          adjustedIndex === visibleCells.length - 1;
                        const columnWidth = columnSizing[cell.column.id];

                        return (
                          <TableCell
                            key={cell.id}
                            className={cn(
                              cellPadding,
                              "whitespace-nowrap overflow-hidden",
                              !isLastColumn && "border-r border-border/30",
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
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={
                      columns.length +
                      (rowSelectionStyle === "hover" || enableRowDrag ? 1 : 0)
                    }
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
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
