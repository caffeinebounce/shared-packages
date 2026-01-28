"use client";

import { Button, cn } from "@caffeinebounce/ui";
import { Lightbulb, X } from "lucide-react";
import type { SignInMethod } from "../../hooks/useLastSignIn";
import { maskEmail } from "../../hooks/useLastSignIn";

/** Method display configuration */
const METHOD_CONFIG: Record<
  SignInMethod,
  { label: string; className?: string }
> = {
  email: { label: "email" },
  google: { label: "Google" },
  azure: { label: "Microsoft" },
};

export interface LastSignInHintProps {
  /** The sign-in method that was last used */
  method: SignInMethod;
  /** The email address associated with the sign-in */
  email: string;
  /** Whether to mask the email for privacy. Default: true */
  maskEmailAddress?: boolean;
  /** Called when user clicks "Not you?" to clear the hint */
  onClear?: () => void;
  /** Additional className for the container */
  className?: string;
}

/**
 * LastSignInHint - Displays a helpful hint about the user's last sign-in method.
 *
 * Shows a subtle banner reminding users which authentication method they
 * previously used, helping avoid confusion between email/password and OAuth.
 *
 * @example
 * ```tsx
 * <LastSignInHint
 *   method="google"
 *   email="user@example.com"
 *   onClear={() => clearLastSignIn()}
 * />
 * ```
 */
export function LastSignInHint({
  method,
  email,
  maskEmailAddress = true,
  onClear,
  className,
}: LastSignInHintProps) {
  const displayEmail = maskEmailAddress ? maskEmail(email) : email;
  const config = METHOD_CONFIG[method];

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg",
        "bg-muted/50 border border-border/50",
        "text-sm animate-in fade-in slide-in-from-top-2 duration-300",
        className,
      )}
    >
      <div className="flex items-center gap-2 min-w-0">
        <Lightbulb className="h-4 w-4 text-amber-500 shrink-0" />
        <span className="text-muted-foreground truncate">
          You last signed in with{" "}
          <span className="font-medium text-foreground">{config.label}</span>
          {displayEmail && (
            <span className="text-muted-foreground/80"> as {displayEmail}</span>
          )}
        </span>
      </div>
      {onClear && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClear}
          aria-label="Clear stored sign-in information"
          className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground shrink-0"
        >
          <X className="h-3 w-3 mr-1" />
          Not you?
        </Button>
      )}
    </div>
  );
}
