"use client";

import * as React from "react";
import { cn } from "../../utils";

export interface DataTableCurrencyCellProps {
  /** The numeric value to display */
  value: number | null | undefined;
  /** Currency code (default: "USD") */
  currency?: string;
  /** Locale (default: "en-US") */
  locale?: string;
  /** Show dash for zero values (default: false) */
  dashZero?: boolean;
  /** Additional className */
  className?: string;
}

const formatterCache = new Map<string, Intl.NumberFormat>();

function getFormatter(locale: string, currencyCode: string): Intl.NumberFormat {
  const key = `${locale}:${currencyCode}`;
  let fmt = formatterCache.get(key);
  if (!fmt) {
    fmt = new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: 2,
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
  },
): { text: string; isNegative: boolean; isZero: boolean } {
  const v = value ?? 0;
  const isZero = v === 0;
  const isNegative = v < 0;
  const curr = options?.currency ?? "USD";
  const locale = options?.locale ?? "en-US";
  const dashZero = options?.dashZero ?? false;

  if (isZero && dashZero) {
    return { text: "—", isNegative: false, isZero: true };
  }

  const fmt = getFormatter(locale, curr);
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
  className,
}: DataTableCurrencyCellProps) {
  const { text, isNegative, isZero } = formatCurrencyValue(value, {
    currency: currencyCode,
    locale,
    dashZero,
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
