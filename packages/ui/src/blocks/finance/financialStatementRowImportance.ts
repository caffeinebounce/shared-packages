import type { StatementRow } from "./FinancialStatementTable";

export type FinancialStatementRowImportance =
  | "normal"
  | "emphasis"
  | "key-summary";

export type FinancialStatementKind =
  | "income-statement"
  | "balance-sheet"
  | "cash-flow"
  | "working-capital";

export type FinancialStatementRowImportanceResolver = (
  row: StatementRow,
) => FinancialStatementRowImportance;

interface RowImportanceLabelConfig {
  emphasis: string[];
  keySummary: string[];
}

interface RowImportanceConfig {
  [kind: string]: RowImportanceLabelConfig;
}

const DEFAULT_ROW_IMPORTANCE_CONFIG: RowImportanceConfig = {
  "income-statement": {
    emphasis: ["Total Revenue", "Total Expenses", "Operating Income"],
    keySummary: ["Net Income"],
  },
  "balance-sheet": {
    emphasis: ["Total Liabilities", "Total Equity"],
    keySummary: ["Total Assets", "Total Liabilities & Equity"],
  },
  "cash-flow": {
    emphasis: [
      "Total Operating Activities",
      "Total Investing Activities",
      "Total Financing Activities",
      "Net Cash from Operating Activities",
      "Net Cash from Investing Activities",
      "Net Cash from Financing Activities",
    ],
    keySummary: [
      "Net Change in Cash",
      "Ending Cash",
      "Total Cash & Cash Equivalents",
    ],
  },
  "working-capital": {
    emphasis: ["Total Current Assets", "Total Current Liabilities"],
    keySummary: ["NWC", "Net Working Capital"],
  },
};

function normalizeLabel(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function createFinancialStatementRowImportanceResolver(
  kind: FinancialStatementKind,
  overrides?: Partial<RowImportanceLabelConfig>,
): FinancialStatementRowImportanceResolver {
  const base = DEFAULT_ROW_IMPORTANCE_CONFIG[kind];
  const emphasis = new Set(
    (overrides?.emphasis ?? base?.emphasis ?? []).map(normalizeLabel),
  );
  const keySummary = new Set(
    (overrides?.keySummary ?? base?.keySummary ?? []).map(normalizeLabel),
  );

  return (row) => {
    // Keep non-total rows neutral unless explicitly mapped by name.
    const label = normalizeLabel(row.name);

    if (keySummary.has(label)) return "key-summary";
    if (emphasis.has(label)) return "emphasis";

    return "normal";
  };
}

export function getFinancialStatementRowImportanceClassName(
  importance: FinancialStatementRowImportance,
): string | undefined {
  switch (importance) {
    case "emphasis":
      return "bg-muted/25 border-t border-border/50 font-medium";
    case "key-summary":
      return "bg-muted/45 border-t-2 border-border/70 font-semibold";
    default:
      return undefined;
  }
}
