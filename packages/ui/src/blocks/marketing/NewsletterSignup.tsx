"use client";

import { Check, Mail } from "lucide-react";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { cx } from "./aceternity/shared";

// Inject shake keyframes once
const SHAKE_STYLE_ID = "newsletter-shake-keyframes";
function injectShakeKeyframes() {
  if (typeof document === "undefined") return;
  if (document.getElementById(SHAKE_STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = SHAKE_STYLE_ID;
  style.textContent = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
      20%, 40%, 60%, 80% { transform: translateX(4px); }
    }
  `;
  document.head.appendChild(style);
}

export interface NewsletterSignupProps {
  /** Additional className */
  className?: string;
  /** API endpoint that accepts a JSON POST body with an email address. */
  endpoint?: string;
  /** Optional source value included in the POST body for attribution. */
  source?: string;
  /** Email input placeholder. */
  placeholder?: string;
  /** Accessible label for the email input. */
  inputLabel?: string;
  /** Submit button text. */
  buttonLabel?: string;
  /** Submit button text while the request is in flight. */
  submittingLabel?: string;
  /** Success state title. */
  successTitle?: string;
  /** Success state supporting copy. */
  successDescription?: string;
  /** Fallback error copy used when the API does not provide one. */
  errorMessage?: string;
  /** Extra classes for the email input. */
  inputClassName?: string;
  /** Extra classes for the submit button. */
  buttonClassName?: string;
  /** Extra classes for the success state wrapper. */
  successClassName?: string;
}

/**
 * NewsletterSignup - Newsletter signup form for marketing page
 * Errors are displayed via toasts for better UX
 */
export function NewsletterSignup({
  className,
  endpoint = "/api/newsletter/subscribe",
  source,
  placeholder = "Enter your email",
  inputLabel = "Email address",
  buttonLabel = "Subscribe",
  submittingLabel = "Subscribing...",
  successTitle = "You're subscribed!",
  successDescription = "Check your email to confirm.",
  errorMessage = "Something went wrong. Please try again.",
  inputClassName,
  buttonClassName,
  successClassName,
}: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    injectShakeKeyframes();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    setHasError(false);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });

      if (response.ok) {
        setSubmitted(true);
        setEmail("");
      } else {
        const data = await response.json();
        toast.error(data.error || errorMessage);
        setHasError(true);
        setTimeout(() => setHasError(false), 500);
      }
    } catch {
      toast.error(
        "Unable to connect. Please check your connection and try again.",
      );
      setHasError(true);
      setTimeout(() => setHasError(false), 500);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div
        className={cx(
          "flex items-center justify-center gap-3 rounded-box border border-border px-4 py-3",
          className,
          successClassName,
        )}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground animate-in zoom-in duration-300">
          <Check
            className="h-4 w-4 animate-in fade-in duration-500 delay-150"
            strokeWidth={3}
          />
        </div>
        <div className="animate-in slide-in-from-left-2 fade-in duration-300 delay-100 text-left">
          <p className="font-medium text-foreground">{successTitle}</p>
          <p className="text-sm text-muted-foreground">{successDescription}</p>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cx("flex", hasError && "animate-shake", className)}
      style={hasError ? { animation: "shake 0.5s ease-in-out" } : undefined}
    >
      <Input
        aria-label={inputLabel}
        type="email"
        placeholder={placeholder}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className={cx(
          "flex-1 rounded-r-none border-r-0 focus-visible:z-10",
          inputClassName,
        )}
      />
      <Button
        type="submit"
        disabled={isSubmitting || !email}
        className={cx("rounded-l-none", buttonClassName)}
      >
        <Mail className="mr-2 h-4 w-4" />
        {isSubmitting ? submittingLabel : buttonLabel}
      </Button>
    </form>
  );
}
