"use client";

import type { Table } from "@tanstack/react-table";
import { Settings2 } from "lucide-react";
import * as React from "react";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import type { DataTableColumnMeta } from "./DataTableColumnHeader";

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
 * Column visibility toggle dropdown.
 * Allows users to show/hide columns in the table.
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Toggle columns"
          className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
        >
          <Settings2 className="size-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {columns.map((column) => {
          const label = getColumnDisplayName(column);
          return (
            <DropdownMenuCheckboxItem
              key={column.id}
              checked={column.getIsVisible()}
              onCheckedChange={(value) => column.toggleVisibility(!!value)}
            >
              {label}
            </DropdownMenuCheckboxItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
