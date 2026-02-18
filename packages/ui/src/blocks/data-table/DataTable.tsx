"use client";

import {
  type ColumnDef,
  flexRender,
  type Row,
  type Table as TanStackTable,
} from "@tanstack/react-table";
import {
  ChevronDown,
  ChevronRight,
  ChevronsDownUp,
  ChevronsUpDown,
  GripVertical,
} from "lucide-react";
import * as React from "react";

import {
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

/** Context for DataTable column state */
export interface DataTableContextValue {
  /** Column wrapping state (map of column ID to wrap boolean) */
  columnWrapping: Record<string, boolean>;
  /** Toggle wrapping for a column */
  toggleColumnWrapping: (columnId: string) => void;
  /** Whether column drag is enabled */
  enableColumnDrag: boolean;
  /** Handler for column drag start */
  onColumnDragStart: (e: React.DragEvent, columnId: string) => void;
  /** Handler for column drag end */
  onColumnDragEnd: (e: React.DragEvent) => void;
  /** Current font size setting */
  fontSize: DataTableFontSize;
  /** CSS class for the font size */
  fontSizeClass: string;
  /** Display density mode */
  density: DataTableDensity;
}

export const DataTableContext =
  React.createContext<DataTableContextValue | null>(null);

/** Hook to access DataTable context from column headers */
export function useDataTableContext() {
  return React.useContext(DataTableContext);
}

/** Display density mode for the data table */
export type DataTableDensity = "compact" | "comfy";

/** Font size for data table content */
export type DataTableFontSize = "xs" | "sm" | "md" | "lg";

/** Row selection style - controls how checkboxes appear */
export type RowSelectionStyle = "always" | "hover" | "none";

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
  /** Enable column drag to reorder */
  enableColumnDrag?: boolean;
  /** Current column order (array of column IDs) */
  columnOrder?: string[];
  /** Callback when column order changes via drag */
  onColumnOrderChange?: (columnOrder: string[]) => void;
  /** Column wrapping state (map of column ID to wrap boolean) */
  columnWrapping?: Record<string, boolean>;
  /** Callback when column wrapping changes */
  onColumnWrappingChange?: (columnWrapping: Record<string, boolean>) => void;
  /** Callback when a row is clicked */
  onRowClick?: (row: Row<TData>) => void;
  /** Optional summary component to render below the table but inside the scroll container */
  summary?: React.ReactNode;
  /** Enable tree view with expand/collapse and indentation for hierarchical data */
  enableTreeView?: boolean;
  /** Indent in pixels per depth level (default: 20) */
  treeIndentPx?: number;
  /** Optional callback to add extra CSS class(es) to a specific row */
  getRowClassName?: (row: Row<TData>) => string | undefined;
}

// ── Tree expand cycle button ──────────────────────────────────────────────────

/** Cycles expand state: level 0 → level 1 → … → all → collapse */
function TreeExpandCycleButton<TData>({
  table,
  density,
}: {
  table: TanStackTable<TData>;
  density: DataTableDensity;
}) {
  // Track which depth level we're at (cycle counter)
  const depthRef = React.useRef(-1);

  // Find max depth across all rows (walk full pre-expanded model)
  const maxDepth = React.useMemo(() => {
    let max = 0;
    const walk = (rows: Row<TData>[]) => {
      for (const row of rows) {
        if (row.depth > max) max = row.depth;
        if (row.subRows?.length) walk(row.subRows);
      }
    };
    walk(table.getPreExpandedRowModel?.()?.rows ?? table.getCoreRowModel().rows);
    return max;
  }, [table]);

  const handleClick = React.useCallback(() => {
    const nextDepth = depthRef.current + 1;

    // Past max expandable depth → collapse all, reset counter
    if (nextDepth > maxDepth) {
      table.toggleAllRowsExpanded(false);
      depthRef.current = -1;
      return;
    }

    // Expand all rows up to nextDepth
    const newExpanded: Record<string, boolean> = {};
    const allRows = (
      table.getPreExpandedRowModel?.()?.rows ??
      table.getCoreRowModel().rows
    );

    const walk = (rows: Row<TData>[]) => {
      for (const row of rows) {
        if (row.depth <= nextDepth && row.getCanExpand()) {
          newExpanded[row.id] = true;
        }
        if (row.subRows?.length) walk(row.subRows);
      }
    };
    walk(allRows);

    table.setExpanded(newExpanded);
    depthRef.current = nextDepth;
  }, [table, maxDepth]);

  const isAllExpanded = table.getIsAllRowsExpanded();
  const isSomeExpanded = table.getIsSomeRowsExpanded();

  const iconSize = density === "compact" ? "size-3.5" : "size-4";

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "inline-flex items-center justify-center shrink-0 text-muted-foreground hover:text-foreground rounded hover:bg-accent transition-colors",
        density === "compact" ? "size-5 ml-0.5" : "size-6 ml-1",
      )}
      aria-label={
        isAllExpanded
          ? "Collapse all rows"
          : "Expand next level"
      }
      title={
        isAllExpanded
          ? "Collapse all"
          : isSomeExpanded
            ? "Expand next level"
            : "Expand all"
      }
    >
      {isAllExpanded ? (
        <ChevronsDownUp className={iconSize} />
      ) : isSomeExpanded ? (
        <ChevronsUpDown className={iconSize} />
      ) : (
        <ChevronsUpDown className={iconSize} />
      )}
    </button>
  );
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
  rowSelectionStyle = "hover",
  enableRowDrag = true,
  onRowDragEnd,
  enableColumnDrag = false,
  columnOrder: externalColumnOrder,
  onColumnOrderChange,
  columnWrapping: externalColumnWrapping,
  onColumnWrappingChange,
  onRowClick,
  summary,
  enableTreeView = false,
  treeIndentPx = 20,
  getRowClassName,
  className,
  children,
  ...props
}: DataTableProps<TData, TValue>) {
  // Density-based classes - compact is tighter, comfy has more breathing room
  // Use px-2 for horizontal padding to match header button padding
  const cellPadding = density === "compact" ? "px-1.5 py-0.5" : "px-2 py-1";
  const headerHeight = density === "compact" ? "h-7" : "h-8";

  // Font size classes
  const fontSizeClass = {
    xs: "text-[10px]",
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  }[fontSize];

  // Checkbox size based on font size
  const checkboxSize = {
    xs: "size-3.5",
    sm: "size-4",
    md: "size-4.5",
    lg: "size-5",
  }[fontSize];

  // Checkmark icon size
  const checkmarkSize = {
    xs: "size-2",
    sm: "size-2.5",
    md: "size-3",
    lg: "size-3.5",
  }[fontSize];

  // Gutter width based on density and drag enabled (exported for consumers via context if needed)
  const _gutterWidth = enableRowDrag
    ? density === "compact"
      ? 44
      : 56
    : density === "compact"
      ? 24
      : 32;

  // Column resizing state
  const [columnSizing, setColumnSizing] = React.useState<
    Record<string, number>
  >({});
  const [resizingColumn, setResizingColumn] = React.useState<string | null>(
    null,
  );

  // Hover state for Notion-style row selection
  const [hoveredRowId, setHoveredRowId] = React.useState<string | null>(null);

  // Internal column order state (used if not controlled externally)
  const defaultColumnOrder = React.useMemo(
    () =>
      columns.map((col) =>
        col.id
          ? col.id
          : "accessorKey" in col
            ? String(col.accessorKey)
            : "",
      ),
    [columns],
  );
  const [internalColumnOrder, setInternalColumnOrder] =
    React.useState<string[]>(defaultColumnOrder);
  const columnOrder = externalColumnOrder ?? internalColumnOrder;
  const setColumnOrder = onColumnOrderChange ?? setInternalColumnOrder;

  // Internal column wrapping state (used if not controlled externally)
  const [internalColumnWrapping, setInternalColumnWrapping] = React.useState<
    Record<string, boolean>
  >({});
  const columnWrapping = externalColumnWrapping ?? internalColumnWrapping;
  const setColumnWrapping = onColumnWrappingChange ?? setInternalColumnWrapping;

  // Drag state for column reordering
  const [draggedColumnId, setDraggedColumnId] = React.useState<string | null>(
    null,
  );
  const [dragOverColumnId, setDragOverColumnId] = React.useState<string | null>(
    null,
  );
  const [dragOverColumnPosition, setDragOverColumnPosition] = React.useState<
    "left" | "right" | null
  >(null);

  // Handle column drag start
  const handleColumnDragStart = React.useCallback(
    (e: React.DragEvent, columnId: string) => {
      setDraggedColumnId(columnId);
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", columnId);
      requestAnimationFrame(() => {
        (e.target as HTMLElement).closest("th")?.classList.add("opacity-50");
      });
    },
    [],
  );

  // Handle column drag over
  const handleColumnDragOver = React.useCallback(
    (e: React.DragEvent, columnId: string) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      if (draggedColumnId !== null && draggedColumnId !== columnId) {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const midX = rect.left + rect.width / 2;
        const position = e.clientX < midX ? "left" : "right";
        setDragOverColumnId(columnId);
        setDragOverColumnPosition(position);
      }
    },
    [draggedColumnId],
  );

  // Handle column drag leave
  const handleColumnDragLeave = React.useCallback(() => {
    setDragOverColumnId(null);
    setDragOverColumnPosition(null);
  }, []);

  // Handle column drop
  const handleColumnDrop = React.useCallback(
    (e: React.DragEvent, targetColumnId: string) => {
      e.preventDefault();
      if (draggedColumnId && draggedColumnId !== targetColumnId) {
        const currentOrder = [...columnOrder];
        const fromIndex = currentOrder.indexOf(draggedColumnId);
        let toIndex = currentOrder.indexOf(targetColumnId);

        if (fromIndex !== -1 && toIndex !== -1) {
          // Remove from old position
          currentOrder.splice(fromIndex, 1);
          // Recalculate target index after removal
          toIndex = currentOrder.indexOf(targetColumnId);
          // Insert at new position (after target if dropping on right side)
          if (dragOverColumnPosition === "right") {
            toIndex += 1;
          }
          currentOrder.splice(toIndex, 0, draggedColumnId);
          setColumnOrder(currentOrder);
        }
      }
      setDraggedColumnId(null);
      setDragOverColumnId(null);
      setDragOverColumnPosition(null);
    },
    [draggedColumnId, columnOrder, dragOverColumnPosition, setColumnOrder],
  );

  // Handle column drag end (cleanup)
  const handleColumnDragEnd = React.useCallback((e: React.DragEvent) => {
    (e.target as HTMLElement).closest("th")?.classList.remove("opacity-50");
    setDraggedColumnId(null);
    setDragOverColumnId(null);
    setDragOverColumnPosition(null);
  }, []);

  // Toggle column wrapping
  const toggleColumnWrapping = React.useCallback(
    (columnId: string) => {
      setColumnWrapping({
        ...columnWrapping,
        [columnId]: !columnWrapping[columnId],
      });
    },
    [columnWrapping, setColumnWrapping],
  );

  // Drag state for row reordering
  const [draggedRowIndex, setDraggedRowIndex] = React.useState<number | null>(
    null,
  );
  const [dragOverRowIndex, setDragOverRowIndex] = React.useState<number | null>(
    null,
  );
  const [dragOverPosition, setDragOverPosition] = React.useState<
    "above" | "below" | null
  >(null);

  // Handle row drag start
  const handleRowDragStart = React.useCallback(
    (e: React.DragEvent, rowIndex: number) => {
      setDraggedRowIndex(rowIndex);
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", String(rowIndex));
      // Add a slight delay to allow the drag image to be set
      requestAnimationFrame(() => {
        (e.target as HTMLElement).closest("tr")?.classList.add("opacity-50");
      });
    },
    [],
  );

  // Handle row drag over
  const handleRowDragOver = React.useCallback(
    (e: React.DragEvent, rowIndex: number) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      if (draggedRowIndex !== null && draggedRowIndex !== rowIndex) {
        // Determine if dragging over top or bottom half of the row
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        const position = e.clientY < midY ? "above" : "below";
        setDragOverRowIndex(rowIndex);
        setDragOverPosition(position);
      }
    },
    [draggedRowIndex],
  );

  // Handle row drag leave
  const handleRowDragLeave = React.useCallback(() => {
    setDragOverRowIndex(null);
    setDragOverPosition(null);
  }, []);

  // Handle row drop
  const handleRowDrop = React.useCallback(
    (e: React.DragEvent, toIndex: number) => {
      e.preventDefault();
      const fromIndex = draggedRowIndex;
      if (fromIndex !== null && fromIndex !== toIndex && onRowDragEnd) {
        // If dropping below, adjust target index
        let targetIndex = toIndex;
        if (dragOverPosition === "below") {
          targetIndex = toIndex + 1;
        }
        // Adjust if dragging from above
        if (fromIndex < targetIndex) {
          targetIndex -= 1;
        }
        if (fromIndex !== targetIndex) {
          onRowDragEnd(fromIndex, targetIndex);
        }
      }
      setDraggedRowIndex(null);
      setDragOverRowIndex(null);
      setDragOverPosition(null);
    },
    [draggedRowIndex, dragOverPosition, onRowDragEnd],
  );

  // Handle row drag end (cleanup)
  const handleRowDragEnd = React.useCallback((e: React.DragEvent) => {
    (e.target as HTMLElement).closest("tr")?.classList.remove("opacity-50");
    setDraggedRowIndex(null);
    setDragOverRowIndex(null);
    setDragOverPosition(null);
  }, []);

  // Handle resize start - track initial position for smooth dragging
  const handleResizeStart = React.useCallback(
    (columnId: string, startX: number, startWidth: number) => {
      setResizingColumn(columnId);

      const handleMouseMove = (e: MouseEvent) => {
        // Calculate width based on absolute position from start
        const delta = e.clientX - startX;
        const newWidth = Math.max(20, startWidth + delta);
        setColumnSizing((prev) => ({ ...prev, [columnId]: newWidth }));
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

  const contextValue = React.useMemo<DataTableContextValue>(
    () => ({
      columnWrapping,
      toggleColumnWrapping,
      enableColumnDrag: enableColumnDrag ?? false,
      onColumnDragStart: handleColumnDragStart,
      onColumnDragEnd: handleColumnDragEnd,
      fontSize,
      fontSizeClass,
      density,
    }),
    [
      columnWrapping,
      toggleColumnWrapping,
      enableColumnDrag,
      handleColumnDragStart,
      handleColumnDragEnd,
      fontSize,
      fontSizeClass,
      density,
    ],
  );

  return (
    <DataTableContext.Provider value={contextValue}>
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
        <div className={cn("mx-1", fontSizeClass)}>
          <div
            className={cn(
              "overflow-x-auto rounded-t-md [&::-webkit-scrollbar-track]:bg-transparent",
              summary ? "border-t" : "border rounded-b-md",
            )}
          >
            <table
              className={cn(
                "w-full caption-bottom border-separate border-spacing-0",
                fontSizeClass,
              )}
            >
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => {
                  // Get headers that should be rendered (excluding gutter select when using gutter)
                  const renderableHeaders = headerGroup.headers.filter(
                    (h) =>
                      !(
                        (rowSelectionStyle === "hover" || enableRowDrag) &&
                        h.id === "select"
                      ),
                  );

                  // Sort headers by columnOrder if column drag is enabled
                  const orderedHeaders = enableColumnDrag
                    ? [...renderableHeaders].sort((a, b) => {
                        const aIndex = columnOrder.indexOf(a.id);
                        const bIndex = columnOrder.indexOf(b.id);
                        // Columns not in order go to end
                        if (aIndex === -1) return 1;
                        if (bIndex === -1) return -1;
                        return aIndex - bIndex;
                      })
                    : renderableHeaders;

                  return (
                    <TableRow
                      key={headerGroup.id}
                      className="hover:bg-transparent"
                    >
                      {/* Gutter header cell - width: 1% + whitespace-nowrap = shrink to fit */}
                      {(rowSelectionStyle === "hover" || enableRowDrag) && (
                        <TableHead
                          className={cn(
                            "p-0 border-r-0 whitespace-nowrap border-l border-b border-border group/header-gutter",
                            headerHeight,
                          )}
                          style={{ width: "1%" }}
                        >
                          <div className="flex items-center justify-end gap-0.5 px-1 h-full">
                            {/* Spacer matching drag handle size for alignment */}
                            {enableRowDrag && (
                              <div
                                className={cn(
                                  "shrink-0",
                                  density === "compact" ? "size-5" : "size-6",
                                )}
                                aria-hidden="true"
                              />
                            )}
                            <button
                              type="button"
                              onClick={() =>
                                table.toggleAllPageRowsSelected(
                                  !table.getIsAllPageRowsSelected(),
                                )
                              }
                              className={cn(
                                "flex items-center justify-center rounded border transition-all",
                                checkboxSize,
                                table.getIsAllPageRowsSelected()
                                  ? "bg-primary border-primary text-primary-foreground opacity-100"
                                  : table.getIsSomePageRowsSelected()
                                    ? "bg-primary/50 border-primary text-primary-foreground opacity-100"
                                    : "border-border hover:border-primary/50 hover:bg-accent opacity-0 group-hover/header-gutter:opacity-100",
                              )}
                              aria-label={
                                table.getIsAllPageRowsSelected()
                                  ? "Deselect all rows"
                                  : "Select all rows"
                              }
                            >
                              {table.getIsAllPageRowsSelected() && (
                                <svg
                                  className={checkmarkSize}
                                  viewBox="0 0 12 12"
                                  fill="none"
                                  aria-hidden="true"
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
                              {table.getIsSomePageRowsSelected() &&
                                !table.getIsAllPageRowsSelected() && (
                                  <svg
                                    className={checkmarkSize}
                                    viewBox="0 0 12 12"
                                    fill="none"
                                    aria-hidden="true"
                                  >
                                    <path
                                      d="M2.5 6H9.5"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                    />
                                  </svg>
                                )}
                            </button>
                          </div>
                        </TableHead>
                      )}
                      {orderedHeaders.map((header, headerIndex) => {
                        const isLastColumn =
                          headerIndex === orderedHeaders.length - 1;
                        // Only first column gets left border if no gutter exists
                        const hasGutter =
                          rowSelectionStyle === "hover" || enableRowDrag;
                        const isFirstColumn = headerIndex === 0 && !hasGutter;

                        // Determine if header is a simple string (not a function/component)
                        const headerDef = header.column.columnDef.header;
                        const isSimpleHeader = typeof headerDef === "string";

                        // Check if this is a fixed-width column (size === minSize === maxSize)
                        const colDef = header.column.columnDef;
                        const isFixedWidth =
                          colDef.size &&
                          colDef.minSize === colDef.size &&
                          colDef.maxSize === colDef.size;

                        // Check if this is an actions column (should shrink to fit content)
                        const isActionsColumn =
                          header.id === "actions" || header.id === "select";

                        // Get user-resized width if any (not for fixed-width columns)
                        const resizedWidth = isFixedWidth
                          ? undefined
                          : columnSizing[header.id];

                        // Check if this column can be dragged (not select, not actions typically)
                        const canDragColumn =
                          enableColumnDrag && !isFixedWidth && !isActionsColumn;

                        // Column drag indicator
                        const isDragOverLeft =
                          dragOverColumnId === header.id &&
                          dragOverColumnPosition === "left";
                        const isDragOverRight =
                          dragOverColumnId === header.id &&
                          dragOverColumnPosition === "right";

                        return (
                          <TableHead
                            key={header.id}
                            colSpan={header.colSpan}
                            onDragOver={
                              canDragColumn
                                ? (e) => handleColumnDragOver(e, header.id)
                                : undefined
                            }
                            onDragLeave={
                              canDragColumn ? handleColumnDragLeave : undefined
                            }
                            onDrop={
                              canDragColumn
                                ? (e) => handleColumnDrop(e, header.id)
                                : undefined
                            }
                            className={cn(
                              isSimpleHeader ? "px-2" : "p-0", // Add padding for simple headers, let component headers handle their own
                              headerHeight,
                              // Tree view first column: flex layout for expand-all button + header
                              enableTreeView &&
                                headerIndex === 0 &&
                                "flex items-center",
                              "relative overflow-hidden text-ellipsis border-b border-border",
                              !columnWrapping[header.id] && "whitespace-nowrap",
                              columnWrapping[header.id] && "whitespace-normal",
                              isFirstColumn && "border-l border-border",
                              "border-r border-border",
                              isDragOverLeft && "border-l-2 border-l-primary",
                              isDragOverRight && "border-r-2 border-r-primary",
                            )}
                            style={
                              isFixedWidth || isActionsColumn
                                ? { width: "1%" }
                                : resizedWidth
                                  ? { width: resizedWidth }
                                  : undefined
                            }
                          >
                            {header.isPlaceholder ? null : (
                              <>
                                {/* Tree view: cycle expand depth on first column header */}
                                {enableTreeView && headerIndex === 0 && (
                                  <TreeExpandCycleButton
                                    table={table}
                                    density={density}
                                  />
                                )}
                                {isSimpleHeader ? (
                                  <span
                                    className={cn(
                                      "font-medium",
                                      fontSizeClass,
                                    )}
                                  >
                                    {headerDef}
                                  </span>
                                ) : (
                                  flexRender(
                                    header.column.columnDef.header,
                                    header.getContext(),
                                  )
                                )}
                              </>
                            )}
                            {/* Resize handle - not shown for fixed-width or last column */}
                            {enableColumnResizing &&
                              !isLastColumn &&
                              !isFixedWidth && (
                                // biome-ignore lint/a11y/noStaticElementInteractions: Column resize uses mouse drag interaction only
                                <div
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
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
                                    "absolute -right-1 top-0 z-10 h-full w-3 cursor-col-resize select-none",
                                    "before:absolute before:right-1 before:top-0 before:h-full before:w-px before:bg-transparent before:transition-colors",
                                    "hover:before:bg-primary/50",
                                    resizingColumn === header.id &&
                                      "before:bg-primary",
                                  )}
                                />
                              )}
                          </TableHead>
                        );
                      })}
                    </TableRow>
                  );
                })}
              </TableHeader>
              <TableBody
                className={summary ? "[&_tr:last-child]:border-b" : undefined}
              >
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row, rowIndex) => {
                    const isHovered = hoveredRowId === row.id;
                    const isSelected = row.getIsSelected();
                    const showRowControls = isHovered || isSelected;
                    const isDragOverAbove =
                      dragOverRowIndex === rowIndex &&
                      dragOverPosition === "above";
                    const isDragOverBelow =
                      dragOverRowIndex === rowIndex &&
                      dragOverPosition === "below";

                    return (
                      <TableRow
                        key={row.id}
                        data-state={isSelected && "selected"}
                        data-hovered={isHovered}
                        onMouseEnter={() => setHoveredRowId(row.id)}
                        onMouseLeave={() => setHoveredRowId(null)}
                        onClick={() => onRowClick?.(row)}
                        onDragOver={
                          enableRowDrag
                            ? (e) => handleRowDragOver(e, rowIndex)
                            : undefined
                        }
                        onDragLeave={
                          enableRowDrag ? handleRowDragLeave : undefined
                        }
                        onDrop={
                          enableRowDrag
                            ? (e) => handleRowDrop(e, rowIndex)
                            : undefined
                        }
                        className={cn(
                          "group/row",
                          onRowClick && "cursor-pointer hover:bg-muted/50",
                          getRowClassName?.(row),
                          // Add bottom border to last row when summary exists
                          summary &&
                            rowIndex === table.getRowModel().rows.length - 1 &&
                            "border-b",
                        )}
                      >
                        {/* Gutter cell with controls - inside the row so perfectly aligned */}
                        {(rowSelectionStyle === "hover" || enableRowDrag) && (
                          <TableCell
                            className={cn(
                              "p-0 border-r-0 whitespace-nowrap border-l border-border",
                              // All rows get bottom border except last row without summary
                              rowIndex !==
                                table.getRowModel().rows.length - 1 &&
                                "border-b border-border",
                              // Last row only gets border-b when summary exists, plus rounding
                              summary &&
                                rowIndex ===
                                  table.getRowModel().rows.length - 1 &&
                                "border-b border-border rounded-bl-md overflow-hidden",
                              // Drag-over indicator
                              isDragOverAbove && "border-t-2 border-t-primary",
                              isDragOverBelow && "border-b-2 border-b-primary",
                            )}
                            style={{ width: "1%" }}
                          >
                            <div
                              className={cn(
                                "flex items-center justify-end gap-0.5 px-1 h-full transition-opacity",
                                showRowControls ? "opacity-100" : "opacity-0",
                              )}
                            >
                              {/* Note: Drag-to-reorder requires mouse/touch. Keyboard reordering would need significant additional implementation. */}
                              {enableRowDrag && (
                                <div
                                  draggable
                                  onDragStart={(e) =>
                                    handleRowDragStart(e, rowIndex)
                                  }
                                  onDragEnd={handleRowDragEnd}
                                  className={cn(
                                    "flex items-center justify-center text-muted-foreground/50 hover:text-muted-foreground cursor-grab active:cursor-grabbing rounded hover:bg-accent",
                                    density === "compact" ? "size-5" : "size-6",
                                  )}
                                  aria-hidden="true"
                                >
                                  <GripVertical
                                    className={
                                      density === "compact"
                                        ? "size-3"
                                        : "size-4"
                                    }
                                  />
                                </div>
                              )}
                              <button
                                type="button"
                                onClick={() =>
                                  row.toggleSelected(!row.getIsSelected())
                                }
                                className={cn(
                                  "flex items-center justify-center rounded border transition-colors",
                                  checkboxSize,
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
                                    className={checkmarkSize}
                                    viewBox="0 0 12 12"
                                    fill="none"
                                    aria-hidden="true"
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
                        {row
                          .getVisibleCells()
                          .map((cell) => {
                            // Skip select column when using gutter
                            if (
                              (rowSelectionStyle === "hover" ||
                                enableRowDrag) &&
                              cell.column.id === "select"
                            ) {
                              return null;
                            }
                            return cell;
                          })
                          .filter(
                            (cell): cell is NonNullable<typeof cell> =>
                              cell !== null,
                          )
                          // Sort cells by columnOrder if column drag is enabled
                          .sort((a, b) => {
                            if (!enableColumnDrag) return 0;
                            const aIndex = columnOrder.indexOf(a.column.id);
                            const bIndex = columnOrder.indexOf(b.column.id);
                            if (aIndex === -1) return 1;
                            if (bIndex === -1) return -1;
                            return aIndex - bIndex;
                          })
                          .map((cell, cellIndex, sortedCells) => {
                            const isLastColumn =
                              cellIndex === sortedCells.length - 1;
                            // Only first column gets left border if no gutter exists
                            const hasGutter =
                              rowSelectionStyle === "hover" || enableRowDrag;
                            const isFirstColumn = cellIndex === 0 && !hasGutter;

                            // Check if this is a fixed-width column
                            const colDef = cell.column.columnDef;
                            const isFixedWidth =
                              colDef.size &&
                              colDef.minSize === colDef.size &&
                              colDef.maxSize === colDef.size;

                            // Check if this is an actions column (should shrink to fit content)
                            const isActionsColumn =
                              cell.column.id === "actions" ||
                              cell.column.id === "select";

                            // Get user-resized width (not for fixed-width columns)
                            const resizedWidth = isFixedWidth
                              ? undefined
                              : columnSizing[cell.column.id];

                            // Check if wrapping is enabled for this column
                            const isWrapped = columnWrapping[cell.column.id];

                            // Column alignment from meta
                            const colMeta = cell.column.columnDef
                              .meta as Record<string, unknown> | undefined;
                            const colAlign =
                              (colMeta?.align as string) ?? "left";
                            const alignClass =
                              colAlign === "right"
                                ? "text-right"
                                : colAlign === "center"
                                  ? "text-center"
                                  : "";

                            // Tree view: first data cell (cellIndex === 0) gets indent + chevron
                            const isFirstDataCell = cellIndex === 0;
                            const showTreeUI =
                              enableTreeView && isFirstDataCell;
                            const treeIndent = showTreeUI
                              ? row.depth * treeIndentPx
                              : 0;
                            const canExpand =
                              showTreeUI && row.getCanExpand();

                            return (
                              <TableCell
                                key={cell.id}
                                className={cn(
                                  cellPadding,
                                  !isWrapped &&
                                    "overflow-hidden text-ellipsis whitespace-nowrap",
                                  isWrapped && "whitespace-normal break-words",
                                  !isLastColumn && "border-r border-border",
                                  isFirstColumn && "border-l border-border",
                                  isLastColumn && "border-r border-border",
                                  isActionsColumn && "whitespace-nowrap",
                                  // All rows get bottom border except last row without summary
                                  rowIndex !==
                                    table.getRowModel().rows.length - 1 &&
                                    "border-b border-border",
                                  // Last row only gets border-b when summary exists, plus rounding on corners
                                  summary &&
                                    rowIndex ===
                                      table.getRowModel().rows.length - 1 &&
                                    "border-b border-border",
                                  summary &&
                                    rowIndex ===
                                      table.getRowModel().rows.length - 1 &&
                                    isLastColumn &&
                                    "rounded-br-md overflow-hidden",
                                  summary &&
                                    rowIndex ===
                                      table.getRowModel().rows.length - 1 &&
                                    isFirstColumn &&
                                    "rounded-bl-md overflow-hidden",
                                )}
                                style={{
                                  width: resizedWidth || cell.column.getSize(),
                                }}
                              >
                                {showTreeUI ? (
                                  <div
                                    className="flex items-center gap-1"
                                    style={{ paddingLeft: `${treeIndent}px` }}
                                  >
                                    {canExpand ? (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          row.toggleExpanded();
                                        }}
                                        className="shrink-0 text-muted-foreground hover:text-foreground"
                                        aria-label={
                                          row.getIsExpanded()
                                            ? "Collapse"
                                            : "Expand"
                                        }
                                      >
                                        {row.getIsExpanded() ? (
                                          <ChevronDown className="size-4" />
                                        ) : (
                                          <ChevronRight className="size-4" />
                                        )}
                                      </button>
                                    ) : (
                                      <span
                                        className="inline-block shrink-0 size-4"
                                        aria-hidden="true"
                                      />
                                    )}
                                    <div
                                      className={cn(
                                        "min-w-0",
                                        !isWrapped && "truncate",
                                      )}
                                    >
                                      {flexRender(
                                        cell.column.columnDef.cell,
                                        cell.getContext(),
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <div
                                    className={cn(
                                      !isWrapped && "truncate",
                                      alignClass,
                                    )}
                                  >
                                    {flexRender(
                                      cell.column.columnDef.cell,
                                      cell.getContext(),
                                    )}
                                  </div>
                                )}
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
                      className="h-24"
                    >
                      <div className="sticky left-0 w-fit px-4 text-muted-foreground">
                        No results.
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              {summary && <tfoot>{summary}</tfoot>}
            </table>
          </div>
        </div>
        {actionBar &&
          table.getFilteredSelectedRowModel().rows.length > 0 &&
          actionBar}
        {floatingBar &&
          table.getFilteredSelectedRowModel().rows.length > 0 &&
          floatingBar}
      </div>
    </DataTableContext.Provider>
  );
}
