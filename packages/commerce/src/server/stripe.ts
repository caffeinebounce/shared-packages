import type Stripe from "stripe";

// Lazy initialization to avoid build-time errors
let stripeInstance: Stripe | null = null;

/**
 * Get a lazy-initialized Stripe server-side client
 * Requires STRIPE_SECRET_KEY environment variable
 *
 * @example
 * ```typescript
 * const stripe = await getStripe();
 * const refund = await stripe.refunds.create({ payment_intent: "pi_123" });
 * ```
 */
export async function getStripe(): Promise<Stripe> {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    // Dynamic import to avoid bundling stripe in client code
    const { default: StripeClass } = await import("stripe");
    stripeInstance = new StripeClass(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-02-24.acacia",
      typescript: true,
    });
  }
  return stripeInstance as Stripe;
}
