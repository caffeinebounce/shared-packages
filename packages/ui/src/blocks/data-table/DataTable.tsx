"use client";

import {
  type ColumnDef,
  flexRender,
  type Table as TanStackTable,
} from "@tanstack/react-table";
import type * as React from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { cn } from "../../utils";

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
  className,
  children,
  ...props
}: DataTableProps<TData, TValue>) {
  return (
    <div
      className={cn("flex w-full flex-col gap-2.5 overflow-auto", className)}
      {...props}
    >
      {children}
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    style={{
                      width:
                        header.getSize() !== 150 ? header.getSize() : undefined,
                    }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
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
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
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
