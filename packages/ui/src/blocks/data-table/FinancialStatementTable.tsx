"use client";

import type {
  ColumnDef,
  ExpandedState,
  VisibilityState,
} from "@tanstack/react-table";
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
  /** Account type (e.g. "Income", "Cost of Goods Sold", "Expense") */
  account_type?: string;
  /** Account sub-type */
  account_sub_type?: string | null;
  /** Whether this account is a child of another */
  is_sub_account?: boolean;
  /** Parent account number */
  parent_account_number?: string | null;
  /** Parent account name */
  parent_account_name?: string | null;
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

type RowType = "section-header" | "account-group" | "account" | "section-total" | "grand-total";

interface StatementRow {
  _type: RowType;
  id: string;
  name: string;
  accountNumber: string | null;
  periodAmounts: Record<string, number>;
  total: number;
  children: StatementRow[];
  /** Depth hint for styling (0 = section header/total, 1+ = accounts) */
  depth: number;
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

/** Sum period amounts from children into a parent record */
function sumChildPeriods(children: StatementRow[]): { periodAmounts: Record<string, number>; total: number } {
  const periodAmounts: Record<string, number> = {};
  let total = 0;
  for (const child of children) {
    total += child.total;
    for (const [pk, amt] of Object.entries(child.periodAmounts)) {
      periodAmounts[pk] = (periodAmounts[pk] || 0) + amt;
    }
  }
  return { periodAmounts, total };
}

// ── Tree builder ──────────────────────────────────────────────────────────────

interface AccountAgg {
  id: string;
  name: string;
  number: string | null;
  type: string;
  subType: string | null;
  isSubAccount: boolean;
  parentNumber: string | null;
  parentName: string | null;
  periods: Record<string, number>;
  total: number;
}

/**
 * Build a tree of accounts within a section, using parent_account_number to
 * establish parent/child relationships — same logic as COA tree.
 */
function buildAccountTree(
  accounts: AccountAgg[],
  sign: number,
): StatementRow[] {
  // Index accounts by account_number for parent lookup
  const byNumber = new Map<string, AccountAgg>();
  for (const a of accounts) {
    if (a.number) byNumber.set(a.number, a);
  }

  // Separate root accounts from sub-accounts
  const roots: AccountAgg[] = [];
  const childrenOf = new Map<string, AccountAgg[]>();

  for (const a of accounts) {
    if (a.isSubAccount && a.parentNumber && byNumber.has(a.parentNumber)) {
      const existing = childrenOf.get(a.parentNumber) || [];
      existing.push(a);
      childrenOf.set(a.parentNumber, existing);
    } else {
      roots.push(a);
    }
  }

  // Recursively build rows
  function buildRow(acct: AccountAgg, depth: number): StatementRow {
    const kids = childrenOf.get(acct.number ?? "") || [];
    const childRows = kids
      .sort((a, b) => (a.number ?? "").localeCompare(b.number ?? ""))
      .map((k) => buildRow(k, depth + 1));

    // If this account has children, its amounts are the sum of itself + children
    // (the data may already include the parent's own amounts, or they may be 0)
    let periodAmounts: Record<string, number> = {};
    let total = 0;

    if (childRows.length > 0) {
      // Parent row = its own amounts + children amounts
      const childSums = sumChildPeriods(childRows);
      total = acct.total * sign + childSums.total;
      for (const pk of Object.keys({ ...acct.periods, ...childSums.periodAmounts })) {
        periodAmounts[pk] = (acct.periods[pk] || 0) * sign + (childSums.periodAmounts[pk] || 0);
      }
    } else {
      // Leaf account — just apply sign
      total = acct.total * sign;
      for (const [pk, amt] of Object.entries(acct.periods)) {
        periodAmounts[pk] = amt * sign;
      }
    }

    return {
      _type: childRows.length > 0 ? "account-group" : "account",
      id: acct.id,
      name: acct.name,
      accountNumber: acct.number,
      periodAmounts,
      total,
      children: childRows,
      depth,
    };
  }

  return roots
    .sort((a, b) => (a.number ?? "").localeCompare(b.number ?? ""))
    .map((r) => buildRow(r, 0));
}

// ── Data builder ──────────────────────────────────────────────────────────────

export function buildFinancialStatementData(
  data: FinancialStatementEntry[],
  config: FinancialStatementConfig,
  timeUnit: TimeUnit,
): { rows: StatementRow[]; periods: string[] } {
  // Collect all period keys
  const periodSet = new Set<string>();
  for (const entry of data) {
    periodSet.add(toPeriodKey(entry.period_first_day, timeUnit));
  }
  const periods = [...periodSet].sort();

  const sectionTotals = new Map<string, { periodAmounts: Record<string, number>; total: number }>();
  const rows: StatementRow[] = [];

  for (const section of config.sections) {
    const classSet = new Set(section.accountClasses);
    const sign = section.sign ?? 1;

    // Aggregate by account
    const accountMap = new Map<string, AccountAgg>();

    for (const entry of data) {
      if (!classSet.has(entry.account_class)) continue;

      const pk = toPeriodKey(entry.period_first_day, timeUnit);
      if (!accountMap.has(entry.account_id)) {
        accountMap.set(entry.account_id, {
          id: entry.account_id,
          name: entry.account_name,
          number: entry.account_number,
          type: entry.account_type ?? "",
          subType: entry.account_sub_type ?? null,
          isSubAccount: entry.is_sub_account ?? false,
          parentNumber: entry.parent_account_number ?? null,
          parentName: entry.parent_account_name ?? null,
          periods: {},
          total: 0,
        });
      }
      const acct = accountMap.get(entry.account_id)!;
      acct.periods[pk] = (acct.periods[pk] || 0) + entry.amount;
      acct.total += entry.amount;
    }

    // Build tree from accounts
    const accountList = [...accountMap.values()];
    const accountTree = buildAccountTree(accountList, sign);

    if (accountTree.length === 0) continue;

    // Calculate section totals from root-level tree rows
    const sectionSums = sumChildPeriods(accountTree);
    sectionTotals.set(section.id, sectionSums);

    // Section header row
    const sectionHeader: StatementRow = {
      _type: "section-header",
      id: `section-${section.id}`,
      name: section.label,
      accountNumber: null,
      periodAmounts: {},
      total: 0,
      children: accountTree,
      depth: 0,
    };

    rows.push(sectionHeader);

    // Section total row (after the tree)
    rows.push({
      _type: "section-total",
      id: `total-${section.id}`,
      name: `Total ${section.label}`,
      accountNumber: null,
      periodAmounts: sectionSums.periodAmounts,
      total: sectionSums.total,
      children: [],
      depth: 0,
    });
  }

  // Computed grand totals
  for (const total of config.totals) {
    const totalPeriods: Record<string, number> = {};
    let totalAmount = 0;

    for (const ref of total.formula) {
      const subtract = ref.startsWith("-");
      const sectionId = subtract ? ref.slice(1) : ref;
      const sums = sectionTotals.get(sectionId);
      if (!sums) continue;

      const mult = subtract ? -1 : 1;
      totalAmount += sums.total * mult;
      for (const pk of periods) {
        totalPeriods[pk] = (totalPeriods[pk] || 0) + (sums.periodAmounts[pk] || 0) * mult;
      }
    }

    rows.push({
      _type: "grand-total",
      id: `grand-total-${total.label.toLowerCase().replace(/\s+/g, "-")}`,
      name: total.label,
      accountNumber: null,
      periodAmounts: totalPeriods,
      total: totalAmount,
      children: [],
      depth: 0,
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
      meta: {
        displayName: "Account",
        icon: BookOpen,
      } satisfies DataTableColumnMeta,
      cell: ({ row }) => {
        const r = row.original;
        if (r._type === "section-header") {
          return (
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {r.name}
            </span>
          );
        }
        if (r._type === "section-total") {
          return <span className="font-semibold">{r.name}</span>;
        }
        if (r._type === "grand-total") {
          return <span className="font-bold text-base">{r.name}</span>;
        }
        if (r._type === "account-group") {
          return (
            <span className="font-medium">
              {showAccountNumbers && r.accountNumber && (
                <span className="font-mono text-muted-foreground mr-1.5 text-xs">
                  {r.accountNumber}
                </span>
              )}
              {r.name}
            </span>
          );
        }
        // Regular account
        return (
          <span>
            {showAccountNumbers && r.accountNumber && (
              <span className="font-mono text-muted-foreground mr-1.5 text-xs">
                {r.accountNumber}
              </span>
            )}
            {r.name}
          </span>
        );
      },
      enableSorting: false,
      size: 300,
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
      meta: {
        displayName: label,
        icon: Calendar,
        align: "right",
      } satisfies DataTableColumnMeta,
      cell: ({ row }) => {
        const r = row.original;
        const val = r.periodAmounts[pk] ?? 0;
        if (r._type === "section-header") return null;
        const bold =
          r._type === "grand-total"
            ? "font-bold"
            : r._type === "section-total" || r._type === "account-group"
              ? "font-semibold"
              : "";
        return (
          <span className={bold}>
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
    meta: {
      displayName: "Total",
      icon: DollarSign,
      align: "right",
    } satisfies DataTableColumnMeta,
    cell: ({ row }) => {
      const r = row.original;
      if (r._type === "section-header") return null;
      const bold =
        r._type === "grand-total"
          ? "font-bold"
          : r._type === "section-total" || r._type === "account-group"
            ? "font-semibold"
            : "";
      return (
        <span className={bold}>
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
  switch (row.original._type) {
    case "section-header":
      return "bg-muted/30 border-b-0";
    case "section-total":
      return "bg-muted/40 border-t border-border font-semibold";
    case "grand-total":
      return "bg-muted/60 border-t-2 border-double border-border";
    case "account-group":
      return undefined;
    default:
      return undefined;
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Reusable financial statement table component.
 *
 * Renders a tree-structured DataTable with:
 * - Sections (Revenue, Expenses) as expandable headers
 * - Parent/child account tree with subtotals at each level
 * - Section totals (Total Revenue, Total Expenses)
 * - Computed grand totals (Net Income, Gross Profit)
 * - Accounting-format currency (brackets for negatives, red)
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
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});

  const { rows, periods } = React.useMemo(
    () => buildFinancialStatementData(data, config, timeUnit),
    [data, config, timeUnit],
  );

  const columns = React.useMemo(
    () => buildColumns(periods, timeUnit, showAccountNumbers),
    [periods, timeUnit, showAccountNumbers],
  );

  // Auto-expand: section headers expanded, account groups expanded 1 level
  React.useEffect(() => {
    if (rows.length === 0) return;
    const toExpand: Record<string, boolean> = {};
    for (const row of rows) {
      if (row._type === "section-header") {
        toExpand[row.id] = true;
        // Also expand top-level account groups within the section
        for (const child of row.children) {
          if (child._type === "account-group") {
            toExpand[child.id] = true;
          }
        }
      }
    }
    setExpanded(toExpand);
  }, [rows]);

  const table = useReactTable({
    data: rows,
    columns,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    getSubRows: (row) =>
      row.children.length > 0 ? row.children : undefined,
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
      enableRowDrag={false}
      rowSelectionStyle="none"
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
    {
      label: "Total Liabilities & Equity",
      formula: ["liabilities", "equity"],
    },
  ],
};
