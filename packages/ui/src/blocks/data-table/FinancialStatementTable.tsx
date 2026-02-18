"use client";

import type { ColumnDef, ExpandedState, VisibilityState } from "@tanstack/react-table";
import {
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { BookOpen, Calendar, DollarSign } from "lucide-react";
import * as React from "react";

import { DataTable } from "./DataTable";
import { DataTableColumnHeader } from "./DataTableColumnHeader";
import type { DataTableColumnMeta } from "./DataTableColumnHeader";
import { DataTableCurrencyCell } from "./DataTableCurrencyCell";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface FinancialStatementEntry {
  /** Period start date (YYYY-MM-DD) */
  period_first_day: string;
  /** Account identifier */
  account_id: string;
  /** Account display name */
  account_name: string;
  /** Account number (e.g. "4000") */
  account_number: string | null;
  /** High-level classification: "Revenue" | "Expense" | "Asset" | "Liability" | "Equity" */
  account_class: string;
  /** Amount for this period */
  amount: number;
}

export type TimeUnit = "month" | "quarter" | "year";

export interface FinancialStatementSection {
  /** Section ID */
  id: string;
  /** Display label (e.g. "Revenue", "Expenses") */
  label: string;
  /** Which account_class values belong to this section */
  accountClasses: string[];
  /** Sign multiplier for totals (1 for revenue, -1 if you want to flip expenses) */
  sign?: number;
}

export interface FinancialStatementTotal {
  /** Display label (e.g. "Net Income", "Gross Profit") */
  label: string;
  /** Section IDs to sum. Prefix with "-" to subtract. e.g. ["section-revenue", "-section-expense"] */
  formula: string[];
}

export interface FinancialStatementConfig {
  /** Sections to display (in order) */
  sections: FinancialStatementSection[];
  /** Computed total rows to display after sections */
  totals: FinancialStatementTotal[];
}

export interface FinancialStatementTableProps {
  /** Raw data entries */
  data: FinancialStatementEntry[];
  /** Time unit for period columns */
  timeUnit: TimeUnit;
  /** Statement structure configuration */
  config: FinancialStatementConfig;
  /** Show account numbers in first column */
  showAccountNumbers?: boolean;
  /** Tree indent in px */
  treeIndentPx?: number;
  /** Additional class name */
  className?: string;
}

// ── Internal row type ─────────────────────────────────────────────────────────

type RowType = "section" | "account" | "total";

interface StatementRow {
  _type: RowType;
  id: string;
  name: string;
  accountNumber: string | null;
  periodAmounts: Record<string, number>;
  total: number;
  children: StatementRow[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function toPeriodKey(date: string, unit: TimeUnit): string {
  const d = new Date(date);
  if (unit === "year") return String(d.getFullYear());
  if (unit === "quarter") {
    const q = Math.floor(d.getMonth() / 3) + 1;
    return `${d.getFullYear()}-Q${q}`;
  }
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function toPeriodLabel(key: string, unit: TimeUnit): string {
  if (unit === "year") return key;
  if (unit === "quarter") return key.replace("-", " ");
  const [year, month] = key.split("-");
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

// ── Data builder ──────────────────────────────────────────────────────────────

export function buildFinancialStatementData(
  data: FinancialStatementEntry[],
  config: FinancialStatementConfig,
  timeUnit: TimeUnit,
): { rows: StatementRow[]; periods: string[] } {
  // Get all period keys
  const periodSet = new Set<string>();
  for (const entry of data) {
    periodSet.add(toPeriodKey(entry.period_first_day, timeUnit));
  }
  const periods = [...periodSet].sort();

  // Build section rows
  const sectionMap = new Map<string, StatementRow>();
  const rows: StatementRow[] = [];

  for (const section of config.sections) {
    const classSet = new Set(section.accountClasses);
    const sign = section.sign ?? 1;

    // Aggregate by account
    const accountMap = new Map<
      string,
      { name: string; number: string | null; periods: Record<string, number>; total: number }
    >();

    for (const entry of data) {
      if (!classSet.has(entry.account_class)) continue;
      if (entry.amount === 0) continue;

      const pk = toPeriodKey(entry.period_first_day, timeUnit);
      if (!accountMap.has(entry.account_id)) {
        accountMap.set(entry.account_id, {
          name: entry.account_name,
          number: entry.account_number,
          periods: {},
          total: 0,
        });
      }
      const acct = accountMap.get(entry.account_id)!;
      acct.periods[pk] = (acct.periods[pk] || 0) + entry.amount * sign;
      acct.total += entry.amount * sign;
    }

    // Build account rows, skip zero-total accounts
    const accountRows: StatementRow[] = [...accountMap.entries()]
      .filter(([, a]) => Math.abs(a.total) >= 0.01)
      .sort(([, a], [, b]) => (a.number ?? "").localeCompare(b.number ?? ""))
      .map(([id, a]) => ({
        _type: "account" as RowType,
        id,
        name: a.name,
        accountNumber: a.number,
        periodAmounts: a.periods,
        total: a.total,
        children: [],
      }));

    if (accountRows.length === 0) continue;

    // Section totals
    const sectionPeriods: Record<string, number> = {};
    for (const acct of accountRows) {
      for (const [pk, amt] of Object.entries(acct.periodAmounts)) {
        sectionPeriods[pk] = (sectionPeriods[pk] || 0) + amt;
      }
    }
    const sectionTotal = accountRows.reduce((s, r) => s + r.total, 0);

    const sectionRow: StatementRow = {
      _type: "section",
      id: section.id,
      name: section.label,
      accountNumber: null,
      periodAmounts: sectionPeriods,
      total: sectionTotal,
      children: accountRows,
    };

    sectionMap.set(section.id, sectionRow);
    rows.push(sectionRow);
  }

  // Computed totals
  for (const total of config.totals) {
    const totalPeriods: Record<string, number> = {};
    let totalAmount = 0;

    for (const ref of total.formula) {
      const subtract = ref.startsWith("-");
      const sectionId = subtract ? ref.slice(1) : ref;
      const section = sectionMap.get(sectionId);
      if (!section) continue;

      const mult = subtract ? -1 : 1;
      totalAmount += section.total * mult;
      for (const pk of periods) {
        totalPeriods[pk] = (totalPeriods[pk] || 0) + (section.periodAmounts[pk] || 0) * mult;
      }
    }

    rows.push({
      _type: "total",
      id: `total-${total.label.toLowerCase().replace(/\s+/g, "-")}`,
      name: total.label,
      accountNumber: null,
      periodAmounts: totalPeriods,
      total: totalAmount,
      children: [],
    });
  }

  return { rows, periods };
}

// ── Column builder ────────────────────────────────────────────────────────────

function buildColumns(
  periods: string[],
  unit: TimeUnit,
  showAccountNumbers: boolean,
): ColumnDef<StatementRow>[] {
  const cols: ColumnDef<StatementRow>[] = [
    {
      id: "account",
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Account" />
      ),
      meta: { displayName: "Account", icon: BookOpen } satisfies DataTableColumnMeta,
      cell: ({ row }) => {
        const r = row.original;
        if (r._type === "section") {
          return (
            <span className="font-semibold tracking-wide">
              {r.name}
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                ({r.children.length})
              </span>
            </span>
          );
        }
        if (r._type === "total") {
          return <span className="font-bold">{r.name}</span>;
        }
        return (
          <span>
            {showAccountNumbers && r.accountNumber && (
              <span className="font-mono text-muted-foreground mr-1.5">
                {r.accountNumber}
              </span>
            )}
            {r.name}
          </span>
        );
      },
      enableSorting: false,
      size: 280,
      minSize: 200,
    },
  ];

  for (const pk of periods) {
    const label = toPeriodLabel(pk, unit);
    cols.push({
      id: `period-${pk}`,
      accessorFn: (row) => row.periodAmounts[pk] ?? 0,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={label} />
      ),
      meta: { displayName: label, icon: Calendar, align: "right" } satisfies DataTableColumnMeta,
      cell: ({ row }) => {
        const r = row.original;
        const val = r.periodAmounts[pk] ?? 0;
        const weight =
          r._type === "total" ? "font-bold" : r._type === "section" ? "font-semibold" : "";
        return (
          <span className={weight}>
            <DataTableCurrencyCell value={val} dashZero />
          </span>
        );
      },
      enableSorting: false,
      size: 110,
      minSize: 80,
    });
  }

  cols.push({
    id: "total",
    accessorFn: (row) => row.total,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total" />
    ),
    meta: { displayName: "Total", icon: DollarSign, align: "right" } satisfies DataTableColumnMeta,
    cell: ({ row }) => {
      const r = row.original;
      const weight =
        r._type === "total" ? "font-bold" : r._type === "section" ? "font-semibold" : "";
      return (
        <span className={weight}>
          <DataTableCurrencyCell value={r.total} dashZero />
        </span>
      );
    },
    enableSorting: false,
    size: 120,
    minSize: 90,
  });

  return cols;
}

// ── Row styling ───────────────────────────────────────────────────────────────

function getRowClassName(row: { original: StatementRow }): string | undefined {
  if (row.original._type === "section") return "bg-muted/40";
  if (row.original._type === "total") return "bg-muted/60 border-t-2 border-border";
  return undefined;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Reusable financial statement table component.
 *
 * Renders a tree-structured DataTable with:
 * - Configurable sections (Revenue, Expenses, etc.)
 * - Dynamic period columns (monthly/quarterly/yearly)
 * - Computed total rows (Net Income, Gross Profit, etc.)
 * - Accounting-format currency (brackets for negatives, red)
 *
 * @example
 * ```tsx
 * <FinancialStatementTable
 *   data={entries}
 *   timeUnit="month"
 *   config={{
 *     sections: [
 *       { id: "revenue", label: "Revenue", accountClasses: ["Revenue"] },
 *       { id: "expenses", label: "Expenses", accountClasses: ["Expense"] },
 *     ],
 *     totals: [
 *       { label: "Net Income", formula: ["revenue", "-expenses"] },
 *     ],
 *   }}
 * />
 * ```
 */
export function FinancialStatementTable({
  data,
  timeUnit,
  config,
  showAccountNumbers = true,
  treeIndentPx = 20,
  className,
}: FinancialStatementTableProps) {
  const [expanded, setExpanded] = React.useState<ExpandedState>({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});

  const { rows, periods } = React.useMemo(
    () => buildFinancialStatementData(data, config, timeUnit),
    [data, config, timeUnit],
  );

  const columns = React.useMemo(
    () => buildColumns(periods, timeUnit, showAccountNumbers),
    [periods, timeUnit, showAccountNumbers],
  );

  // Auto-expand sections
  React.useEffect(() => {
    if (rows.length === 0) return;
    const toExpand: Record<string, boolean> = {};
    for (const row of rows) {
      if (row._type === "section") toExpand[row.id] = true;
    }
    setExpanded(toExpand);
  }, [rows]);

  const table = useReactTable({
    data: rows,
    columns,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    getSubRows: (row) => (row.children.length > 0 ? row.children : undefined),
    getExpandedRowModel: getExpandedRowModel(),
    state: { expanded, columnVisibility },
    onExpandedChange: setExpanded,
    onColumnVisibilityChange: setColumnVisibility,
  });

  return (
    <DataTable
      table={table}
      columns={columns}
      enableTreeView
      treeIndentPx={treeIndentPx}
      getRowClassName={getRowClassName as never}
      enableColumnResizing
      density="compact"
      fontSize="sm"
    />
  );
}

// ── Preset configs ────────────────────────────────────────────────────────────

/** Standard income statement (P&L) configuration */
export const INCOME_STATEMENT_CONFIG: FinancialStatementConfig = {
  sections: [
    { id: "revenue", label: "Revenue", accountClasses: ["Revenue"] },
    { id: "expenses", label: "Expenses", accountClasses: ["Expense"] },
  ],
  totals: [{ label: "Net Income", formula: ["revenue", "-expenses"] }],
};

/** Balance sheet configuration */
export const BALANCE_SHEET_CONFIG: FinancialStatementConfig = {
  sections: [
    { id: "assets", label: "Assets", accountClasses: ["Asset"] },
    { id: "liabilities", label: "Liabilities", accountClasses: ["Liability"] },
    { id: "equity", label: "Equity", accountClasses: ["Equity"] },
  ],
  totals: [
    { label: "Total Liabilities & Equity", formula: ["liabilities", "equity"] },
  ],
};
