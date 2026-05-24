"use client";

import { useErrorLoggerSafe as useErrorLogger } from "@caffeinebounce/logger/client";
import {
  Button,
  cn,
  FieldLabel,
  Input,
  PasswordInput,
} from "@caffeinebounce/ui/primitives";
import { AlertCircle, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  type ComponentType,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import type { SignInMethod } from "../../hooks/useLastSignIn";
import { useLastSignIn } from "../../hooks/useLastSignIn";
import type { AuthFormConfig, AuthLinks, OAuthProvider } from "../../types";
import { defaultAuthLinks } from "../../types";
import { AuthFormLayout } from "../shared/AuthFormLayout";
import { AuthHeader } from "../shared/AuthHeader";
import { GoogleIcon, MicrosoftIcon } from "../shared/OAuthIcons";
import { OrDivider } from "../shared/OrDivider";
import { EmailVerificationPending } from "./EmailVerificationPending";
import {
  buildOAuthRedirectTo,
  buildOAuthSignInOptions,
  clearStalePKCEState,
  warnAboutSupabaseRedirectAllowlist,
} from "./utils";

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
  /** Show "Coming Soon" for Microsoft OAuth */
  azureComingSoon?: boolean;
  /** When true, OAuth provider icons switch to monochrome (current text color) on hover */
  oauthIconMonochromeOnHover?: boolean;
  /** Additional className for the form container */
  className?: string;
  /** Optional callbacks for logging authentication events */
  onAuthEvent?: AuthEventCallbacks;
  /** Show hint about last used sign-in method. Default: true */
  showLastSignInHint?: boolean;
  /** Show the Home back-link on the auth form. Default: true */
  showHomeLink?: boolean;
  /** localStorage key for last sign-in data. Default: "last_signin" */
  lastSignInStorageKey?: string;
  /** Whether to show the logo inside the card. Default: true */
  showLogo?: boolean;
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
  azureComingSoon = false,
  oauthIconMonochromeOnHover = false,
  className,
  onAuthEvent,
  showLastSignInHint = true,
  showHomeLink = true,
  lastSignInStorageKey = "last_signin",
  showLogo,
}: SigninFormProps) {
  const { logError } = useErrorLogger();
  const mergedLinks = { ...defaultAuthLinks, ...links };
  const Link = LinkComponent;
  const Image = ImageComponent;

  // Last sign-in tracking
  const {
    lastSignIn,
    isLoaded: lastSignInLoaded,
    recordSignIn,
    clearLastSignIn,
  } = useLastSignIn({ storageKey: lastSignInStorageKey });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<OAuthProvider | null>(null);
  const [hoveredOAuthProvider, setHoveredOAuthProvider] =
    useState<OAuthProvider | null>(null);
  const [emailVerificationPending, setEmailVerificationPending] =
    useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);
  const oauthTimeoutRef = useRef<NodeJS.Timeout | null>(null);
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

  // Cleanup OAuth timeout on unmount
  useEffect(() => {
    return () => {
      if (oauthTimeoutRef.current) {
        clearTimeout(oauthTimeoutRef.current);
      }
    };
  }, []);

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

    // Clear any existing session to prevent stale token conflicts
    const supabase = createClient();
    await supabase.auth.signOut();

    // Clear any existing timeout before setting a new one
    if (oauthTimeoutRef.current) {
      clearTimeout(oauthTimeoutRef.current);
    }

    // Safety timeout: reset loading state if redirect doesn't happen within 5 seconds
    // This handles cases where the redirect is blocked or fails silently
    oauthTimeoutRef.current = setTimeout(() => {
      setOauthLoading(null);
    }, 5000);

    // Store pending OAuth method for recording after successful callback
    try {
      sessionStorage.setItem("pending_oauth_method", provider);
    } catch {
      // Ignore sessionStorage errors
    }

    // Always use active browser origin so dev/preview/Tailscale callbacks return to the same environment.
    const siteUrl = window.location.origin.replace(/\/$/, "");
    const oauthRedirectTo = buildOAuthRedirectTo(siteUrl, redirectTo);
    warnAboutSupabaseRedirectAllowlist(siteUrl);
    const startPayload = {
      provider,
      href: window.location.href,
      origin: window.location.origin,
      host: window.location.host,
      siteUrl,
      oauthOriginSource: "window",
      redirectTo,
      oauthRedirectTo,
    };
    console.info("[auth-debug] OAuth signin start", startPayload);
    console.info(`[auth-debug-json] start=${JSON.stringify(startPayload)}`);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: buildOAuthSignInOptions(provider, oauthRedirectTo, {
        skipBrowserRedirect: true,
      }),
    });

    if (!error && data?.url) {
      let providerRedirectTo: string | null = null;
      try {
        providerRedirectTo = new URL(data.url).searchParams.get("redirect_to");
      } catch {
        // ignore parse errors
      }

      const successPayload = {
        provider,
        oauthRedirectTo,
        providerUrl: data.url,
        providerRedirectTo,
      };
      console.info("[auth-debug] OAuth signin success", successPayload);
      console.info(
        `[auth-debug-json] success=${JSON.stringify(successPayload)}`,
      );
      window.location.assign(data.url);
      return;
    }

    if (error) {
      const errorPayload = {
        provider,
        oauthRedirectTo,
        message: error.message,
      };
      console.error("[auth-debug] OAuth signin error", errorPayload);
      console.error(`[auth-debug-json] error=${JSON.stringify(errorPayload)}`);
      if (oauthTimeoutRef.current) {
        clearTimeout(oauthTimeoutRef.current);
        oauthTimeoutRef.current = null;
      }
      setError(error.message);
      onAuthEvent?.onSignInFailure?.("", error.message);
      setOauthLoading(null);
    }
    // Note: On successful OAuth, the browser navigates to the provider's auth page,
    // unloading this page. The cleanup useEffect handles clearing the timeout.
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

        // Record last sign-in method
        recordSignIn("email", email.trim());

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
          // Record last sign-in method (MFA still counts as email sign-in)
          recordSignIn("email", email.trim());
          router.push(redirectTo);
          router.refresh();
        }}
        onCancel={handleMFACancel}
      />
    );
  }

  const showGoogle = oauthProviders.includes("google");
  const showMicrosoft = oauthProviders.includes("azure");

  function handleOAuthHover(provider: OAuthProvider) {
    setHoveredOAuthProvider(provider);
  }

  function handleOAuthHoverEnd(
    event:
      | ReactMouseEvent<HTMLButtonElement>
      | ReactPointerEvent<HTMLButtonElement>,
  ) {
    const relatedTarget = event.relatedTarget;
    if (
      relatedTarget instanceof Node &&
      event.currentTarget.contains(relatedTarget)
    ) {
      return;
    }
    setHoveredOAuthProvider(null);
  }

  // Check if a method matches the last sign-in for highlighting
  const isLastMethod = (method: SignInMethod) =>
    showLastSignInHint && lastSignIn?.method === method;

  return (
    <AuthFormLayout
      homeUrl={mergedLinks.home}
      showHomeLink={showHomeLink && !mfaRequired}
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
          logo={showLogo !== false ? logo : undefined}
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
              onMouseOver={() => handleOAuthHover("google")}
              onMouseOut={handleOAuthHoverEnd}
              onPointerEnter={() => handleOAuthHover("google")}
              onPointerLeave={handleOAuthHoverEnd}
              onFocus={() => handleOAuthHover("google")}
              onBlur={() => setHoveredOAuthProvider(null)}
              className={cn(
                "w-full bg-muted/50 border-border hover:bg-muted relative",
                googleComingSoon
                  ? "text-muted-foreground justify-center"
                  : "text-foreground",
                !googleComingSoon && isLastMethod("google")
                  ? "justify-between"
                  : "justify-center",
              )}
            >
              <span
                className={cn(
                  "inline-flex items-center gap-2 transition-opacity duration-150",
                  oauthLoading === "google" ? "opacity-0" : "opacity-100",
                )}
              >
                <GoogleIcon
                  className={cn("size-5", googleComingSoon && "opacity-50")}
                  monochrome={
                    oauthIconMonochromeOnHover &&
                    hoveredOAuthProvider === "google"
                  }
                />
                Continue with Google
                {googleComingSoon && (
                  <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                    Soon
                  </span>
                )}
              </span>
              {isLastMethod("google") && !oauthLoading && (
                <span className="px-1.5 py-0.5 text-[10px] font-medium bg-primary/10 text-primary border border-primary/30 rounded z-10 relative">
                  Last Used
                </span>
              )}
              {oauthLoading === "google" && (
                <span className="absolute inset-0 inline-flex items-center justify-center gap-2 bg-muted/50">
                  <Loader2 className="size-5 animate-spin" />
                  Redirecting...
                </span>
              )}
            </Button>
          )}
          {showMicrosoft && (
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={
                azureComingSoon ? undefined : () => handleOAuthSignIn("azure")
              }
              disabled={azureComingSoon || loading || oauthLoading !== null}
              onMouseOver={() => handleOAuthHover("azure")}
              onMouseOut={handleOAuthHoverEnd}
              onPointerEnter={() => handleOAuthHover("azure")}
              onPointerLeave={handleOAuthHoverEnd}
              onFocus={() => handleOAuthHover("azure")}
              onBlur={() => setHoveredOAuthProvider(null)}
              className={cn(
                "w-full bg-muted/50 border-border hover:bg-muted relative",
                azureComingSoon
                  ? "text-muted-foreground justify-center"
                  : "text-foreground",
                !azureComingSoon && isLastMethod("azure")
                  ? "justify-between"
                  : "justify-center",
              )}
            >
              <span
                className={cn(
                  "inline-flex items-center gap-2 transition-opacity duration-150",
                  oauthLoading === "azure" ? "opacity-0" : "opacity-100",
                )}
              >
                <MicrosoftIcon
                  className={cn("size-5", azureComingSoon && "opacity-50")}
                  monochrome={
                    oauthIconMonochromeOnHover &&
                    hoveredOAuthProvider === "azure"
                  }
                />
                Continue with Microsoft
                {azureComingSoon && (
                  <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                    Soon
                  </span>
                )}
              </span>
              {isLastMethod("azure") && !azureComingSoon && !oauthLoading && (
                <span className="px-1.5 py-0.5 text-[10px] font-medium bg-primary/10 text-primary border border-primary/30 rounded z-10 relative">
                  Last Used
                </span>
              )}
              {oauthLoading === "azure" && (
                <span className="absolute inset-0 inline-flex items-center justify-center gap-2 bg-muted/50">
                  <Loader2 className="size-5 animate-spin" />
                  Redirecting...
                </span>
              )}
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
          <div className="animate-in fade-in slide-in-from-top-1 duration-200 flex items-center gap-2 rounded-md bg-red-500/10 border border-red-500/20 px-3 py-2 text-sm text-red-400">
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
