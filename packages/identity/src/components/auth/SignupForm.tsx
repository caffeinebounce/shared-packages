"use client";

import { getClientOrigin } from "@caffeinebounce/shared-utils";
import {
  Button,
  Checkbox,
  cn,
  defaultPasswordRules,
  FieldError,
  FieldLabel,
  Input,
  PasswordInput,
  PasswordRequirements,
} from "@caffeinebounce/ui";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { type ComponentType, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import isEmail from "validator/lib/isEmail";
import type { AuthFormConfig, AuthLinks, OAuthProvider } from "../../types";
import { defaultAuthLinks } from "../../types";
import { AuthFormLayout } from "../shared/AuthFormLayout";
import { AuthHeader } from "../shared/AuthHeader";
import { GoogleIcon, MicrosoftIcon } from "../shared/OAuthIcons";
import { OrDivider } from "../shared/OrDivider";
import { EmailVerificationPending } from "./EmailVerificationPending";
import { clearStalePKCEState, sanitizeSignupError } from "./utils";

/**
 * Authentication event logging callbacks for sign-up
 */
export interface SignupEventCallbacks {
  onSignUpAttempt?: (email: string, provider?: string) => void;
  onSignUpSuccess?: (userId: string, email: string) => void;
  onSignUpFailure?: (email: string, reason: string) => void;
  onEmailVerificationSent?: (email: string) => void;
}

/**
 * Configuration for a consent checkbox (program updates, marketing, etc.)
 */
export interface ConsentItem {
  /** Unique identifier, used as the key in user metadata (e.g., "email_marketing") */
  id: string;
  /**
   * Label content displayed next to the checkbox.
   * Note: Do not include a required indicator (*) in the label text - the component
   * will automatically append it when required: true.
   */
  label: React.ReactNode;
  /** Optional description below the label (can include links) */
  description?: React.ReactNode;
  /** Whether this consent is required to submit the form */
  required?: boolean;
  /** Default checked state */
  defaultChecked?: boolean;
  /** Error message shown when required consent is not given */
  errorMessage?: string;
}

export interface SignupFormProps extends AuthFormConfig {
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
  onAuthEvent?: SignupEventCallbacks;
  /** Array of consent items to display (e.g., marketing opt-in, terms acceptance) */
  consentItems?: ConsentItem[];
  /** Position of consent checkboxes relative to submit button (default: "above") */
  consentPosition?: "above" | "below";
  /** Size of consent text - compact uses smaller text (default: "default") */
  consentSize?: "default" | "compact";
}

/**
 * SignupForm - Configurable sign-up form with email/password and OAuth support
 */
export function SignupForm({
  createClient,
  logo,
  appName = "your account",
  termsUrl = "/terms",
  privacyUrl = "/privacy",
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
  consentItems = [],
  consentPosition = "above",
  consentSize = "default",
}: SignupFormProps) {
  const mergedLinks = { ...defaultAuthLinks, ...links };
  const Link = LinkComponent;
  const Image = ImageComponent;
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<OAuthProvider | null>(null);

  // Dynamic consent state - initialize from consentItems defaults
  const [consentState, setConsentState] = useState<Record<string, boolean>>(
    () =>
      Object.fromEntries(
        consentItems.map((item) => [item.id, item.defaultChecked ?? false]),
      ),
  );
  const [consentTouched, setConsentTouched] = useState(false);

  // Sync consentState when consentItems changes (add/remove items, change defaults)
  useEffect(() => {
    setConsentState((prev) => {
      // Build new state from current consentItems
      const newState: Record<string, boolean> = {};

      for (const item of consentItems) {
        // Preserve existing user choice if item was already present
        if (item.id in prev) {
          newState[item.id] = prev[item.id];
        } else {
          // New item - use defaultChecked
          newState[item.id] = item.defaultChecked ?? false;
        }
      }

      return newState;
    });
  }, [consentItems]);

  // Check if all required consents are given
  const requiredConsentsValid = useMemo(
    () =>
      consentItems
        .filter((item) => item.required)
        .every((item) => consentState[item.id]),
    [consentItems, consentState],
  );

  const isEmailValid = useMemo(() => isEmail(email), [email]);
  const showEmailError = emailTouched && email && !isEmailValid;

  // Password validation - check all rules are met
  const allPasswordRulesMet = useMemo(
    () => defaultPasswordRules.every((rule) => rule.validator(password)),
    [password],
  );
  const passwordInvalid =
    passwordTouched && password.length > 0 && !allPasswordRulesMet;
  const passwordsDoNotMatch =
    confirmPasswordTouched &&
    confirmPassword.length > 0 &&
    password !== confirmPassword;

  // Get the appropriate origin for this environment (handles preview vs production)
  const siteUrl = getClientOrigin("NEXT_PUBLIC_SITE_URL");

  async function handleOAuthSignIn(provider: OAuthProvider) {
    setOauthLoading(provider);

    // Log OAuth sign-up attempt
    onAuthEvent?.onSignUpAttempt?.("", provider);

    // Clear any stale PKCE state from previous OAuth attempts
    // This prevents "invalid session" errors when signing in after sign-out
    clearStalePKCEState();

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${siteUrl}/callback?next=${mergedLinks.defaultRedirect}`,
      },
    });

    if (error) {
      toast.error(sanitizeSignupError(error.message));
      onAuthEvent?.onSignUpFailure?.("", error.message);
      setOauthLoading(null);
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();

    if (!allPasswordRulesMet) {
      setPasswordTouched(true);
      return;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordTouched(true);
      return;
    }

    // Validate required consents
    if (!requiredConsentsValid) {
      setConsentTouched(true);
      return;
    }

    setLoading(true);

    // Log sign-up attempt
    onAuthEvent?.onSignUpAttempt?.(email.trim(), "email");

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${siteUrl}/callback`,
        // Pass all consent values as user metadata
        data: consentState,
      },
    });

    if (error) {
      // Show user-friendly error via toast (sanitized to hide technical details)
      toast.error(sanitizeSignupError(error.message));

      // Log sign-up failure with original error for debugging
      onAuthEvent?.onSignUpFailure?.(email.trim(), error.message);

      setLoading(false);
    } else if (data.user && !data.session) {
      // Email confirmation required
      const userId = data.user.id;

      // Log sign-up success
      onAuthEvent?.onSignUpSuccess?.(userId, email.trim());

      // Log verification email sent
      onAuthEvent?.onEmailVerificationSent?.(email.trim());

      setSuccess(true);
      setLoading(false);
    } else if (data.user) {
      // No email confirmation required (auto-confirm enabled)
      const userId = data.user.id;

      // Log sign-up success
      onAuthEvent?.onSignUpSuccess?.(userId, email.trim());

      router.push(mergedLinks.defaultRedirect);
      router.refresh();
    } else {
      // Defensive fallback: should never happen as Supabase always returns
      // data.user on successful signup. Kept for robustness against API changes.
      onAuthEvent?.onSignUpFailure?.(email.trim(), "no_user_data_in_response");
      toast.error("Sign-up failed. Please try again.");
      setLoading(false);
    }
  }

  if (success) {
    return (
      <EmailVerificationPending
        email={email}
        logo={logo}
        ImageComponent={Image}
        createClient={createClient}
        redirectTo={mergedLinks.home}
        className={className}
      />
    );
  }

  const showGoogle = oauthProviders.includes("google");
  const showMicrosoft = oauthProviders.includes("azure");

  return (
    <AuthFormLayout
      homeUrl={mergedLinks.home}
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
          title={`Sign up for ${appName}`}
          ImageComponent={Image}
        />
        <p className="text-sm text-muted-foreground text-center">
          Already have an account?{" "}
          <Link
            href={mergedLinks.signIn}
            className="text-foreground font-medium hover:underline underline-offset-4"
          >
            Sign in
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
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <GoogleIcon
                  className={cn("size-5", googleComingSoon && "opacity-50")}
                />
              )}
              {oauthLoading === "google"
                ? "Redirecting..."
                : "Continue with Google"}
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
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <MicrosoftIcon className="size-5" />
              )}
              {oauthLoading === "azure"
                ? "Redirecting..."
                : "Continue with Microsoft"}
            </Button>
          )}
        </div>
      )}

      {/* Divider */}
      {(showGoogle || showMicrosoft) && <OrDivider />}

      {/* Form */}
      <form onSubmit={handleSignUp} className="space-y-4">
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
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setEmailTouched(true)}
            aria-invalid={showEmailError || undefined}
            required
            className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/50"
          />
          {showEmailError && (
            <FieldError className="text-destructive">
              Please enter a valid email address
            </FieldError>
          )}
        </div>

        {/* Password Fields - Show after valid email */}
        {isEmailValid && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="space-y-2">
              <FieldLabel htmlFor="password" className="text-muted-foreground">
                Password
              </FieldLabel>
              <PasswordInput
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setPasswordTouched(true)}
                aria-invalid={passwordInvalid || undefined}
                required
                className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/50"
              />
              <PasswordRequirements
                password={password}
                rules={defaultPasswordRules}
                className="text-muted-foreground"
              />
            </div>

            <div className="space-y-2">
              <FieldLabel
                htmlFor="confirm-password"
                className="text-muted-foreground"
              >
                Confirm Password
              </FieldLabel>
              <PasswordInput
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={() => setConfirmPasswordTouched(true)}
                aria-invalid={passwordsDoNotMatch || undefined}
                required
                className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/50"
              />
              {passwordsDoNotMatch && (
                <FieldError className="text-destructive">
                  Passwords do not match
                </FieldError>
              )}
            </div>

            {/* Consent Checkboxes - Above Button */}
            {consentPosition === "above" && consentItems.length > 0 && (
              <div className="space-y-3 pt-2">
                {consentItems.map((item) => {
                  const isChecked = consentState[item.id] ?? false;
                  const hasError =
                    consentTouched && item.required && !isChecked;
                  const domId = `consent-${item.id}`;
                  const labelId = `${domId}-label`;

                  return (
                    <div key={item.id}>
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id={domId}
                          checked={isChecked}
                          onCheckedChange={(checked) =>
                            setConsentState((prev) => ({
                              ...prev,
                              [item.id]: checked === true,
                            }))
                          }
                          aria-invalid={hasError || undefined}
                          aria-labelledby={labelId}
                          className={consentSize === "compact" ? "mt-0.5" : ""}
                        />
                        <div className="grid gap-1 leading-none">
                          <div
                            id={labelId}
                            className={cn(
                              "font-medium leading-tight",
                              consentSize === "compact"
                                ? "text-xs"
                                : "text-sm leading-none",
                            )}
                          >
                            {item.label}
                            {item.required && " *"}
                          </div>
                          {item.description && (
                            <p
                              className={cn(
                                "text-muted-foreground leading-tight",
                                consentSize === "compact"
                                  ? "text-[11px]"
                                  : "text-xs",
                              )}
                            >
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                      {hasError && (
                        <FieldError className="ml-7">
                          {item.errorMessage || `This field is required.`}
                        </FieldError>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <Button
          type="submit"
          size="lg"
          disabled={loading || oauthLoading !== null || !isEmailValid}
          className="w-full"
        >
          {loading ? "Signing up..." : "Sign Up"}
        </Button>

        {/* Consent Checkboxes - Below Button */}
        {consentPosition === "below" &&
          consentItems.length > 0 &&
          isEmailValid && (
            <div className="space-y-3 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
              {consentItems.map((item) => {
                const isChecked = consentState[item.id] ?? false;
                const hasError = consentTouched && item.required && !isChecked;
                const domId = `consent-${item.id}`;
                const labelId = `${domId}-label`;

                return (
                  <div key={item.id}>
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id={domId}
                        checked={isChecked}
                        onCheckedChange={(checked) =>
                          setConsentState((prev) => ({
                            ...prev,
                            [item.id]: checked === true,
                          }))
                        }
                        aria-invalid={hasError || undefined}
                        aria-labelledby={labelId}
                        className={consentSize === "compact" ? "mt-0.5" : ""}
                      />
                      <div className="grid gap-1 leading-none">
                        <div
                          id={labelId}
                          className={cn(
                            "font-medium leading-tight",
                            consentSize === "compact"
                              ? "text-xs"
                              : "text-sm leading-none",
                          )}
                        >
                          {item.label}
                          {item.required && " *"}
                        </div>
                        {item.description && (
                          <p
                            className={cn(
                              "text-muted-foreground leading-tight",
                              consentSize === "compact"
                                ? "text-[11px]"
                                : "text-xs",
                            )}
                          >
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                    {hasError && (
                      <FieldError className="ml-7">
                        {item.errorMessage || `This field is required.`}
                      </FieldError>
                    )}
                  </div>
                );
              })}
            </div>
          )}
      </form>
    </AuthFormLayout>
  );
}
