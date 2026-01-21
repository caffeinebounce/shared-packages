"use client";

import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import type { StripeElementsOptions } from "@stripe/stripe-js";
import { AlertCircle, CreditCard, Loader2 } from "lucide-react";
import { useCallback, useState } from "react";
import { getStripe } from "../client/stripe";

interface PaymentFormProps {
  onSuccess: () => void;
  onError: (error: string) => void;
  returnUrl: string;
  submitLabel?: string;
  processingLabel?: string;
}

function PaymentForm({
  onSuccess,
  onError,
  returnUrl,
  submitLabel = "Pay Now",
  processingLabel = "Processing...",
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();

      if (!stripe || !elements) {
        return;
      }

      setIsProcessing(true);
      setErrorMessage(null);

      try {
        const { error, paymentIntent } = await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: returnUrl,
          },
          redirect: "if_required",
        });

        if (error) {
          setErrorMessage(error.message || "An error occurred");
          onError(error.message || "An error occurred");
        } else if (paymentIntent?.status === "succeeded") {
          onSuccess();
        } else if (paymentIntent?.status === "requires_action") {
          // 3D Secure or other authentication required
          // This should be handled by Stripe automatically
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Payment failed";
        setErrorMessage(message);
        onError(message);
      } finally {
        setIsProcessing(false);
      }
    },
    [stripe, elements, onSuccess, onError, returnUrl],
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement
        options={{
          layout: "tabs",
        }}
      />

      {errorMessage && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {processingLabel}
          </>
        ) : (
          <>
            <CreditCard className="h-4 w-4" />
            {submitLabel}
          </>
        )}
      </button>
    </form>
  );
}

export interface CheckoutFormProps {
  /** Stripe PaymentIntent client secret */
  clientSecret: string;
  /** Amount in cents to display */
  amount: number;
  /** Callback when payment succeeds */
  onSuccess: () => void;
  /** Callback when payment fails */
  onError: (error: string) => void;
  /** URL to redirect to after payment (for 3D Secure) */
  returnUrl: string;
  /** Custom submit button label */
  submitLabel?: string;
  /** Custom processing label */
  processingLabel?: string;
  /** Custom total label */
  totalLabel?: string;
  /** Hide the total display */
  hideTotal?: boolean;
  /** Hide the security message */
  hideSecurityMessage?: boolean;
  /** Custom security message */
  securityMessage?: string;
  /** Stripe Elements appearance theme */
  theme?: "stripe" | "night" | "flat";
  /** Custom Stripe Elements appearance variables */
  appearanceVariables?: Record<string, string>;
}

export function CheckoutForm({
  clientSecret,
  amount,
  onSuccess,
  onError,
  returnUrl,
  submitLabel,
  processingLabel,
  totalLabel = "Total",
  hideTotal = false,
  hideSecurityMessage = false,
  securityMessage = "Your payment is secured by Stripe. We never store your card details.",
  theme = "stripe",
  appearanceVariables,
}: CheckoutFormProps) {
  const stripePromise = getStripe();

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme,
      variables: {
        colorPrimary: "#0f172a",
        colorBackground: "#ffffff",
        colorText: "#0f172a",
        colorDanger: "#ef4444",
        fontFamily: "system-ui, sans-serif",
        borderRadius: "6px",
        ...appearanceVariables,
      },
    },
  };

  return (
    <div className="space-y-4">
      {!hideTotal && (
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <span className="text-sm text-muted-foreground">{totalLabel}</span>
          <span className="text-xl font-semibold">
            ${(amount / 100).toFixed(2)}
          </span>
        </div>
      )}

      <Elements stripe={stripePromise} options={options}>
        <PaymentForm
          onSuccess={onSuccess}
          onError={onError}
          returnUrl={returnUrl}
          submitLabel={submitLabel}
          processingLabel={processingLabel}
        />
      </Elements>

      {!hideSecurityMessage && (
        <p className="text-xs text-center text-muted-foreground">
          {securityMessage}
        </p>
      )}
    </div>
  );
}
