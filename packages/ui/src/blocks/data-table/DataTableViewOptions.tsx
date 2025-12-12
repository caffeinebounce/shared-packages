"use client";

import type { Table } from "@tanstack/react-table";
import { Settings2 } from "lucide-react";
import * as React from "react";

import { Button } from "../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";

export interface DataTableViewOptionsProps<TData> {
  /** TanStack Table instance */
  table: Table<TData>;
}

/**
 * Column visibility toggle dropdown.
 * Allows users to show/hide columns in the table.
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
        <Button
          aria-label="Toggle columns"
          variant="outline"
          size="sm"
          className="ml-auto hidden h-8 lg:flex"
        >
          <Settings2 className="mr-2 size-4" />
          View
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {columns.map((column) => {
          const label =
            typeof column.columnDef.header === "string"
              ? column.columnDef.header
              : column.id;
          return (
            <DropdownMenuCheckboxItem
              key={column.id}
              className="capitalize"
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
