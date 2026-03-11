import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

export interface DealTerm {
  label: string;
  value: string;
  highlight?: boolean;
}

export interface DealTermsTableProps {
  terms: DealTerm[];
}

const columnHelper = createColumnHelper<DealTerm>();

const columns = [
  columnHelper.accessor("label", {
    header: () => null,
    cell: (info) => (
      <span style={{ fontWeight: 700, color: "#1B1B1B" }}>
        {info.getValue()}
      </span>
    ),
  }),
  columnHelper.accessor("value", {
    header: () => null,
    cell: (info) => {
      const highlight = info.row.original.highlight;
      return (
        <span style={{ fontWeight: highlight ? 700 : 400, color: "#1B1B1B" }}>
          {info.getValue()}
        </span>
      );
    },
  }),
];

export function DealTermsTable({ terms }: DealTermsTableProps) {
  const table = useReactTable({
    data: terms,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
        fontFamily: "Inter, sans-serif",
        fontSize: "0.95em",
      }}
    >
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <td
                key={cell.id}
                style={{
                  padding: "0.75em 0.5em",
                  borderBottom: "1px solid #E5E5E5",
                  backgroundColor: "#FFFFFF",
                }}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
