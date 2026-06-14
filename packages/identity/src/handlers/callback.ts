import type { EmailOtpType, SupabaseClient, User } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export type AuthCallbackFlow = "oauth" | "otp";
export type AuthCallbackHookErrorMode = "block" | "ignore";
export type AuthCallbackRedirectTarget =
  | string
  | URL
  | Response
  | null
  | undefined;
export type AuthCallbackErrorSource = "oauth_error" | "code_exchange";

export interface AuthCallbackHookContext {
  /** Resolved Supabase client after callback exchange/verification succeeds */
  supabase: SupabaseClient;
  /** Authenticated Supabase user returned by getUser() */
  user: User;
  /** Original callback request */
  request: Request;
  /** Request origin used for final redirects */
  origin: string;
  /** Safe relative redirect path selected for this callback */
  redirectPath: string;
  /** Callback flow that established the session */
  flow: AuthCallbackFlow;
  /** OTP verification type, present for token_hash callbacks */
  otpType?: EmailOtpType;
}

export type AuthCallbackHook = (
  context: AuthCallbackHookContext,
) => void | Promise<void>;

export type AuthCallbackSuccessRedirectResolver = (
  context: AuthCallbackHookContext,
) => AuthCallbackRedirectTarget | Promise<AuthCallbackRedirectTarget>;

export interface AuthCallbackLinkingFlowContext {
  /** Original callback request */
  request: Request;
  /** Request origin used for redirects */
  origin: string;
  /** Safe relative redirect path selected for this callback */
  redirectPath: string;
}

export type AuthCallbackLinkingFlowDetector = (
  context: AuthCallbackLinkingFlowContext,
) => boolean;

export interface AuthCallbackLinkingErrorContext
  extends AuthCallbackLinkingFlowContext {
  /** OAuth error code or code-exchange error name when available */
  error: string;
  /** OAuth error description, when supplied by the provider */
  errorDescription: string | null;
  /** Default error message selected for the user */
  message: string;
  /** Callback phase that produced the error */
  source: AuthCallbackErrorSource;
}

export type AuthCallbackLinkingErrorMessageResolver = (
  context: AuthCallbackLinkingErrorContext,
) => string | Promise<string>;

export interface AuthCallbackConfig {
  /** Async Supabase client factory (for server-side) */
  createClient: () => Promise<SupabaseClient>;
  /** Default redirect path after successful auth */
  defaultRedirect?: string;
  /** Sign-in page path for error redirects */
  signInPath?: string;
  /**
   * Optional hook that runs after a successful auth callback and getUser().
   * Use this for app-local profile hydration or other session-adjacent setup.
   */
  postAuthHook?: AuthCallbackHook;
  /**
   * How to handle postAuthHook failures.
   * "block" redirects to signInPath with a generic setup error.
   * "ignore" allows the normal success redirect to continue.
   */
  postAuthHookErrorMode?: AuthCallbackHookErrorMode;
  /**
   * Optional resolver for app-specific success redirects after auth succeeds.
   * Use this for product-owned routing such as admin approval or subdomains.
   */
  resolveSuccessRedirect?: AuthCallbackSuccessRedirectResolver;
  /**
   * Optional detector for deciding whether an auth error came from account
   * linking. Defaults to common profile/settings redirect paths.
   */
  isLinkingFlow?: AuthCallbackLinkingFlowDetector;
  /**
   * Optional resolver for product-specific account-linking error copy.
   * Defaults remain product-neutral.
   */
  resolveLinkingErrorMessage?: AuthCallbackLinkingErrorMessageResolver;
}

const POST_AUTH_HOOK_ERROR_MESSAGE =
  "Authentication completed, but setup failed. Please try again.";
const DEFAULT_LINKING_ACCOUNT_ERROR_MESSAGE =
  "This account is already connected to another account. Each external account can only be linked to one account.";
const EMAIL_OTP_TYPES = [
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
] as const satisfies readonly EmailOtpType[];

function getSafeRedirectPath(
  candidate: string | null | undefined,
  fallback: string,
) {
  if (candidate?.startsWith("/") && !candidate.startsWith("//")) {
    return candidate;
  }

  return fallback;
}

function getEmailOtpType(value: string | null) {
  if (!value) {
    return null;
  }

  return (EMAIL_OTP_TYPES as readonly string[]).includes(value)
    ? (value as EmailOtpType)
    : null;
}

function isDefaultLinkingFlow({
  redirectPath,
}: AuthCallbackLinkingFlowContext) {
  return (
    redirectPath.includes("/profile") || redirectPath.includes("/settings")
  );
}

function isAlreadyLinkedAccountError(message: string) {
  return (
    message.includes("already linked") ||
    message.includes("identity already exists") ||
    message.includes("already registered")
  );
}

function getDefaultLinkingErrorMessage(message: string) {
  return isAlreadyLinkedAccountError(message)
    ? DEFAULT_LINKING_ACCOUNT_ERROR_MESSAGE
    : message;
}

async function createLinkingErrorRedirect({
  request,
  origin,
  redirectPath,
  error,
  errorDescription,
  message,
  source,
  isLinkingFlow,
  resolveLinkingErrorMessage,
}: {
  request: Request;
  origin: string;
  redirectPath: string;
  error: string;
  errorDescription: string | null;
  message: string;
  source: AuthCallbackErrorSource;
  isLinkingFlow: AuthCallbackLinkingFlowDetector;
  resolveLinkingErrorMessage?: AuthCallbackLinkingErrorMessageResolver;
}) {
  const linkingFlowContext = { request, origin, redirectPath };

  if (!isLinkingFlow(linkingFlowContext)) {
    return null;
  }

  const defaultMessage = getDefaultLinkingErrorMessage(message);
  const userMessage =
    (await resolveLinkingErrorMessage?.({
      ...linkingFlowContext,
      error,
      errorDescription,
      message,
      source,
    })) ?? defaultMessage;

  const nextUrl = new URL(redirectPath, origin);
  nextUrl.searchParams.set("link_error", userMessage);
  return NextResponse.redirect(nextUrl.toString());
}

async function runPostAuthHook({
  postAuthHook,
  postAuthHookErrorMode,
  supabase,
  user,
  request,
  origin,
  redirectPath,
  flow,
  otpType,
  signInPath,
}: {
  postAuthHook?: AuthCallbackHook;
  postAuthHookErrorMode: AuthCallbackHookErrorMode;
  supabase: SupabaseClient;
  user: User;
  request: Request;
  origin: string;
  redirectPath: string;
  flow: AuthCallbackFlow;
  otpType?: EmailOtpType;
  signInPath: string;
}) {
  if (!postAuthHook) {
    return null;
  }

  try {
    await postAuthHook({
      supabase,
      user,
      request,
      origin,
      redirectPath,
      flow,
      otpType,
    });
    return null;
  } catch {
    if (postAuthHookErrorMode === "ignore") {
      return null;
    }

    return NextResponse.redirect(
      `${origin}${signInPath}?error=${encodeURIComponent(POST_AUTH_HOOK_ERROR_MESSAGE)}`,
    );
  }
}

function createRedirectResponse(
  target: AuthCallbackRedirectTarget,
  origin: string,
) {
  if (!target) {
    return null;
  }

  if (target instanceof Response) {
    return target;
  }

  if (target instanceof URL) {
    return NextResponse.redirect(target.toString());
  }

  if (target.startsWith("/") && !target.startsWith("//")) {
    return NextResponse.redirect(`${origin}${target}`);
  }

  return NextResponse.redirect(target);
}

async function redirectAfterSuccessfulAuth({
  supabase,
  request,
  origin,
  redirectPath,
  flow,
  otpType,
  postAuthHook,
  postAuthHookErrorMode,
  signInPath,
  resolveSuccessRedirect,
}: {
  supabase: SupabaseClient;
  request: Request;
  origin: string;
  redirectPath: string;
  flow: AuthCallbackFlow;
  otpType?: EmailOtpType;
  postAuthHook?: AuthCallbackHook;
  postAuthHookErrorMode: AuthCallbackHookErrorMode;
  signInPath: string;
  resolveSuccessRedirect?: AuthCallbackSuccessRedirectResolver;
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}${redirectPath}`);
  }

  const postAuthHookRedirect = await runPostAuthHook({
    postAuthHook,
    postAuthHookErrorMode,
    supabase,
    user,
    request,
    origin,
    redirectPath,
    flow,
    otpType,
    signInPath,
  });

  if (postAuthHookRedirect) {
    return postAuthHookRedirect;
  }

  const customRedirect = await resolveSuccessRedirect?.({
    supabase,
    user,
    request,
    origin,
    redirectPath,
    flow,
    otpType,
  });
  const customRedirectResponse = createRedirectResponse(customRedirect, origin);

  if (customRedirectResponse) {
    return customRedirectResponse;
  }

  return NextResponse.redirect(`${origin}${redirectPath}`);
}

/**
 * createAuthCallbackHandler - Factory for OAuth/email callback route handler
 *
 * Creates a GET handler that exchanges authorization codes or verifies
 * token_hash OTP links for sessions.
 *
 * @example
 * ```ts
 * // app/(auth)/callback/route.ts
 * import { createAuthCallbackHandler } from "@caffeinebounce/identity";
 * import { createClient } from "@/lib/supabase/server";
 *
 * export const GET = createAuthCallbackHandler({
 *   createClient,
 *   defaultRedirect: "/dashboard",
 *   postAuthHook: async ({ user }) => {
 *     await ensureProfileRecord({
 *       userId: user.id,
 *       email: user.email ?? null,
 *       metadata: user.user_metadata,
 *     });
 *   },
 *   postAuthHookErrorMode: "ignore",
 * });
 * ```
 */
export function createAuthCallbackHandler({
  createClient,
  defaultRedirect = "/dashboard",
  signInPath = "/signin",
  postAuthHook,
  postAuthHookErrorMode = "block",
  resolveSuccessRedirect,
  isLinkingFlow = isDefaultLinkingFlow,
  resolveLinkingErrorMessage,
}: AuthCallbackConfig) {
  return async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");
    const tokenHash = requestUrl.searchParams.get("token_hash");
    const rawOtpType = requestUrl.searchParams.get("type");
    const otpType = getEmailOtpType(rawOtpType);
    const next = getSafeRedirectPath(
      requestUrl.searchParams.get("next") ??
        requestUrl.searchParams.get("redirect_to"),
      defaultRedirect,
    );
    const origin = requestUrl.origin;

    // Handle OAuth error responses
    const error = requestUrl.searchParams.get("error");
    const errorDescription = requestUrl.searchParams.get("error_description");
    if (error) {
      const message = errorDescription || error;
      const linkingErrorRedirect = await createLinkingErrorRedirect({
        request,
        origin,
        redirectPath: next,
        error,
        errorDescription,
        message,
        source: "oauth_error",
        isLinkingFlow,
        resolveLinkingErrorMessage,
      });

      if (linkingErrorRedirect) {
        return linkingErrorRedirect;
      }

      return NextResponse.redirect(
        `${origin}${signInPath}?error=${encodeURIComponent(message)}`,
      );
    }

    if (code) {
      const supabase = await createClient();
      const { error: exchangeError } =
        await supabase.auth.exchangeCodeForSession(code);

      if (!exchangeError) {
        return redirectAfterSuccessfulAuth({
          supabase,
          request,
          origin,
          redirectPath: next,
          flow: "oauth",
          postAuthHook,
          postAuthHookErrorMode,
          signInPath,
          resolveSuccessRedirect,
        });
      }

      const errorMessage = exchangeError.message;
      const linkingErrorRedirect = await createLinkingErrorRedirect({
        request,
        origin,
        redirectPath: next,
        error: "code_exchange",
        errorDescription: null,
        message: errorMessage,
        source: "code_exchange",
        isLinkingFlow,
        resolveLinkingErrorMessage,
      });

      if (linkingErrorRedirect) {
        return linkingErrorRedirect;
      }

      return NextResponse.redirect(
        `${origin}${signInPath}?error=${encodeURIComponent(errorMessage)}`,
      );
    }

    if (tokenHash || rawOtpType) {
      if (!tokenHash || !otpType) {
        return NextResponse.redirect(
          `${origin}${signInPath}?error=${encodeURIComponent("Invalid verification link")}`,
        );
      }

      const supabase = await createClient();
      const { error: verifyError } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: otpType,
      });

      if (!verifyError) {
        return redirectAfterSuccessfulAuth({
          supabase,
          request,
          origin,
          redirectPath: next,
          flow: "otp",
          otpType,
          postAuthHook,
          postAuthHookErrorMode,
          signInPath,
          resolveSuccessRedirect,
        });
      }

      return NextResponse.redirect(
        `${origin}${signInPath}?error=${encodeURIComponent(verifyError.message)}`,
      );
    }

    return NextResponse.redirect(
      `${origin}${signInPath}?error=No authorization code received`,
    );
  };
}
