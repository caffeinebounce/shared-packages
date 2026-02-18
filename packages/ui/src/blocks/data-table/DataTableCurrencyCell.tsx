"use client";

import * as React from "react";
import { cn } from "../../utils";

// ── Finance decimals context ──────────────────────────────────────────────────

const FinanceDecimalsContext = React.createContext<number>(0);

/**
 * Provider for global finance decimal places setting.
 * Wrap your finance pages with this to control currency display precision.
 *
 * @example
 * ```tsx
 * <FinanceDecimalsProvider decimals={0}>
 *   <IncomeStatement />
 * </FinanceDecimalsProvider>
 * ```
 */
export function FinanceDecimalsProvider({
  decimals,
  children,
}: {
  decimals: number;
  children: React.ReactNode;
}) {
  return (
    <FinanceDecimalsContext.Provider value={decimals}>
      {children}
    </FinanceDecimalsContext.Provider>
  );
}

/** Read the current finance decimal places setting (default: 0) */
export function useFinanceDecimals(): number {
  return React.useContext(FinanceDecimalsContext);
}

/**
 * Hook to persist finance decimal places in localStorage.
 * Returns [decimals, setDecimals].
 */
export function useFinanceDecimalsSetting(
  storageKey = "finance-decimal-places",
  defaultValue = 0,
): [number, (v: number) => void] {
  const [decimals, setDecimalsState] = React.useState<number>(() => {
    if (typeof window === "undefined") return defaultValue;
    const stored = localStorage.getItem(storageKey);
    return stored !== null ? Number(stored) : defaultValue;
  });

  const setDecimals = React.useCallback(
    (v: number) => {
      setDecimalsState(v);
      if (typeof window !== "undefined") {
        localStorage.setItem(storageKey, String(v));
      }
    },
    [storageKey],
  );

  return [decimals, setDecimals];
}

export interface DataTableCurrencyCellProps {
  /** The numeric value to display */
  value: number | null | undefined;
  /** Currency code (default: "USD") */
  currency?: string;
  /** Locale (default: "en-US") */
  locale?: string;
  /** Show dash for zero values (default: false) */
  dashZero?: boolean;
  /** Number of decimal places (default: 2) */
  decimals?: number;
  /** Additional className */
  className?: string;
}

const formatterCache = new Map<string, Intl.NumberFormat>();

function getFormatter(locale: string, currencyCode: string, decimals: number): Intl.NumberFormat {
  const key = `${locale}:${currencyCode}:${decimals}`;
  let fmt = formatterCache.get(key);
  if (!fmt) {
    fmt = new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    formatterCache.set(key, fmt);
  }
  return fmt;
}

/**
 * Format a currency value for display in a DataTable cell.
 *
 * - Negative values rendered in accounting format: `($1,234.56)` in red
 * - Zero values optionally rendered as `—`
 * - Monospace tabular-nums for alignment
 */
export function formatCurrencyValue(
  value: number | null | undefined,
  options?: {
    currency?: string;
    locale?: string;
    dashZero?: boolean;
    decimals?: number;
  },
): { text: string; isNegative: boolean; isZero: boolean } {
  const v = value ?? 0;
  const isZero = v === 0;
  const isNegative = v < 0;
  const curr = options?.currency ?? "USD";
  const locale = options?.locale ?? "en-US";
  const dashZero = options?.dashZero ?? false;
  const decimals = options?.decimals ?? 2;

  if (isZero && dashZero) {
    return { text: "—", isNegative: false, isZero: true };
  }

  const fmt = getFormatter(locale, curr, decimals);
  if (isNegative) {
    // Accounting format: ($1,234.56)
    const formatted = fmt.format(Math.abs(v));
    return { text: `(${formatted})`, isNegative: true, isZero: false };
  }

  return { text: fmt.format(v), isNegative: false, isZero };
}

/**
 * Currency cell component for DataTable.
 *
 * - Negative values: red text in accounting format `($1,234.56)`
 * - Zero values: optional dash display
 * - Monospace tabular-nums for column alignment
 */
export function DataTableCurrencyCell({
  value,
  currency: currencyCode = "USD",
  locale = "en-US",
  dashZero = false,
  decimals,
  className,
}: DataTableCurrencyCellProps) {
  // Use context decimals if not explicitly provided
  const ctxDecimals = useFinanceDecimals();
  const resolvedDecimals = decimals ?? ctxDecimals;

  const { text, isNegative, isZero } = formatCurrencyValue(value, {
    currency: currencyCode,
    locale,
    dashZero,
    decimals: resolvedDecimals,
  });

  return (
    <span
      className={cn(
        "font-mono tabular-nums",
        isNegative && "text-red-600 dark:text-red-400",
        isZero && dashZero && "text-muted-foreground",
        className,
      )}
    >
      {text}
    </span>
  );
}
