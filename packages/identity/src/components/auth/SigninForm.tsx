"use client";

import { useErrorLoggerSafe as useErrorLogger } from "@caffeinebounce/logger/client";
import { getClientOrigin } from "@caffeinebounce/shared-utils";
import {
  Button,
  cn,
  FieldLabel,
  Input,
  PasswordInput,
} from "@caffeinebounce/ui";
import { AlertCircle, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { type ComponentType, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { AuthFormConfig, AuthLinks, OAuthProvider } from "../../types";
import { defaultAuthLinks } from "../../types";
import { AuthFormLayout } from "../shared/AuthFormLayout";
import { AuthHeader } from "../shared/AuthHeader";
import { GoogleIcon, MicrosoftIcon } from "../shared/OAuthIcons";
import { OrDivider } from "../shared/OrDivider";
import { EmailVerificationPending } from "./EmailVerificationPending";
import { clearStalePKCEState } from "./utils";

/**
 * Authentication event logging callbacks
 */
export interface AuthEventCallbacks {
  onSignInAttempt?: (email: string, provider?: string) => void;
  onSignInSuccess?: (userId: string, email: string, mfaUsed?: boolean) => void;
  onSignInFailure?: (email: string, reason: string) => void;
  onMFARequired?: (userId: string, email: string) => void;
}

export interface SigninFormProps extends AuthFormConfig {
  /** MFA Challenge component to render when MFA is required */
  MFAChallengeComponent?: ComponentType<{
    redirectTo: string;
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
  /** OAuth providers to show (default: ["azure"]) */
  oauthProviders?: OAuthProvider[];
  /** Show "Coming Soon" for Google OAuth */
  googleComingSoon?: boolean;
  /** Additional className for the form container */
  className?: string;
  /** Optional callbacks for logging authentication events */
  onAuthEvent?: AuthEventCallbacks;
}

/**
 * SigninForm - Configurable sign-in form with email/password and OAuth support
 *
 * @example
 * ```tsx
 * <SigninForm
 *   createClient={createClient}
 *   logo={{ src: "/logo.png", alt: "My App" }}
 *   appName="My App"
 *   MFAChallengeComponent={MFAChallenge}
 *   LinkComponent={Link}
 *   ImageComponent={Image}
 * />
 * ```
 */
export function SigninForm({
  createClient,
  logo,
  appName = "your account",
  termsUrl = "/terms",
  privacyUrl = "/privacy",
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
  oauthProviders = ["azure"],
  googleComingSoon = false,
  className,
  onAuthEvent,
}: SigninFormProps) {
  const { logError } = useErrorLogger();
  const mergedLinks = { ...defaultAuthLinks, ...links };
  const Link = LinkComponent;
  const Image = ImageComponent;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<OAuthProvider | null>(null);
  const [emailVerificationPending, setEmailVerificationPending] =
    useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo =
    searchParams.get("redirect") || mergedLinks.defaultRedirect;
  const message = searchParams.get("message");
  const mfaRequired = searchParams.get("mfa") === "required";

  // Show MFA immediately if redirected here with mfa=required
  const [showMFA, setShowMFA] = useState(mfaRequired);

  // Check for password reset success
  useEffect(() => {
    const passwordResetSuccess = sessionStorage.getItem("passwordResetSuccess");
    if (passwordResetSuccess) {
      sessionStorage.removeItem("passwordResetSuccess");
      toast.success("Password updated successfully");
    }
  }, []);

  // Focus password field when it appears
  useEffect(() => {
    if (showPassword && passwordRef.current) {
      passwordRef.current.focus();
    }
  }, [showPassword]);

  // Show email verification pending if sign-in failed due to unverified email
  if (emailVerificationPending) {
    return (
      <EmailVerificationPending
        email={email}
        logo={logo}
        ImageComponent={Image}
        createClient={createClient}
        redirectTo={redirectTo}
        className={className}
      />
    );
  }

  async function handleOAuthSignIn(provider: OAuthProvider) {
    setError(null);
    setOauthLoading(provider);

    // Log OAuth sign-in attempt
    onAuthEvent?.onSignInAttempt?.("", provider);

    // Clear any stale PKCE state from previous OAuth attempts
    // This prevents "invalid session" errors when signing in after sign-out
    clearStalePKCEState();

    // Get the appropriate origin for this environment (handles preview vs production)
    const siteUrl = getClientOrigin("NEXT_PUBLIC_SITE_URL");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${siteUrl}/callback?next=${encodeURIComponent(redirectTo)}`,
      },
    });

    if (error) {
      setError(error.message);
      onAuthEvent?.onSignInFailure?.("", error.message);
      setOauthLoading(null);
    }
  }

  // Check if email is valid format - stricter validation
  function isValidEmail(emailValue: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(emailValue.trim());
  }

  // Handle form submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Validate email first
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    // If password field isn't showing yet, show it
    if (!showPassword) {
      setShowPassword(true);
      return;
    }

    // Validate password
    if (!password) {
      setError("Please enter your password");
      return;
    }

    // Attempt sign in
    setLoading(true);

    // Log sign-in attempt
    onAuthEvent?.onSignInAttempt?.(email.trim(), "email");

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        const lowerMessage = signInError.message.toLowerCase();
        let errorReason: string;

        if (lowerMessage.includes("invalid login credentials")) {
          setError("Invalid email or password. Please try again.");
          errorReason = "invalid_credentials";
        } else if (lowerMessage.includes("email not confirmed")) {
          // Show email verification pending screen instead of error
          setEmailVerificationPending(true);
          errorReason = "email_not_confirmed";
          setLoading(false);
          return;
        } else if (
          lowerMessage.includes("too many requests") ||
          lowerMessage.includes("rate limit")
        ) {
          setError("Too many attempts. Please wait a moment.");
          errorReason = "rate_limit";
        } else {
          setError("Unable to sign in. Please try again.");
          errorReason = signInError.message;
        }

        // Log sign-in failure
        onAuthEvent?.onSignInFailure?.(email.trim(), errorReason);

        setLoading(false);
        return;
      }

      // Get user session to extract userId
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const userId = session?.user?.id || "";

      // Check if MFA is required
      const { data: aalData } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

      if (aalData?.nextLevel === "aal2" && aalData?.currentLevel === "aal1") {
        // Log MFA required
        onAuthEvent?.onMFARequired?.(userId, email.trim());

        setLoading(false);
        setShowMFA(true);
      } else {
        // Log sign-in success (without MFA)
        onAuthEvent?.onSignInSuccess?.(userId, email.trim(), false);

        // Use hard redirect to ensure middleware runs with fresh session
        window.location.href = redirectTo;
      }
    } catch (err) {
      logError(err, {
        component: "SigninForm",
        action: "signIn",
      });
      setError("An unexpected error occurred. Please try again.");

      // Log sign-in failure
      onAuthEvent?.onSignInFailure?.(
        email.trim(),
        err instanceof Error ? err.message : "unexpected_error",
      );

      setLoading(false);
    }
  }

  const handleMFACancel = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setShowMFA(false);
    setEmail("");
    setPassword("");
    router.replace(mergedLinks.signIn);
  };

  if (showMFA && MFAChallengeComponent) {
    return (
      <MFAChallengeComponent
        redirectTo={redirectTo}
        onSuccess={() => {
          router.push(redirectTo);
          router.refresh();
        }}
        onCancel={handleMFACancel}
      />
    );
  }

  const showGoogle = oauthProviders.includes("google");
  const showMicrosoft = oauthProviders.includes("azure");

  return (
    <AuthFormLayout
      homeUrl={mergedLinks.home}
      showHomeLink={!mfaRequired}
      LinkComponent={Link}
      className={className}
      footer={
        (termsUrl || privacyUrl) && (
          <p className="text-xs text-muted-foreground text-center mt-4">
            By continuing, you agree to our{" "}
            {termsUrl && (
              <a
                href={termsUrl}
                className="underline underline-offset-4 hover:text-foreground"
              >
                Terms
              </a>
            )}
            {termsUrl && privacyUrl && " and "}
            {privacyUrl && (
              <a
                href={privacyUrl}
                className="underline underline-offset-4 hover:text-foreground"
              >
                Privacy Policy
              </a>
            )}
            .
          </p>
        )
      }
    >
      {/* Header */}
      <div className="space-y-2">
        <AuthHeader
          logo={logo}
          title={`Sign in to ${appName}`}
          ImageComponent={Image}
        />
        <p className="text-sm text-muted-foreground text-center">
          Don&apos;t have an account?{" "}
          <Link
            href={mergedLinks.signUp}
            className="text-foreground font-medium hover:underline underline-offset-4"
          >
            Sign up
          </Link>
        </p>
      </div>

      {/* OAuth Buttons */}
      {(showGoogle || showMicrosoft) && (
        <div className="grid gap-3">
          {showGoogle && (
            <Button
              type="button"
              variant="outline"
              size="lg"
              disabled={googleComingSoon || loading || oauthLoading !== null}
              onClick={
                googleComingSoon ? undefined : () => handleOAuthSignIn("google")
              }
              className={cn(
                "w-full bg-muted/50 border-border hover:bg-muted",
                googleComingSoon
                  ? "text-muted-foreground justify-center"
                  : "text-foreground",
              )}
            >
              {oauthLoading === "google" ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <GoogleIcon
                  className={cn("h-5 w-5", googleComingSoon && "opacity-50")}
                />
              )}
              <span>
                {oauthLoading === "google"
                  ? "Redirecting..."
                  : "Continue with Google"}
              </span>
              {googleComingSoon && !oauthLoading && (
                <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded ml-2">
                  Soon
                </span>
              )}
            </Button>
          )}
          {showMicrosoft && (
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => handleOAuthSignIn("azure")}
              disabled={loading || oauthLoading !== null}
              className="w-full bg-muted/50 border-border text-foreground hover:bg-muted"
            >
              {oauthLoading === "azure" ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <MicrosoftIcon className="h-5 w-5" />
              )}
              <span>
                {oauthLoading === "azure"
                  ? "Redirecting..."
                  : "Continue with Microsoft"}
              </span>
            </Button>
          )}
        </div>
      )}

      {/* Divider */}
      {(showGoogle || showMicrosoft) && <OrDivider />}

      {/* Email/Password Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {message && (
          <p className="text-sm text-green-400 text-center">{message}</p>
        )}

        {/* Error message */}
        {error && (
          <div className="flex items-center gap-2 rounded-md bg-red-500/10 border border-red-500/20 px-3 py-2 text-sm text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Email Field */}
        <div className="space-y-2">
          <FieldLabel htmlFor="email" className="text-muted-foreground">
            Email Address
          </FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(null);
            }}
            aria-invalid={!!error || undefined}
            autoComplete="email"
            autoFocus
            disabled={loading}
            className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/50"
          />
        </div>

        {/* Password Field - Slides in after valid email */}
        {showPassword && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor="password" className="text-muted-foreground">
                Password
              </FieldLabel>
              <Link
                href={`${mergedLinks.forgotPassword}?email=${encodeURIComponent(email)}`}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <PasswordInput
              id="password"
              ref={passwordRef}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
              aria-invalid={!!error || undefined}
              autoComplete="current-password"
              disabled={loading}
              className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/50"
            />
          </div>
        )}

        <Button
          type="submit"
          size="lg"
          loading={loading}
          disabled={
            oauthLoading !== null ||
            !email.trim() ||
            (showPassword && !password)
          }
          className="w-full"
        >
          {loading ? "Signing in..." : showPassword ? "Sign in" : "Continue"}
        </Button>
      </form>
    </AuthFormLayout>
  );
}
