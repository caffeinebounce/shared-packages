/**
 * Formatting utilities for dates, numbers, currency, and more.
 *
 * @module formatters
 */

/**
 * Format a date string or Date object for display.
 *
 * @param date - ISO date string or Date object
 * @param options - Intl.DateTimeFormatOptions for customizing output
 * @returns Formatted date string, or "—" if date is invalid/empty
 *
 * @example
 * ```ts
 * formatDate("2024-01-15") // "Jan 15, 2024"
 * formatDate(new Date(), { month: "long" }) // "January 15, 2024"
 * formatDate(null) // "—"
 * ```
 */
export function formatDate(
  date: string | Date | null | undefined,
  options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
  },
): string {
  if (!date) return "—";
  try {
    const d = typeof date === "string" ? new Date(date) : date;
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-US", options);
  } catch {
    return "—";
  }
}

/**
 * Format a date with time included.
 *
 * @param date - ISO date string or Date object
 * @returns Formatted date and time string
 *
 * @example
 * ```ts
 * formatDateTime("2024-01-15T14:30:00Z") // "Jan 15, 2024, 2:30 PM"
 * ```
 */
export function formatDateTime(date: string | Date | null | undefined): string {
  return formatDate(date, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Format a phone number for display.
 * Handles various input formats: +11234567890, 1234567890, (123) 456-7890
 *
 * @param phone - Phone number string in any format
 * @returns Formatted phone number like "(123) 456-7890" or "+1 (123) 456-7890"
 *
 * @example
 * ```ts
 * formatPhoneNumber("1234567890") // "(123) 456-7890"
 * formatPhoneNumber("+11234567890") // "+1 (123) 456-7890"
 * formatPhoneNumber(null) // "—"
 * ```
 */
export function formatPhoneNumber(phone: string | null | undefined): string {
  if (!phone) return "—";
  const cleaned = phone.replace(/\D/g, "");
  const match = cleaned.match(/^(\d{1})?(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    const country = match[1] ? `+${match[1]} ` : "";
    return `${country}(${match[2]}) ${match[3]}-${match[4]}`;
  }
  return phone;
}

/**
 * Format a phone number as the user types (for input masking).
 * Handles partial input and formats progressively.
 *
 * @param value - Current input value
 * @returns Formatted phone number like "(123) 456-7890" (no country code)
 *
 * @example
 * ```ts
 * formatPhoneInput("123") // "123"
 * formatPhoneInput("1234") // "(123) 4"
 * formatPhoneInput("1234567890") // "(123) 456-7890"
 * ```
 */
export function formatPhoneInput(value: string): string {
  const numbers = value.replace(/\D/g, "");
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 6)
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
  return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
}

/**
 * Format a number as currency.
 *
 * @param amount - Number or string representing an amount
 * @param currency - ISO 4217 currency code (default: "USD")
 * @param options - Additional Intl.NumberFormatOptions
 * @returns Formatted currency string like "$1,234.56"
 *
 * @example
 * ```ts
 * formatCurrency(1234.56) // "$1,234.56"
 * formatCurrency(1000, "EUR") // "€1,000.00"
 * formatCurrency(null) // "—"
 * ```
 */
export function formatCurrency(
  amount: number | string | null | undefined,
  currency = "USD",
  options?: Intl.NumberFormatOptions,
): string {
  if (amount === null || amount === undefined || amount === "") return "—";
  const num = typeof amount === "string" ? Number.parseFloat(amount) : amount;
  if (Number.isNaN(num)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    currencySign: "accounting",
    ...options,
  }).format(num);
}

/**
 * Format currency in compact notation for charts and dashboards.
 * Outputs values like "$1.5M", "$500K", or "$750" depending on magnitude.
 *
 * @param value - Number to format
 * @returns Compact currency string with K/M suffixes
 *
 * @example
 * ```ts
 * formatCompactCurrency(1500000) // "$1.5M"
 * formatCompactCurrency(500000) // "$500K"
 * formatCompactCurrency(750) // "$750"
 * formatCompactCurrency(-1200000) // "($1.2M)"
 * ```
 */
export function formatCompactCurrency(value: number): string {
  const absValue = Math.abs(value);
  const neg = value < 0;
  if (absValue >= 1_000_000) {
    return `${neg ? "(" : ""}$${(absValue / 1_000_000).toFixed(1)}M${neg ? ")" : ""}`;
  }
  if (absValue >= 1_000) {
    return `${neg ? "(" : ""}$${(absValue / 1_000).toFixed(0)}K${neg ? ")" : ""}`;
  }
  return `${neg ? "(" : ""}$${absValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}${neg ? ")" : ""}`;
}

/**
 * Format a number as a percentage.
 *
 * @param value - Number or string to format
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted percentage string like "50%" or "33.33%"
 *
 * @example
 * ```ts
 * formatPercentage(50) // "50%"
 * formatPercentage(33.333, 2) // "33.33%"
 * formatPercentage(null) // "—"
 * ```
 */
export function formatPercentage(
  value: number | string | null | undefined,
  decimals = 0,
): string {
  if (value === null || value === undefined || value === "") return "—";
  const num = typeof value === "string" ? Number.parseFloat(value) : value;
  if (Number.isNaN(num)) return "—";
  return `${num.toFixed(decimals)}%`;
}

/**
 * Format a number with locale-specific separators.
 *
 * @param value - Number or string to format
 * @param options - Intl.NumberFormatOptions
 * @returns Formatted number string like "1,234,567"
 *
 * @example
 * ```ts
 * formatNumber(1234567) // "1,234,567"
 * formatNumber(1234.5678, { maximumFractionDigits: 2 }) // "1,234.57"
 * ```
 */
export function formatNumber(
  value: number | string | null | undefined,
  options?: Intl.NumberFormatOptions,
): string {
  if (value === null || value === undefined || value === "") return "—";
  const num = typeof value === "string" ? Number.parseFloat(value) : value;
  if (Number.isNaN(num)) return "—";
  return new Intl.NumberFormat("en-US", options).format(num);
}
