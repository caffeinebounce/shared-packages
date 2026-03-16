"use client";

import { Check, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

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
}

/**
 * NewsletterSignup - Newsletter signup form for marketing page
 * Errors are displayed via toasts for better UX
 */
export function NewsletterSignup({ className }: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    injectShakeKeyframes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    setHasError(false);

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setSubmitted(true);
        setEmail("");
      } else {
        const data = await response.json();
        toast.error(data.error || "Something went wrong. Please try again.");
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
        className={`flex items-center justify-center gap-3 rounded-box border border-border px-4 py-3 ${className || ""}`}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground animate-in zoom-in duration-300">
          <Check
            className="h-4 w-4 animate-in fade-in duration-500 delay-150"
            strokeWidth={3}
          />
        </div>
        <div className="animate-in slide-in-from-left-2 fade-in duration-300 delay-100 text-left">
          <p className="font-medium text-foreground">You&apos;re subscribed!</p>
          <p className="text-sm text-muted-foreground">
            Check your email to confirm.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex ${hasError ? "animate-shake" : ""} ${className || ""}`}
      style={hasError ? { animation: "shake 0.5s ease-in-out" } : undefined}
    >
      <Input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="flex-1 rounded-r-none border-r-0 focus-visible:z-10"
      />
      <Button
        type="submit"
        disabled={isSubmitting || !email}
        className="rounded-l-none"
      >
        <Mail className="mr-2 h-4 w-4" />
        {isSubmitting ? "Subscribing..." : "Subscribe"}
      </Button>
    </form>
  );
}
