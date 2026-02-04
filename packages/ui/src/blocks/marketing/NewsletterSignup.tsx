"use client";

import { Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setSubmitted(true);
        setEmail("");
        toast.success("Check your email to confirm your subscription!");
      } else {
        const data = await response.json();
        toast.error(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      toast.error("Unable to connect. Please check your connection and try again.");
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
          ✓ Thank you for subscribing!
          <br />
          Check your email for confirmation.
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
    </form>
  );
}
