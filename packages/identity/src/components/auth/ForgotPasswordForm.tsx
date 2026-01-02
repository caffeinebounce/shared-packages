"use client";

import { Button, FieldLabel, Input } from "@caffeinebounce/ui";
import { useSearchParams } from "next/navigation";
import { type ComponentType, useState } from "react";

import type { AuthFormConfig, AuthLinks } from "../../types";
import { defaultAuthLinks } from "../../types";
import { AuthFormLayout } from "../shared/AuthFormLayout";
import { AuthHeader } from "../shared/AuthHeader";

/**
 * Password reset event logging callbacks
 */
export interface PasswordResetEventCallbacks {
  onPasswordResetRequested?: (email: string) => void;
}

export interface ForgotPasswordFormProps extends AuthFormConfig {
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
  onAuthEvent?: PasswordResetEventCallbacks;
}

/**
 * ForgotPasswordForm - Password reset request form
 */
export function ForgotPasswordForm({
  createClient,
  logo,
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
}: ForgotPasswordFormProps) {
  const mergedLinks = { ...defaultAuthLinks, ...links };
  const Link = LinkComponent;
  const Image = ImageComponent;

  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") || "";
  const [email, setEmail] = useState(initialEmail);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    // Use NEXT_PUBLIC_SITE_URL if set (for production), otherwise fall back to current origin
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    // Use callback route with next parameter for PKCE flow code exchange
    const callbackUrl = `${siteUrl}${mergedLinks.callback}?next=${encodeURIComponent(mergedLinks.resetPassword)}`;
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: callbackUrl,
      },
    );

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
    } else {
      // Log password reset requested
      onAuthEvent?.onPasswordResetRequested?.(email);

      setSuccess(true);
      setLoading(false);
    }
  }

  if (success) {
    return (
      <AuthFormLayout
        homeUrl={mergedLinks.home}
        LinkComponent={Link}
        className={className}
      >
        <AuthHeader
          logo={logo}
          title="Check your email"
          ImageComponent={Image}
        />
        <p className="text-sm text-muted-foreground text-center">
          We&apos;ve sent a password reset link to{" "}
          <strong className="text-foreground">{email}</strong>. Click the link
          to reset your password.
        </p>
        <div className="text-center">
          <Link
            href={mergedLinks.signIn}
            className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4"
          >
            Back to Sign In
          </Link>
        </div>
      </AuthFormLayout>
    );
  }

  return (
    <AuthFormLayout
      homeUrl={mergedLinks.home}
      LinkComponent={Link}
      className={className}
    >
      {/* Header */}
      <div className="space-y-2">
        <AuthHeader
          logo={logo}
          title="Forgot your password?"
          ImageComponent={Image}
        />
        <p className="text-sm text-muted-foreground text-center">
          Enter your email address and we&apos;ll send you a link to reset your
          password.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <FieldLabel htmlFor="email" className="text-muted-foreground">
            Email Address
          </FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/50"
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" size="lg" disabled={loading} className="w-full">
          {loading ? "Sending..." : "Send Reset Link"}
        </Button>
      </form>

      {/* Footer */}
      <div className="text-center">
        <Link
          href={mergedLinks.signIn}
          className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4"
        >
          Back to Sign In
        </Link>
      </div>
    </AuthFormLayout>
  );
}
