import type Stripe from "stripe";
import { getStripe } from "./stripe";

export type RefundReason = "duplicate" | "fraudulent" | "requested_by_customer";

/**
 * Create a refund for a payment intent
 * @param paymentIntentId Stripe payment intent ID
 * @param amountCents Amount to refund in cents (optional, defaults to full refund)
 * @param reason Reason for the refund
 * @returns Stripe Refund object
 */
export async function createRefund(
  paymentIntentId: string,
  amountCents?: number,
  reason: RefundReason = "requested_by_customer",
): Promise<Stripe.Refund> {
  const stripe = await getStripe();
  return stripe.refunds.create({
    payment_intent: paymentIntentId,
    // Use !== undefined to properly handle zero-value refunds (amountCents of 0)
    ...(amountCents !== undefined && { amount: amountCents }),
    reason,
  });
}
