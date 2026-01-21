import type Stripe from "stripe";

// Lazy initialization to avoid build-time errors
let stripeInstance: Stripe | null = null;

/**
 * Get a lazy-initialized Stripe server-side client
 * Requires STRIPE_SECRET_KEY environment variable
 */
export function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    // Dynamic import to avoid bundling stripe in client code
    // biome-ignore lint/suspicious/noExplicitAny: Dynamic import for server-only code
    const StripeClass = (require("stripe") as any).default;
    stripeInstance = new StripeClass(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-02-24.acacia",
      typescript: true,
    });
  }
  return stripeInstance as Stripe;
}

/**
 * Lazy proxy that initializes Stripe client on first property access
 * Use this for convenient access without explicit initialization
 */
export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return getStripe()[prop as keyof Stripe];
  },
});
