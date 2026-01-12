"use client";

import { useErrorLoggerSafe as useErrorLogger } from "@caffeinebounce/logger/client";
import {
  Button,
  FieldError,
  FieldLabel,
  PasswordInput,
} from "@caffeinebounce/ui";
import { type ComponentType, useEffect, useState } from "react";

import type { AuthFormConfig, AuthLinks } from "../../types";
import { defaultAuthLinks } from "../../types";
import { AuthFormLayout } from "../shared/AuthFormLayout";
import { AuthHeader } from "../shared/AuthHeader";

type Step = "loading" | "password" | "mfa" | "expired";

/**
 * Password reset completion event logging callbacks
 */
export interface ResetPasswordEventCallbacks {
  onPasswordResetCompleted?: (userId: string, email: string) => void;
  onPasswordResetFailed?: (email: string, reason: string) => void;
}

export interface ResetPasswordFormProps extends AuthFormConfig {
  /** MFA Challenge component to render when MFA is required */
  MFAChallengeComponent?: ComponentType<{
    onSuccess: () => void;
    onCancel: () => void;
  }>;
  /** Navigation links configuration */
  links?: AuthLinks;
  /** Image component to use (e.g., Next.js Image) */
  ImageComponent?: ComponentType<{
    src: string;
    alt: string;
    width: number;
    height: number;
    className?: string;
  }>;
  /** Link component to use (e.g., Next.js Link) */
  LinkComponent?: ComponentType<{
    href: string;
    className?: string;
    children: React.ReactNode;
  }>;
  /** Additional className for the form container */
  className?: string;
  /** Optional callbacks for logging password reset events */
  onAuthEvent?: ResetPasswordEventCallbacks;
}

/**
 * ResetPasswordForm - Set new password after reset link
 */
export function ResetPasswordForm({
  createClient,
  logo,
  MFAChallengeComponent,
  links = {},
  ImageComponent = "img" as unknown as ComponentType<{
    src: string;
    alt: string;
    width: number;
    height: number;
    className?: string;
  }>,
  LinkComponent = "a" as unknown as ComponentType<{
    href: string;
    className?: string;
    children: React.ReactNode;
  }>,
  className,
  onAuthEvent,
}: ResetPasswordFormProps) {
  const { logError } = useErrorLogger();
  const mergedLinks = { ...defaultAuthLinks, ...links };
  const Link = LinkComponent;
  const Image = ImageComponent;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<Step>("loading");

  // Check session on mount - session should already be established by callback
  useEffect(() => {
    let isMounted = true;
    let sessionFound = false;
    const supabase = createClient();

    async function checkUser() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!isMounted) return;

        if (user) {
          sessionFound = true;
          setStep("password");
        }
      } catch (_err) {
        // Wait for auth state change
      }
    }

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: string, session: unknown) => {
      if (!isMounted) return;

      if (
        event === "PASSWORD_RECOVERY" ||
        event === "SIGNED_IN" ||
        event === "TOKEN_REFRESHED" ||
        event === "INITIAL_SESSION"
      ) {
        if (session && typeof session === "object" && "user" in session) {
          sessionFound = true;
          setStep("password");
        }
      }
    });

    // Check immediately with a small delay for cookies
    const timeoutId = setTimeout(() => {
      checkUser();
    }, 100);

    // Fallback timeout - show expired after 5 seconds
    const fallbackTimeout = setTimeout(() => {
      if (isMounted && !sessionFound) {
        setStep("expired");
      }
    }, 5000);

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      clearTimeout(timeoutId);
      clearTimeout(fallbackTimeout);
    };
  }, [createClient]);

  // Get user-friendly error message
  function getUserFriendlyError(errorMessage: string): string {
    if (errorMessage.includes("weak") || errorMessage.includes("strength")) {
      return "Please choose a stronger password.";
    }
    if (errorMessage.includes("same as")) {
      return "New password must be different from your current password.";
    }
    if (errorMessage.includes("session") || errorMessage.includes("expired")) {
      return "Your password reset link has expired. Please request a new one.";
    }
    logError(new Error(errorMessage), {
      component: "ResetPasswordForm",
      action: "passwordReset",
    });
    return "Unable to update your password. Please try again or contact support if the problem persists.";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    await attemptPasswordUpdate();
  }

  async function attemptPasswordUpdate() {
    setLoading(true);
    setError(null);

    const supabase = createClient();

    try {
      // Get current user for logging
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const userEmail = user?.email || "";
      const userId = user?.id || "";

      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        // Check if MFA is required
        if (
          updateError.message.includes("AAL2") ||
          updateError.message.includes("MFA")
        ) {
          setLoading(false);
          setStep("mfa");
          return;
        }

        // Log password reset failure
        onAuthEvent?.onPasswordResetFailed?.(userEmail, updateError.message);

        setError(getUserFriendlyError(updateError.message));
        setLoading(false);
      } else {
        // Log password reset success
        onAuthEvent?.onPasswordResetCompleted?.(userId, userEmail);

        // Sign out to clear the recovery session, then redirect
        await supabase.auth.signOut();
        // Show success toast on signin page
        sessionStorage.setItem("passwordResetSuccess", "true");
        window.location.href = mergedLinks.signIn;
      }
    } catch (err) {
      // Log password reset failure
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const userEmail = user?.email || "";

      onAuthEvent?.onPasswordResetFailed?.(
        userEmail,
        err instanceof Error ? err.message : "unexpected_error",
      );

      setError(
        "Unable to update your password. Please try again or contact support.",
      );
      setLoading(false);
    }
  }

  function handleMFASuccess() {
    attemptPasswordUpdate();
  }

  function handleMFACancel() {
    setStep("password");
  }

  // Get title based on step
  const getTitle = () => {
    switch (step) {
      case "loading":
        return "Loading...";
      case "expired":
        return "Link Expired";
      case "mfa":
        return "Verify your identity";
      default:
        return "Reset your password";
    }
  };

  return (
    <AuthFormLayout
      homeUrl={mergedLinks.home}
      LinkComponent={Link}
      className={className}
    >
      {/* Header */}
      <div className="space-y-2">
        <AuthHeader logo={logo} title={getTitle()} ImageComponent={Image} />
        {step === "loading" && (
          <p className="text-sm text-muted-foreground text-center">
            Please wait while we verify your reset link.
          </p>
        )}
        {step === "expired" && (
          <p className="text-sm text-muted-foreground text-center">
            This password reset link has expired or is invalid. Please request a
            new one.
          </p>
        )}
        {step === "mfa" && (
          <p className="text-sm text-muted-foreground text-center">
            Two-factor authentication is required to reset your password.
          </p>
        )}
        {step === "password" && (
          <p className="text-sm text-muted-foreground text-center">
            Enter your new password below.
          </p>
        )}
      </div>

      {/* Content */}
      {step === "loading" && (
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )}

      {step === "expired" && (
        <div className="flex flex-col items-center gap-4">
          <Link
            href={mergedLinks.forgotPassword}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Request New Link
          </Link>
          <Link
            href={mergedLinks.signIn}
            className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4"
          >
            Back to Sign In
          </Link>
        </div>
      )}

      {step === "mfa" && MFAChallengeComponent && (
        <MFAChallengeComponent
          onSuccess={handleMFASuccess}
          onCancel={handleMFACancel}
        />
      )}

      {step === "password" && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <FieldLabel htmlFor="password" className="text-muted-foreground">
              New Password
            </FieldLabel>
            <PasswordInput
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/50"
            />
          </div>

          <div className="space-y-2">
            <FieldLabel
              htmlFor="confirm-password"
              className="text-muted-foreground"
            >
              Confirm New Password
            </FieldLabel>
            <PasswordInput
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/50"
            />
            <p className="text-xs text-muted-foreground">
              Must be at least 8 characters long.
            </p>
          </div>

          {error && (
            <FieldError className="text-destructive">{error}</FieldError>
          )}

          <Button type="submit" size="lg" disabled={loading} className="w-full">
            {loading ? "Updating..." : "Update Password"}
          </Button>

          <div className="text-center">
            <Link
              href={mergedLinks.signIn}
              className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4"
            >
              Back to Sign In
            </Link>
          </div>
        </form>
      )}
    </AuthFormLayout>
  );
}
