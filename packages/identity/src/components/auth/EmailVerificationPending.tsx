"use client";

import { Badge, cn } from "@caffeinebounce/ui";
import type { SupabaseClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { type ComponentType, useEffect, useState } from "react";
import { AuthFormLayout } from "../shared/AuthFormLayout";

export interface EmailVerificationPendingProps {
  /** The email address awaiting verification */
  email: string;
  /** Logo configuration */
  logo?: { src: string; alt: string; width?: number; height?: number };
  /** Image component to use (e.g., Next.js Image) */
  ImageComponent: ComponentType<{
    src: string;
    alt: string;
    width: number;
    height: number;
    className?: string;
  }>;
  /** Factory function to create Supabase client */
  createClient: () => SupabaseClient;
  /** URL to redirect to after verification */
  redirectTo: string;
  /** Additional CSS class names */
  className?: string;
}

/**
 * Email verification pending screen shown after signup.
 * Polls for email verification and allows resending the verification email.
 */
export function EmailVerificationPending({
  email,
  logo,
  ImageComponent: Image,
  createClient,
  redirectTo,
  className,
}: EmailVerificationPendingProps) {
  const router = useRouter();
  const [resendCooldown, setResendCooldown] = useState(30);
  const [resendStatus, setResendStatus] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");

  useEffect(() => {
    const supabase = createClient();

    // Poll for email verification
    const interval = setInterval(async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.email_confirmed_at) {
        clearInterval(interval);
        router.push(redirectTo);
        router.refresh();
      }
    }, 2000);

    // Also listen for auth state changes (in case they verify in same tab)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: string) => {
      if (event === "SIGNED_IN") {
        clearInterval(interval);
        router.push(redirectTo);
        router.refresh();
      }
    });

    return () => {
      clearInterval(interval);
      subscription.unsubscribe();
    };
  }, [router, createClient, redirectTo]);

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  async function handleResendEmail() {
    if (resendCooldown > 0 || resendStatus === "sending") return;

    setResendStatus("sending");
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
      });

      if (error) {
        setResendStatus("error");
        setTimeout(() => setResendStatus("idle"), 3000);
      } else {
        setResendStatus("sent");
        setResendCooldown(30);
        setTimeout(() => setResendStatus("idle"), 3000);
      }
    } catch {
      setResendStatus("error");
      setTimeout(() => setResendStatus("idle"), 3000);
    }
  }

  return (
    <AuthFormLayout
      homeUrl={redirectTo}
      showHomeLink={false}
      className={className}
    >
      <div className="flex flex-col gap-6 w-full text-center">
        {logo && (
          <div className="flex justify-center">
            <Image
              src={logo.src}
              alt={logo.alt}
              width={logo.width ?? 48}
              height={logo.height ?? 48}
              className="rounded-xl"
            />
          </div>
        )}
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Check your email
          </h1>
          <p className="text-sm text-muted-foreground">
            We&apos;ve sent a confirmation link to{" "}
            <strong className="text-foreground">{email}</strong>. Click the link
            to verify your account.
          </p>
        </div>

        {/* Resend email section */}
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <span>Didn&apos;t receive an email?</span>
          <button
            type="button"
            onClick={handleResendEmail}
            disabled={resendCooldown > 0 || resendStatus === "sending"}
            className={cn(
              "font-medium text-xs transition-colors",
              resendCooldown > 0 || resendStatus === "sending"
                ? "text-muted-foreground/40 cursor-not-allowed"
                : "text-primary hover:text-primary/80 hover:underline underline-offset-4",
            )}
          >
            {resendStatus === "sending" && "Sending..."}
            {resendStatus === "sent" && "Sent!"}
            {resendStatus === "error" && "Failed"}
            {resendStatus === "idle" && resendCooldown > 0 && (
              <span className="tabular-nums">{resendCooldown}s</span>
            )}
            {resendStatus === "idle" && resendCooldown === 0 && "Resend"}
          </button>
        </div>

        {/* Waiting indicator badge at bottom */}
        <div className="pt-2 flex justify-center">
          <Badge
            variant="muted"
            className="px-3 py-1.5 text-xs font-medium gap-2 overflow-visible"
          >
            <span className="relative flex h-3 w-3 shrink-0">
              <span
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{ backgroundColor: "#f59e0b" }}
              />
              <span
                className="relative inline-flex rounded-full h-3 w-3"
                style={{
                  backgroundColor: "#f59e0b",
                  boxShadow: "0 0 8px 2px rgba(245, 158, 11, 0.6)",
                }}
              />
            </span>
            <span>Waiting for verification</span>
          </Badge>
        </div>
      </div>
    </AuthFormLayout>
  );
}
