"use client";

import { Mail } from "lucide-react";
import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

export interface NewsletterSignupProps {
  /** Additional className */
  className?: string;
}

/**
 * NewsletterSignup - Newsletter signup form for marketing page
 */
export function NewsletterSignup({ className }: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    setError(null);

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
        setError(data.error || "Failed to subscribe. Please try again.");
      }
    } catch {
      setError("Failed to subscribe. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div
        className={`rounded-lg border border-green-200 bg-green-50 p-4 text-center dark:border-green-800 dark:bg-green-900/20 ${className || ""}`}
      >
        <p className="text-sm font-medium text-green-800 dark:text-green-200">
          ✓ Thank you for subscribing! Check your email for confirmation.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex flex-col gap-3 sm:flex-row ${className || ""}`}
    >
      <div className="flex-1">
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full"
        />
      </div>
      <Button type="submit" disabled={isSubmitting || !email}>
        <Mail className="mr-2 h-4 w-4" />
        {isSubmitting ? "Subscribing..." : "Subscribe"}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </form>
  );
}
