import { loadStripe, type Stripe } from "@stripe/stripe-js";

let stripePromise: Promise<Stripe | null> | null = null;

/**
 * Get a lazy-loaded Stripe.js client instance (browser-side only)
 * Requires NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable
 */
export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) {
      const message = "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set";
      // In development/test, fail fast so the misconfiguration is obvious.
      if (process.env.NODE_ENV !== "production") {
        throw new Error(message);
      }
      // In production, log the error and return null to preserve existing behavior.
      console.error(message);
      return Promise.resolve(null);
    }
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
}
