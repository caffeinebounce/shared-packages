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
import {
  AlertTriangle,
  BookOpen,
  Calendar,
  CheckCircle2,
  DollarSign,
  Info,
  TrendingUp,
} from "lucide-react";
import * as React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../components/ui/tooltip";
import { cn } from "../../utils";
import { DataTable } from "./DataTable";
import type { DataTableColumnMeta } from "./DataTableColumnHeader";
import { DataTableColumnHeader } from "./DataTableColumnHeader";
import {
  DataTableCurrencyCell,
  formatCurrencyValue,
} from "./DataTableCurrencyCell";

// ── Reconciliation check indicator ────────────────────────────────────────────

const TOLERANCE = 0.01; // rounding tolerance

function RecCheck({ computed, raw }: { computed: number; raw: number }) {
  const diff = Math.abs(computed - raw);
  const matches = diff <= TOLERANCE;

  const icon = matches ? (
    <CheckCircle2 className="size-3.5 text-white fill-emerald-500" />
  ) : (
    <AlertTriangle className="size-3.5 text-white fill-amber-500" />
  );

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span>{icon}</span>
        </TooltipTrigger>
        <TooltipContent side="left" className="text-[11px] max-w-none p-2">
          {matches ? (
            <span className="text-emerald-400">
              ✓ Balanced — computed total matches source data
            </span>
          ) : (
            <div className="space-y-1">
              <div className="text-amber-400 font-medium">
                ⚠ Variance detected
              </div>
              <table className="text-[11px]">
                <tbody>
                  <tr>
                    <td className="pr-3 text-muted-foreground">Computed:</td>
                    <td className="font-mono tabular-nums text-right">
                      {formatCurrencyValue(computed, { decimals: 2 }).text}
                    </td>
                  </tr>
                  <tr>
                    <td className="pr-3 text-muted-foreground">Source:</td>
                    <td className="font-mono tabular-nums text-right">
                      {formatCurrencyValue(raw, { decimals: 2 }).text}
                    </td>
                  </tr>
                  <tr className="border-t border-border/40">
                    <td className="pr-3 text-muted-foreground pt-0.5">
                      Variance:
                    </td>
                    <td className="font-mono tabular-nums text-right pt-0.5 text-amber-400">
                      {
                        formatCurrencyValue(computed - raw, { decimals: 2 })
                          .text
                      }
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function MetricEquationTooltip({
  title,
  formula,
}: {
  title: string;
  formula: string;
}) {
  const lines = formula
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const equationLine = lines[0] ?? formula;
  const detailLines = lines.slice(1);

  const [lhs, rhs] = equationLine.split("=").map((part) => part.trim());

  if (!rhs) {
    return <p className="text-xs leading-relaxed">{formula}</p>;
  }

  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-medium text-muted-foreground/90">
        {title}
      </p>
      <div className="rounded-md border border-slate-500/15 bg-gradient-to-r from-slate-500/[0.05] via-sky-500/[0.04] to-emerald-500/[0.05] px-2.5 py-1.5">
        <p className="text-xs font-mono tracking-tight leading-relaxed text-foreground/85">
          <span className="font-semibold text-sky-700/85 dark:text-sky-200/85">
            {lhs}
          </span>
          <span className="px-1 text-muted-foreground/80">=</span>
          <span className="text-emerald-700/85 dark:text-emerald-200/85">
            {rhs}
          </span>
        </p>
      </div>
      {detailLines.length > 0 && (
        <div className="space-y-0.5 rounded-md border border-border/50 bg-muted/30 px-2.5 py-1.5">
          {detailLines.map((line) => (
            <p key={line} className="text-[11px] text-muted-foreground/90">
              {line}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

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
  /** Render entries directly (no section header or section total row) */
  standalone?: boolean;
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

/** Subtotal grouping rule — regex on account_number */
export interface SubtotalRule {
  /** Display label (e.g. "Program", "Opex") */
  label: string;
  /** Regex pattern matched against account_number */
  pattern: string;
  /** Display order (lower = first) */
  order: number;
}

/** Subtotal rules settings (as stored in system_settings) */
export interface SubtotalRulesConfig {
  /** Whether subtotal grouping is enabled */
  enabled: boolean;
  /** Ordered list of regex rules */
  rules: SubtotalRule[];
}

export type PeriodColumnOrder = "oldest-first" | "newest-first";

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
  /** Subtotal grouping rules (regex on account_number) */
  subtotalRules?: SubtotalRulesConfig;
  /** Hide rows where all visible period amounts and total are zero */
  hideZeroRows?: boolean;
  /** Toolbar content rendered above the table (right-aligned) */
  toolbar?: React.ReactNode;
  /** Custom cell renderer for currency amounts — receives row data, period key (null for total), and value */
  renderAmountCell?: (
    row: StatementRow,
    periodKey: string | null,
    value: number,
  ) => React.ReactNode;
  /** Show section header + total rows even when no data exists for that section */
  preserveEmptySections?: boolean;
  /** Show rightmost Total column */
  showSectionTotals?: boolean;
  showRowTotals?: boolean;
  /** Show a variance % column comparing current vs prior period (only when exactly 1 comparison period) */
  showVariance?: boolean;
  /** Number of current period columns (to split current vs comparison in variance calc) */
  currentPeriodCount?: number;
  /** Whether table is rendered in a mobile viewport */
  isMobile?: boolean;
  /** Whether compare mode is enabled in mobile mode */
  mobileCompareEnabled?: boolean;
  /** Optional explicit period order (first to last) for displayed columns */
  periodOrder?: string[];
  /** Global order for period columns when periodOrder is not explicitly provided */
  periodColumnOrder?: PeriodColumnOrder;
  /** Additional class name */
  className?: string;
}

// ── Internal row type ─────────────────────────────────────────────────────────

type RowType =
  | "section-header"
  | "account-group"
  | "account"
  | "section-total"
  | "grand-total"
  | "subtotal-group"
  | "subtotal-total";

export interface StatementRow {
  _type: RowType;
  id: string;
  name: string;
  accountNumber: string | null;
  accountType?: string;
  accountSubType?: string | null;
  periodAmounts: Record<string, number>;
  total: number;
  children: StatementRow[];
  /** Depth hint for styling (0 = section header/total, 1+ = accounts) */
  depth: number;
  /** Independent raw sum from source data (for reconciliation on total rows) */
  _rawPeriodAmounts?: Record<string, number>;
  _rawTotal?: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function toPeriodKey(date: string, unit: TimeUnit): string {
  // Parse as local date parts to avoid UTC offset shifting months
  const [y, m] = date.split("-").map(Number);
  if (unit === "year") return String(y);
  if (unit === "quarter") {
    const q = Math.floor((m - 1) / 3) + 1;
    return `${y}-Q${q}`;
  }
  return `${y}-${String(m).padStart(2, "0")}`;
}

export function resolvePeriodColumns(
  periods: string[],
  timeUnit: TimeUnit,
  periodOrder?: string[],
  periodColumnOrder: PeriodColumnOrder = "oldest-first",
): string[] {
  const basePeriods =
    periodColumnOrder === "newest-first" ? [...periods].reverse() : periods;

  if (!periodOrder || periodOrder.length === 0) return basePeriods;

  const normalizedOrder = periodOrder.map((pk) => toPeriodKey(pk, timeUnit));
  const periodSet = new Set(basePeriods);
  const prioritized = Array.from(new Set(normalizedOrder)).filter((pk) =>
    periodSet.has(pk),
  );
  const remainder = basePeriods.filter((pk) => !prioritized.includes(pk));
  return [...prioritized, ...remainder];
}

interface DesktopSizingInput {
  periods: string[];
  rows: StatementRow[];
  showRowTotals: boolean;
  showVariance: boolean;
}

interface DesktopSizingResult {
  accountSize: number;
  accountMinSize: number;
  dataSize: number;
  dataMinSize: number;
  totalSize: number;
}

export function calculateDesktopFinancialColumnSizing({
  periods,
  rows,
  showRowTotals,
  showVariance,
}: DesktopSizingInput): DesktopSizingResult {
  const MIN_ACCOUNT = 260;
  const MIN_DATA = 88;
  const MIN_TOTAL = 96;
  const VARIANCE_COL = showVariance ? 80 : 0;
  const TARGET_TABLE_WIDTH = 1180;

  let maxNumericChars = 1;
  for (const row of rows) {
    for (const pk of periods) {
      maxNumericChars = Math.max(
        maxNumericChars,
        Math.round(Math.abs(row.periodAmounts[pk] ?? 0)).toLocaleString()
          .length,
      );
    }
    maxNumericChars = Math.max(
      maxNumericChars,
      Math.round(Math.abs(row.total ?? 0)).toLocaleString().length,
    );
  }

  let dataSize = Math.min(156, Math.max(104, maxNumericChars * 9 + 26));
  let totalSize = Math.max(MIN_TOTAL, dataSize + 8);
  let accountSize = Math.max(340, 620 - periods.length * 26);

  let tableWidth =
    accountSize +
    periods.length * dataSize +
    (showRowTotals ? totalSize : 0) +
    VARIANCE_COL;

  if (tableWidth > TARGET_TABLE_WIDTH) {
    const reducibleAccount = accountSize - MIN_ACCOUNT;
    const needed = tableWidth - TARGET_TABLE_WIDTH;
    const reduceAccount = Math.min(reducibleAccount, needed);
    accountSize -= reduceAccount;
    tableWidth -= reduceAccount;
  }

  if (tableWidth > TARGET_TABLE_WIDTH && periods.length > 0) {
    const reducibleDataPerCol = Math.max(0, dataSize - MIN_DATA);
    const totalReducible = reducibleDataPerCol * periods.length;
    const needed = tableWidth - TARGET_TABLE_WIDTH;
    const reduceTotal = Math.min(totalReducible, needed);
    const perCol = Math.floor(reduceTotal / periods.length);
    dataSize = Math.max(MIN_DATA, dataSize - perCol);
    if (showRowTotals) {
      totalSize = Math.max(MIN_TOTAL, totalSize - Math.ceil(perCol * 0.9));
    }
  }

  return {
    accountSize,
    accountMinSize: MIN_ACCOUNT,
    dataSize,
    dataMinSize: MIN_DATA,
    totalSize,
  };
}

function toPeriodLabel(key: string, unit: TimeUnit): string {
  if (unit === "year") return key;
  if (unit === "quarter") return key.replace("-", " ");
  const [year, month] = key.split("-");
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

/** Sum period amounts from children into a parent record */
function sumChildPeriods(children: StatementRow[]): {
  periodAmounts: Record<string, number>;
  total: number;
} {
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

  // Create synthetic parents for referenced-but-missing parent accounts
  // (QuickBooks often omits zero-amount parent accounts from the P&L)
  // Build a name→number index for parent resolution via colon-delimited QB paths
  const nameToNumber = new Map<string, string>();
  for (const a of accounts) {
    if (a.number && a.name) nameToNumber.set(a.name, a.number);
  }

  // First pass: collect all missing parents
  const synthetics: AccountAgg[] = [];
  for (const a of accounts) {
    if (
      a.isSubAccount &&
      a.parentNumber &&
      a.parentNumber !== a.number &&
      !byNumber.has(a.parentNumber)
    ) {
      const parentName = a.parentName ?? a.name;
      const synthetic: AccountAgg = {
        id: `synthetic-${a.parentNumber}`,
        name: parentName,
        number: a.parentNumber,
        type: a.type,
        subType: a.subType,
        isSubAccount: false,
        parentNumber: null,
        parentName: null,
        periods: {},
        total: 0,
      };
      byNumber.set(a.parentNumber, synthetic);
      nameToNumber.set(parentName, a.parentNumber);
      synthetics.push(synthetic);
    }
  }

  // Second pass: resolve parent linkage for synthetics using QBO colon-delimited paths
  // e.g. "Grants & Program-Related Expenses:Program Delivery" → grandparent is "Grants & Program-Related Expenses"
  for (const s of synthetics) {
    const lastColon = s.name.lastIndexOf(":");
    if (lastColon > 0) {
      const grandparentPath = s.name.substring(0, lastColon);
      const gpNumber = nameToNumber.get(grandparentPath);
      if (gpNumber && gpNumber !== s.number) {
        s.isSubAccount = true;
        s.parentNumber = gpNumber;
        s.parentName = grandparentPath;
      }
    }
  }

  // Add synthetics to accounts array
  for (const s of synthetics) {
    accounts.push(s);
  }

  // Separate root accounts from sub-accounts
  const roots: AccountAgg[] = [];
  const childrenOf = new Map<string, AccountAgg[]>();

  for (const a of accounts) {
    if (
      a.isSubAccount &&
      a.parentNumber &&
      a.parentNumber !== a.number &&
      byNumber.has(a.parentNumber)
    ) {
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
    const periodAmounts: Record<string, number> = {};
    let total = 0;

    if (childRows.length > 0) {
      // Parent row = its own amounts + children amounts
      const childSums = sumChildPeriods(childRows);
      total = acct.total * sign + childSums.total;
      for (const pk of Object.keys({
        ...acct.periods,
        ...childSums.periodAmounts,
      })) {
        periodAmounts[pk] =
          (acct.periods[pk] || 0) * sign + (childSums.periodAmounts[pk] || 0);
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
      name: acct.name.includes(":")
        ? acct.name.substring(acct.name.lastIndexOf(":") + 1)
        : acct.name,
      accountNumber: acct.number,
      accountType: acct.type,
      accountSubType: acct.subType,
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

/**
 * Apply subtotal rules to partition account tree rows into named groups.
 * Each rule is a regex on account_number. Unmatched accounts go to "Other".
 * Returns an array of subtotal-group rows wrapping the original account rows.
 */
function applySubtotalRules(
  accountTree: StatementRow[],
  rules: SubtotalRule[],
  sectionId: string,
): StatementRow[] {
  // Sort rules by order
  const sortedRules = [...rules].sort((a, b) => a.order - b.order);

  // Compile regexes
  const compiled = sortedRules.map((r) => ({
    rule: r,
    regex: new RegExp(r.pattern),
  }));

  // Partition accounts into groups
  const groups = new Map<string, StatementRow[]>();
  const unmatched: StatementRow[] = [];

  // Initialize groups in order
  for (const r of sortedRules) {
    groups.set(r.label, []);
  }

  // Helper: get the "root" account number for matching
  // For account-group rows, use their own accountNumber
  // For account rows, use their own accountNumber
  function matchRow(row: StatementRow): string | null {
    // Match against this row's account number
    for (const { rule, regex } of compiled) {
      if (row.accountNumber && regex.test(row.accountNumber)) {
        return rule.label;
      }
    }
    return null;
  }

  let anyMatched = false;

  for (const row of accountTree) {
    const groupLabel = matchRow(row);
    if (groupLabel) {
      groups.get(groupLabel)!.push(row);
      anyMatched = true;
    } else {
      unmatched.push(row);
    }
  }

  // If no rules matched any accounts in this section, return the tree as-is
  // (don't wrap unrelated sections in an "Other" group)
  if (!anyMatched) {
    return accountTree;
  }

  // Build subtotal-group rows
  const result: StatementRow[] = [];

  for (const rule of sortedRules) {
    const groupRows = groups.get(rule.label) ?? [];
    if (groupRows.length === 0) continue;

    const sums = sumChildPeriods(groupRows);

    result.push({
      _type: "subtotal-group",
      id: `subtotal-${sectionId}-${rule.label.toLowerCase().replace(/\s+/g, "-")}`,
      name: rule.label,
      accountNumber: null,
      periodAmounts: sums.periodAmounts,
      total: sums.total,
      children: groupRows,
      depth: 0,
    });
  }

  // "Other" group for unmatched (only within sections that have matches)
  if (unmatched.length > 0) {
    const sums = sumChildPeriods(unmatched);
    result.push({
      _type: "subtotal-group",
      id: `subtotal-${sectionId}-other`,
      name: "Other",
      accountNumber: null,
      periodAmounts: sums.periodAmounts,
      total: sums.total,
      children: unmatched,
      depth: 0,
    });
  }

  return result;
}

/**
 * Recursively filter out LEAF rows where all period amounts and total are zero.
 * Only leaf accounts (no children) are candidates for removal.
 * Parent rows, section headers, and structural rows are always preserved.
 */
function filterZeroRows(rows: StatementRow[]): StatementRow[] {
  return rows.reduce<StatementRow[]>((acc, row) => {
    // Structural rows — always keep
    if (
      row._type === "section-header" ||
      row._type === "section-total" ||
      row._type === "grand-total"
    ) {
      if (row.children.length > 0) {
        acc.push({ ...row, children: filterZeroRows(row.children) });
      } else {
        acc.push(row);
      }
      return acc;
    }

    // Any row with children — keep if children survive or row itself has amounts
    if (row.children.length > 0) {
      const filteredChildren = filterZeroRows(row.children);
      if (filteredChildren.length === 0) {
        // All children were zero — check if the parent itself has non-zero amounts
        const parentIsZero =
          row.total === 0 &&
          Object.values(row.periodAmounts).every((v) => v === 0);
        if (parentIsZero) return acc; // Drop empty group with zero amounts
        // Parent has its own amounts — keep as leaf
        acc.push({ ...row, children: [] });
        return acc;
      }
      if (row._type === "subtotal-group") {
        const sums = sumChildPeriods(filteredChildren);
        acc.push({
          ...row,
          children: filteredChildren,
          periodAmounts: sums.periodAmounts,
          total: sums.total,
        });
      } else {
        acc.push({ ...row, children: filteredChildren });
      }
      return acc;
    }

    // Leaf accounts only — skip if all zeros
    const isZero =
      row.total === 0 && Object.values(row.periodAmounts).every((v) => v === 0);
    if (!isZero) {
      acc.push(row);
    }
    return acc;
  }, []);
}

export function buildFinancialStatementData(
  data: FinancialStatementEntry[],
  config: FinancialStatementConfig,
  timeUnit: TimeUnit,
  subtotalRules?: SubtotalRulesConfig,
  options?: { preserveEmptySections?: boolean },
): { rows: StatementRow[]; periods: string[] } {
  // Collect all period keys
  const periodSet = new Set<string>();
  for (const entry of data) {
    periodSet.add(toPeriodKey(entry.period_first_day, timeUnit));
  }
  const periods = [...periodSet].sort();

  const sectionTotals = new Map<
    string,
    { periodAmounts: Record<string, number>; total: number }
  >();
  // Independent raw sums — computed directly from source data, no tree involved
  const sectionRawTotals = new Map<
    string,
    { periodAmounts: Record<string, number>; total: number }
  >();
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

    // Independent raw sum: sum entry.amount directly, no tree, no parent/child
    const rawPeriods: Record<string, number> = {};
    let rawTotal = 0;
    for (const entry of data) {
      if (!classSet.has(entry.account_class)) continue;
      const pk = toPeriodKey(entry.period_first_day, timeUnit);
      const val = entry.amount * sign;
      rawPeriods[pk] = (rawPeriods[pk] || 0) + val;
      rawTotal += val;
    }
    sectionRawTotals.set(section.id, {
      periodAmounts: rawPeriods,
      total: rawTotal,
    });

    // Build tree from accounts
    const accountList = [...accountMap.values()];
    const accountTree = buildAccountTree(accountList, sign);

    if (accountTree.length === 0 && !options?.preserveEmptySections) continue;

    // Apply subtotal rules if enabled — wraps account tree in subtotal-group rows
    const useSubtotals =
      subtotalRules?.enabled && subtotalRules.rules.length > 0;
    const sectionChildren = useSubtotals
      ? applySubtotalRules(accountTree, subtotalRules!.rules, section.id)
      : accountTree;

    // Calculate section totals from root-level tree rows (use original accountTree, not grouped)
    const sectionSums = sumChildPeriods(accountTree);
    sectionTotals.set(section.id, sectionSums);

    if (section.standalone) {
      const normalizeDepth = (items: StatementRow[]): StatementRow[] =>
        items.map((item) => ({
          ...item,
          depth: Math.max(0, item.depth - 1),
          children: normalizeDepth(item.children),
        }));

      rows.push(...normalizeDepth(sectionChildren));
      continue;
    }

    // Section header row
    const sectionHeader: StatementRow = {
      _type: "section-header",
      id: `section-${section.id}`,
      name: section.label,
      accountNumber: null,
      periodAmounts: {},
      total: 0,
      children: sectionChildren,
      depth: 0,
    };

    rows.push(sectionHeader);

    // Section total row (after the tree)
    const rawSums = sectionRawTotals.get(section.id);
    rows.push({
      _type: "section-total",
      id: `total-${section.id}`,
      name: `Total ${section.label}`,
      accountNumber: null,
      periodAmounts: sectionSums.periodAmounts,
      total: sectionSums.total,
      children: [],
      depth: 0,
      _rawPeriodAmounts: rawSums?.periodAmounts,
      _rawTotal: rawSums?.total,
    });
  }

  // Computed grand totals
  for (const total of config.totals) {
    const totalPeriods: Record<string, number> = {};
    let totalAmount = 0;
    const rawTotalPeriods: Record<string, number> = {};
    let rawTotalAmount = 0;

    for (const ref of total.formula) {
      const subtract = ref.startsWith("-");
      const sectionId = subtract ? ref.slice(1) : ref;
      const sums = sectionTotals.get(sectionId);
      const rawSums = sectionRawTotals.get(sectionId);
      if (!sums) continue;

      const mult = subtract ? -1 : 1;
      totalAmount += sums.total * mult;
      rawTotalAmount += (rawSums?.total ?? 0) * mult;
      for (const pk of periods) {
        totalPeriods[pk] =
          (totalPeriods[pk] || 0) + (sums.periodAmounts[pk] || 0) * mult;
        rawTotalPeriods[pk] =
          (rawTotalPeriods[pk] || 0) + (rawSums?.periodAmounts[pk] || 0) * mult;
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
      _rawPeriodAmounts: rawTotalPeriods,
      _rawTotal: rawTotalAmount,
    });
  }

  return { rows, periods };
}

// ── Column builder ────────────────────────────────────────────────────────────

function buildColumns(
  periods: string[],
  unit: TimeUnit,
  rows: StatementRow[],
  showAccountNumbers: boolean,
  renderAmountCell?: (
    row: StatementRow,
    periodKey: string | null,
    value: number,
  ) => React.ReactNode,
  showRowTotals = true,
  showVariance?: boolean,
  currentPeriodCount?: number,
  isMobile = false,
  mobileCompareEnabled = false,
): ColumnDef<StatementRow>[] {
  const desktopSizing = calculateDesktopFinancialColumnSizing({
    periods,
    rows,
    showRowTotals,
    showVariance: Boolean(showVariance),
  });

  const compactMobileAccount = isMobile && periods.length <= 1;

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
        allowHorizontalScroll: isMobile && mobileCompareEnabled,
      } satisfies DataTableColumnMeta & { allowHorizontalScroll?: boolean },
      cell: ({ row }) => {
        const r = row.original;
        if (r._type === "section-header") {
          return (
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {r.name}
            </span>
          );
        }
        if (r._type === "subtotal-group") {
          return <span className="font-semibold">{r.name}</span>;
        }
        if (r._type === "section-total" || r._type === "subtotal-total") {
          return <span className="font-semibold">{r.name}</span>;
        }
        if (r._type === "grand-total") {
          return <span className="font-bold">{r.name}</span>;
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
          <span className="inline-flex items-center gap-1.5">
            <span>
              {showAccountNumbers && r.accountNumber && (
                <span className="font-mono text-muted-foreground mr-1.5 text-xs">
                  {r.accountNumber}
                </span>
              )}
              {r.name}
            </span>
            {r.accountType === "metric" && r.accountSubType && (
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="text-muted-foreground/70 hover:text-foreground transition-colors"
                      aria-label={`${r.name} metric details`}
                    >
                      <Info className="h-3.5 w-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[340px] text-xs">
                    <MetricEquationTooltip
                      title={r.name}
                      formula={r.accountSubType}
                    />
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </span>
        );
      },
      enableSorting: false,
      // Mobile compare mode: keep Account as the flexible column.
      size: isMobile
        ? mobileCompareEnabled || compactMobileAccount
          ? 180
          : 260
        : desktopSizing.accountSize,
      minSize: isMobile
        ? mobileCompareEnabled || compactMobileAccount
          ? 120
          : 200
        : desktopSizing.accountMinSize,
      maxSize:
        isMobile && !(mobileCompareEnabled || compactMobileAccount)
          ? 320
          : undefined,
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
        const isTotalRow =
          r._type === "section-total" || r._type === "grand-total";
        const bold =
          r._type === "grand-total"
            ? "font-bold"
            : r._type === "section-total" ||
                r._type === "subtotal-total" ||
                r._type === "account-group" ||
                r._type === "subtotal-group"
              ? "font-semibold"
              : "";
        // Use custom renderer when provided (caller can enforce metric/non-currency semantics).
        if (renderAmountCell) {
          return <span className={bold}>{renderAmountCell(r, pk, val)}</span>;
        }
        const rawVal = isTotalRow ? r._rawPeriodAmounts?.[pk] : undefined;
        if (isTotalRow && rawVal !== undefined) {
          return (
            <span
              className={cn(
                bold,
                "flex items-center justify-end gap-1.5 group/rec w-full h-full",
              )}
            >
              <span className="opacity-0 group-hover/rec:opacity-100 transition-opacity flex-shrink-0 leading-[0]">
                <RecCheck computed={val} raw={rawVal} />
              </span>
              <span className="leading-none">
                <DataTableCurrencyCell
                  value={val}
                  dashZero
                  isSummaryRow={
                    r._type === "section-total" ||
                    r._type === "grand-total" ||
                    r._type === "subtotal-total"
                  }
                />
              </span>
            </span>
          );
        }
        return (
          <span className={bold}>
            <DataTableCurrencyCell
              value={val}
              dashZero
              isSummaryRow={
                r._type === "section-total" ||
                r._type === "grand-total" ||
                r._type === "subtotal-total"
              }
            />
          </span>
        );
      },
      enableSorting: false,
      // Mobile compare mode: data columns stay readable but can shrink/grow dynamically.
      size: isMobile
        ? mobileCompareEnabled
          ? 96
          : 110
        : desktopSizing.dataSize,
      minSize: isMobile
        ? mobileCompareEnabled
          ? 82
          : 80
        : desktopSizing.dataMinSize,
      maxSize: isMobile && mobileCompareEnabled ? 112 : undefined,
    });
  }

  if (showRowTotals) {
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
        const isTotalRow =
          r._type === "section-total" || r._type === "grand-total";
        const bold =
          r._type === "grand-total"
            ? "font-bold"
            : r._type === "section-total" ||
                r._type === "subtotal-total" ||
                r._type === "account-group" ||
                r._type === "subtotal-group"
              ? "font-semibold"
              : "";
        if (renderAmountCell) {
          return (
            <span className={bold}>{renderAmountCell(r, null, r.total)}</span>
          );
        }
        if (isTotalRow && r._rawTotal !== undefined) {
          return (
            <span
              className={cn(
                bold,
                "flex items-center justify-end gap-1.5 group/rec w-full h-full",
              )}
            >
              <span className="opacity-0 group-hover/rec:opacity-100 transition-opacity flex-shrink-0 leading-[0]">
                <RecCheck computed={r.total} raw={r._rawTotal} />
              </span>
              <span className="leading-none">
                <DataTableCurrencyCell
                  value={r.total}
                  dashZero
                  isSummaryRow={
                    r._type === "section-total" ||
                    r._type === "grand-total" ||
                    r._type === "subtotal-total"
                  }
                />
              </span>
            </span>
          );
        }
        return (
          <span className={bold}>
            <DataTableCurrencyCell
              value={r.total}
              dashZero
              isSummaryRow={
                r._type === "section-total" ||
                r._type === "grand-total" ||
                r._type === "subtotal-total"
              }
            />
          </span>
        );
      },
      enableSorting: false,
      size: isMobile ? 130 : desktopSizing.totalSize,
      minSize: isMobile ? 100 : 96,
    });
  }

  // Variance % column — shown only when comparing a single period
  if (showVariance && currentPeriodCount && currentPeriodCount > 0) {
    const priorPeriods = periods.slice(0, periods.length - currentPeriodCount);
    const currentPeriods = periods.slice(periods.length - currentPeriodCount);

    cols.push({
      id: "variance",
      accessorFn: (row) => {
        const currentSum = currentPeriods.reduce(
          (s, pk) => s + (row.periodAmounts[pk] ?? 0),
          0,
        );
        const priorSum = priorPeriods.reduce(
          (s, pk) => s + (row.periodAmounts[pk] ?? 0),
          0,
        );
        if (priorSum === 0) return currentSum === 0 ? 0 : Infinity;
        return ((currentSum - priorSum) / Math.abs(priorSum)) * 100;
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Δ%" />
      ),
      meta: {
        displayName: "Variance %",
        icon: TrendingUp,
        align: "right",
      } satisfies DataTableColumnMeta,
      cell: ({ row }) => {
        const r = row.original;
        if (r._type === "section-header") return null;
        const currentSum = currentPeriods.reduce(
          (s, pk) => s + (r.periodAmounts[pk] ?? 0),
          0,
        );
        const priorSum = priorPeriods.reduce(
          (s, pk) => s + (r.periodAmounts[pk] ?? 0),
          0,
        );
        if (priorSum === 0 && currentSum === 0)
          return <span className="text-muted-foreground">–</span>;
        if (priorSum === 0)
          return <span className="text-muted-foreground">n/a</span>;
        const pct = ((currentSum - priorSum) / Math.abs(priorSum)) * 100;
        const isPositive = pct > 0;
        const isNegative = pct < 0;
        const bold =
          r._type === "grand-total"
            ? "font-bold"
            : r._type === "section-total" || r._type === "subtotal-total"
              ? "font-semibold"
              : "";
        return (
          <span
            className={cn(
              bold,
              "tabular-nums text-xs",
              isPositive && "text-emerald-500",
              isNegative && "text-red-500",
              !isPositive && !isNegative && "text-muted-foreground",
            )}
          >
            {isPositive ? "+" : ""}
            {pct.toFixed(1)}%
          </span>
        );
      },
      enableSorting: false,
      size: 80,
      minSize: 60,
    });
  }

  return cols;
}

// ── Row styling ───────────────────────────────────────────────────────────────

function getRowClassName(row: { original: StatementRow }): string | undefined {
  switch (row.original._type) {
    case "section-header":
      return "bg-muted/30 border-b-0";
    case "subtotal-group":
      return "bg-muted/20";
    case "section-total":
    case "subtotal-total":
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
  subtotalRules,
  hideZeroRows = false,
  preserveEmptySections = false,
  showRowTotals = true,
  showVariance = false,
  currentPeriodCount,
  toolbar,
  renderAmountCell,
  isMobile = false,
  mobileCompareEnabled = false,
  periodOrder,
  periodColumnOrder = "oldest-first",
  className,
}: FinancialStatementTableProps) {
  const [expanded, setExpanded] = React.useState<ExpandedState>({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [viewportLayout, setViewportLayout] = React.useState<
    "portrait" | "landscape" | "unknown"
  >("unknown");

  const { rows: rawRows, periods } = React.useMemo(
    () =>
      buildFinancialStatementData(data, config, timeUnit, subtotalRules, {
        preserveEmptySections,
      }),
    [data, config, timeUnit, subtotalRules, preserveEmptySections],
  );

  const rows = React.useMemo(
    () => (hideZeroRows ? filterZeroRows(rawRows) : rawRows),
    [rawRows, hideZeroRows],
  );

  const orderedPeriods = React.useMemo(
    () =>
      resolvePeriodColumns(periods, timeUnit, periodOrder, periodColumnOrder),
    [periods, timeUnit, periodOrder, periodColumnOrder],
  );

  const effectiveShowRowTotals =
    isMobile && mobileCompareEnabled ? false : showRowTotals;

  const columns = React.useMemo(
    () =>
      buildColumns(
        orderedPeriods,
        timeUnit,
        rows,
        showAccountNumbers,
        renderAmountCell,
        effectiveShowRowTotals,
        showVariance,
        currentPeriodCount,
        isMobile,
        mobileCompareEnabled,
      ),
    [
      orderedPeriods,
      timeUnit,
      rows,
      showAccountNumbers,
      renderAmountCell,
      effectiveShowRowTotals,
      showVariance,
      currentPeriodCount,
      isMobile,
      mobileCompareEnabled,
    ],
  );

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const updateViewportLayout = () => {
      setViewportLayout(
        window.innerWidth > window.innerHeight ? "landscape" : "portrait",
      );
    };

    updateViewportLayout();
    window.addEventListener("resize", updateViewportLayout);
    window.addEventListener("orientationchange", updateViewportLayout);

    return () => {
      window.removeEventListener("resize", updateViewportLayout);
      window.removeEventListener("orientationchange", updateViewportLayout);
    };
  }, []);

  // Auto-expand: section headers expanded, account groups expanded 1 level
  React.useEffect(() => {
    if (rows.length === 0) return;
    const toExpand: Record<string, boolean> = {};
    for (const row of rows) {
      if (row._type === "section-header") {
        toExpand[row.id] = true;
        // Also expand top-level children (account groups or subtotal groups)
        for (const child of row.children) {
          if (
            child._type === "account-group" ||
            child._type === "subtotal-group"
          ) {
            toExpand[child.id] = true;
            // If subtotal group, also expand account groups within it
            if (child._type === "subtotal-group") {
              for (const grandchild of child.children) {
                if (grandchild._type === "account-group") {
                  toExpand[grandchild.id] = true;
                }
              }
            }
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
    getSubRows: (row) => (row.children.length > 0 ? row.children : undefined),
    getExpandedRowModel: getExpandedRowModel(),
    state: { expanded, columnVisibility },
    onExpandedChange: setExpanded,
    onColumnVisibilityChange: setColumnVisibility,
  });

  return (
    <div className={className}>
      {toolbar && (
        <div className="flex items-center justify-end gap-1 pb-1">
          {toolbar}
        </div>
      )}
      <DataTable
        key={`fs-${isMobile ? "m" : "d"}-${mobileCompareEnabled ? "cmp" : "std"}-${viewportLayout}`}
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
        stickyColumnIds={["account"]}
      />
    </div>
  );
}

// ── Export helper ─────────────────────────────────────────────────────────────

export interface FlatExportRow {
  type: string;
  account: string;
  accountNumber: string;
  [period: string]: string | number;
}

/**
 * Flatten the financial statement tree into export-ready rows.
 * Includes indentation hints in the account name.
 */
export function flattenStatementForExport(
  data: FinancialStatementEntry[],
  config: FinancialStatementConfig,
  timeUnit: TimeUnit,
  subtotalRules?: SubtotalRulesConfig,
  hideZeroRows?: boolean,
): { rows: FlatExportRow[]; periodKeys: string[] } {
  let { rows: tree, periods } = buildFinancialStatementData(
    data,
    config,
    timeUnit,
    subtotalRules,
  );
  if (hideZeroRows) tree = filterZeroRows(tree);

  const flat: FlatExportRow[] = [];

  function walk(rows: StatementRow[], indent: number) {
    for (const row of rows) {
      const prefix = "  ".repeat(indent);
      const exportRow: FlatExportRow = {
        type: row._type,
        account: `${prefix}${row.accountNumber ? `${row.accountNumber} ` : ""}${row.name}`,
        accountNumber: row.accountNumber ?? "",
      };
      for (const pk of periods) {
        exportRow[pk] = row.periodAmounts[pk] ?? 0;
      }
      exportRow.total = row.total;

      // Skip section-header amounts (they don't have values)
      if (row._type !== "section-header" || row.children.length === 0) {
        flat.push(exportRow);
      } else {
        // Push header label row
        flat.push(exportRow);
      }

      if (row.children.length > 0) {
        walk(row.children, indent + 1);
      }
    }
  }

  walk(tree, 0);
  return { rows: flat, periodKeys: periods };
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
