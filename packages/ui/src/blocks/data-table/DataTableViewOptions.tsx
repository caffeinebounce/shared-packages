"use client";

import type { Table } from "@tanstack/react-table";
import { Eye, EyeOff, GripVertical, Settings2 } from "lucide-react";
import * as React from "react";

import { Button } from "../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { cn } from "../../utils";
import { useDataTableContext } from "./DataTable";
import type { DataTableColumnMeta } from "./DataTableColumnHeader";
import {
  dataTableTopperButtonProps,
  dataTableTopperIconClasses,
  dataTableTopperOpenStateClasses,
} from "./data-table-styles";

export interface DataTableViewOptionsProps<TData> {
  /** TanStack Table instance */
  table: Table<TData>;
}

/**
 * Get the display label for a column.
 * Priority: meta.displayName > header string > column id
 */
function getColumnDisplayName<TData>(
  column: ReturnType<Table<TData>["getAllColumns"]>[number],
): string {
  // Check for displayName in column meta
  const meta = column.columnDef.meta as DataTableColumnMeta | undefined;
  if (meta?.displayName) {
    return meta.displayName;
  }

  // Fall back to header string if it exists
  if (typeof column.columnDef.header === "string") {
    return column.columnDef.header;
  }

  // Last resort: use column id
  return column.id;
}

/**
 * Column visibility toggle dropdown with drag-and-drop reordering.
 * Allows users to show/hide columns and reorder them in the table.
 *
 * Uses column.meta.displayName for friendly names when available.
 *
 * @example
 * ```tsx
 * // In your column definition:
 * {
 *   id: "createdAt",
 *   header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
 *   meta: {
 *     displayName: "Created Date",
 *   },
 * }
 * ```
 */
export function DataTableViewOptions<TData>({
  table,
}: DataTableViewOptionsProps<TData>) {
  const context = useDataTableContext();
  const fontSizeClass = context?.fontSizeClass ?? "text-xs";

  const [draggedId, setDraggedId] = React.useState<string | null>(null);
  const [dragOverId, setDragOverId] = React.useState<string | null>(null);

  const columns = React.useMemo(
    () =>
      table
        .getAllColumns()
        .filter(
          (column) =>
            typeof column.accessorFn !== "undefined" && column.getCanHide(),
        ),
    [table],
  );

  // Get current column order
  const columnOrder = table.getState().columnOrder;
  const orderedColumns = React.useMemo(() => {
    if (!columnOrder || columnOrder.length === 0) {
      return columns;
    }
    // Sort columns by their position in columnOrder
    return [...columns].sort((a, b) => {
      const aIndex = columnOrder.indexOf(a.id);
      const bIndex = columnOrder.indexOf(b.id);
      // If not in order, put at end
      if (aIndex === -1 && bIndex === -1) return 0;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
  }, [columns, columnOrder]);

  const handleDragStart = (e: React.DragEvent, columnId: string) => {
    setDraggedId(columnId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", columnId);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    if (draggedId && draggedId !== columnId) {
      setDragOverId(columnId);
    }
  };

  const handleDragLeave = () => {
    setDragOverId(null);
  };

  const handleDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetColumnId) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    // Get all column IDs in current order
    const allColumnIds = table.getAllColumns().map((c) => c.id);
    const currentOrder =
      columnOrder && columnOrder.length > 0
        ? [...columnOrder]
        : [...allColumnIds];

    // Find indices
    const draggedIndex = currentOrder.indexOf(draggedId);
    const targetIndex = currentOrder.indexOf(targetColumnId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    // Remove dragged item and insert at target position
    currentOrder.splice(draggedIndex, 1);
    currentOrder.splice(targetIndex, 0, draggedId);

    // Update table column order
    table.setColumnOrder(currentOrder);

    setDraggedId(null);
    setDragOverId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          {...dataTableTopperButtonProps}
          aria-label="View columns"
          className={dataTableTopperOpenStateClasses}
        >
          <Settings2 className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel
          className={cn("font-normal text-muted-foreground", fontSizeClass)}
        >
          View Columns
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {/* biome-ignore lint/a11y/useSemanticElements: Using div with role for dropdown menu compatibility */}
        <div role="list" className="max-h-64 overflow-y-auto">
          {orderedColumns.map((column) => {
            const label = getColumnDisplayName(column);
            const isVisible = column.getIsVisible();
            const isDragging = draggedId === column.id;
            const isDragOver = dragOverId === column.id;

            return (
              // biome-ignore lint/a11y/useSemanticElements: Using div with role for dropdown menu compatibility
              <div
                key={column.id}
                role="listitem"
                draggable
                onDragStart={(e) => handleDragStart(e, column.id)}
                onDragOver={(e) => handleDragOver(e, column.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, column.id)}
                onDragEnd={handleDragEnd}
                className={cn(
                  "flex items-center gap-2 px-2 py-1.5 rounded-sm cursor-default",
                  fontSizeClass,
                  "hover:bg-accent hover:text-accent-foreground",
                  isDragging && "opacity-50",
                  isDragOver && "bg-accent/50",
                )}
              >
                {/* Drag handle */}
                <div
                  className={cn(
                    "flex items-center justify-center size-5 cursor-grab active:cursor-grabbing shrink-0",
                    dataTableTopperIconClasses,
                  )}
                >
                  <GripVertical className="size-3.5" />
                </div>

                {/* Column label */}
                <span
                  className={cn(
                    "flex-1",
                    !isVisible && "text-muted-foreground",
                  )}
                >
                  {label}
                </span>

                {/* Eye icon toggle */}
                <button
                  type="button"
                  onClick={() => column.toggleVisibility(!isVisible)}
                  className={cn(
                    "flex items-center justify-center size-5 rounded-sm shrink-0",
                    dataTableTopperIconClasses,
                  )}
                  aria-label={isVisible ? "Hide column" : "Show column"}
                >
                  {isVisible ? (
                    <Eye className="size-3.5" />
                  ) : (
                    <EyeOff className="size-3.5" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
