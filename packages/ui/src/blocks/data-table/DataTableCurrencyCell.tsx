"use client";

import * as React from "react";
import { cn } from "../../utils";

// ── Finance display context ───────────────────────────────────────────────────

export type DisplayUnits = "actuals" | "thousands" | "millions";

interface FinanceDisplayContextValue {
  decimals: number;
  displayUnits: DisplayUnits;
}

const FinanceDisplayContext = React.createContext<FinanceDisplayContextValue>({
  decimals: 0,
  displayUnits: "actuals",
});

// Back-compat: decimals-only context (still used by old FinanceDecimalsProvider)
const FinanceDecimalsContext = React.createContext<number>(0);

/**
 * Provider for global finance display settings (decimals + units).
 *
 * @example
 * ```tsx
 * <FinanceDisplayProvider decimals={0} displayUnits="thousands">
 *   <IncomeStatement />
 * </FinanceDisplayProvider>
 * ```
 */
export function FinanceDisplayProvider({
  decimals,
  displayUnits = "actuals",
  children,
}: {
  decimals: number;
  displayUnits?: DisplayUnits;
  children: React.ReactNode;
}) {
  const value = React.useMemo(
    () => ({ decimals, displayUnits }),
    [decimals, displayUnits],
  );
  return (
    <FinanceDisplayContext.Provider value={value}>
      <FinanceDecimalsContext.Provider value={decimals}>
        {children}
      </FinanceDecimalsContext.Provider>
    </FinanceDisplayContext.Provider>
  );
}

/**
 * @deprecated Use FinanceDisplayProvider instead
 */
export function FinanceDecimalsProvider({
  decimals,
  children,
}: {
  decimals: number;
  children: React.ReactNode;
}) {
  return (
    <FinanceDisplayProvider decimals={decimals}>
      {children}
    </FinanceDisplayProvider>
  );
}

/** Read the current finance decimal places setting (default: 0) */
export function useFinanceDecimals(): number {
  return React.useContext(FinanceDecimalsContext);
}

/** Read the full finance display context (decimals + units) */
export function useFinanceDisplay(): FinanceDisplayContextValue {
  return React.useContext(FinanceDisplayContext);
}

/** Get the divisor for display units */
export function getUnitDivisor(units: DisplayUnits): number {
  switch (units) {
    case "thousands": return 1000;
    case "millions": return 1000000;
    default: return 1;
  }
}

/** Get the unit suffix label */
export function getUnitLabel(units: DisplayUnits): string | null {
  switch (units) {
    case "thousands": return "in thousands";
    case "millions": return "in millions";
    default: return null;
  }
}

/** Get the short unit suffix */
export function getUnitSuffix(units: DisplayUnits): string | null {
  switch (units) {
    case "thousands": return "(000s)";
    case "millions": return "(M)";
    default: return null;
  }
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
    displayUnits?: DisplayUnits;
  },
): { text: string; isNegative: boolean; isZero: boolean } {
  const raw = value ?? 0;
  const divisor = getUnitDivisor(options?.displayUnits ?? "actuals");
  const v = divisor === 1 ? raw : raw / divisor;
  const isZero = raw === 0;
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
  // Use context decimals + units if not explicitly provided
  const ctx = useFinanceDisplay();
  const resolvedDecimals = decimals ?? ctx.decimals;

  const { text, isNegative, isZero } = formatCurrencyValue(value, {
    currency: currencyCode,
    locale,
    dashZero,
    decimals: resolvedDecimals,
    displayUnits: ctx.displayUnits,
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
