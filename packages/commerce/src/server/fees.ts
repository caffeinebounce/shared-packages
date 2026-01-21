/** Number of cents in a dollar */
export const CENTS_PER_DOLLAR = 100;

/** Default platform fee percentage */
export const PLATFORM_FEE_PERCENT = 10;

/**
 * Calculate platform fee from an amount
 * @param amount Amount in cents
 * @param feePercent Fee percentage (default: 10%)
 * @returns Platform fee in cents
 */
export function calculatePlatformFee(
  amount: number,
  feePercent: number = PLATFORM_FEE_PERCENT,
): number {
  return Math.round(amount * (feePercent / 100));
}

/**
 * Calculate net amount after platform fee
 * @param amount Amount in cents
 * @param feePercent Fee percentage (default: 10%)
 * @returns Net amount in cents
 */
export function calculateNetAmount(
  amount: number,
  feePercent: number = PLATFORM_FEE_PERCENT,
): number {
  return amount - calculatePlatformFee(amount, feePercent);
}

/**
 * Convert dollars to cents
 * @param dollars Amount in dollars (number or string)
 * @returns Amount in cents
 */
export function dollarsToCents(dollars: number | string): number {
  const amountInDollars =
    typeof dollars === "string" ? Number.parseFloat(dollars) : dollars;
  return Math.round(amountInDollars * CENTS_PER_DOLLAR);
}

/**
 * Convert cents to dollars
 * @param cents Amount in cents
 * @returns Amount in dollars
 */
export function centsToDollars(cents: number): number {
  return cents / CENTS_PER_DOLLAR;
}
