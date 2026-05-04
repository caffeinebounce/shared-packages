import type { EmailOtpType, SupabaseClient, User } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export type AuthCallbackFlow = "oauth" | "otp";
export type AuthCallbackHookErrorMode = "block" | "ignore";

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
}

const POST_AUTH_HOOK_ERROR_MESSAGE =
  "Authentication completed, but setup failed. Please try again.";

function getSafeRedirectPath(
  candidate: string | null | undefined,
  fallback: string,
) {
  if (candidate?.startsWith("/") && !candidate.startsWith("//")) {
    return candidate;
  }

  return fallback;
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
}: AuthCallbackConfig) {
  return async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");
    const tokenHash = requestUrl.searchParams.get("token_hash");
    const otpType = requestUrl.searchParams.get("type") as EmailOtpType | null;
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
      // Check if this is a linking error (user came from security settings)
      const isLinkingFlow =
        next.includes("/profile") || next.includes("/settings");

      // For linking errors, redirect back to the security page with the error
      if (isLinkingFlow) {
        // Create user-friendly error messages for common linking errors
        let userMessage = errorDescription || error;
        if (
          errorDescription?.includes("already linked") ||
          errorDescription?.includes("identity already exists")
        ) {
          userMessage =
            "This account is already connected to another Compass account. Each external account can only be linked to one Compass account.";
        }

        // Parse next to handle hash fragments properly
        const nextUrl = new URL(next, origin);
        nextUrl.searchParams.set("link_error", userMessage);
        return NextResponse.redirect(nextUrl.toString());
      }

      return NextResponse.redirect(
        `${origin}${signInPath}?error=${encodeURIComponent(errorDescription || error)}`,
      );
    }

    if (code) {
      const supabase = await createClient();
      const { error: exchangeError } =
        await supabase.auth.exchangeCodeForSession(code);

      if (!exchangeError) {
        // Check if user is an admin and redirect accordingly
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const postAuthHookRedirect = await runPostAuthHook({
            postAuthHook,
            postAuthHookErrorMode,
            supabase,
            user,
            request,
            origin,
            redirectPath: next,
            flow: "oauth",
            signInPath,
          });

          if (postAuthHookRedirect) {
            return postAuthHookRedirect;
          }

          // Fetch user's role and admin approval status from profiles
          const { data: profile } = await supabase
            .from("profiles")
            .select("role, admin_approval_status")
            .eq("id", user.id)
            .single();

          // Check if user has an admin role (admin:super or admin:program)
          const isAdmin = profile?.role?.startsWith("admin:");
          const isPendingApproval =
            profile?.admin_approval_status === "pending";

          if (isAdmin) {
            // If admin is pending approval, redirect to pending page
            if (isPendingApproval) {
              return NextResponse.redirect(`${origin}/admin-pending`);
            }

            // Check if we should use admin subdomain
            const url = new URL(origin);
            const hostname = url.hostname;

            // Only use admin subdomain on known production Compass domains.
            // For local/Tailscale/dev hosts, keep same host and use /admin/dashboard.
            const isCompassProductionHost =
              hostname === "thecapitalcompass.ai" ||
              hostname === "app.thecapitalcompass.ai" ||
              hostname.endsWith(".thecapitalcompass.ai");

            if (isCompassProductionHost) {
              url.hostname = hostname.startsWith("admin.")
                ? hostname
                : "admin.thecapitalcompass.ai";
              url.pathname = "/dashboard"; // On subdomain, we use /dashboard not /admin/dashboard
              return NextResponse.redirect(url.toString());
            }

            // In development/non-prod hosts, use /admin/dashboard path
            return NextResponse.redirect(`${origin}/admin/dashboard`);
          }
        }

        return NextResponse.redirect(`${origin}${next}`);
      }

      // Check if this is a linking error
      const isLinkingFlow =
        next.includes("/profile") || next.includes("/settings");
      const errorMessage = exchangeError.message;

      if (isLinkingFlow) {
        // Create user-friendly error messages for common linking errors
        let userMessage = errorMessage;
        if (
          errorMessage.includes("already linked") ||
          errorMessage.includes("identity already exists") ||
          errorMessage.includes("already registered")
        ) {
          userMessage =
            "This account is already connected to another Compass account. Each external account can only be linked to one Compass account.";
        }

        const nextUrl = new URL(next, origin);
        nextUrl.searchParams.set("link_error", userMessage);
        return NextResponse.redirect(nextUrl.toString());
      }

      return NextResponse.redirect(
        `${origin}${signInPath}?error=${encodeURIComponent(errorMessage)}`,
      );
    }

    if (tokenHash || otpType) {
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
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const postAuthHookRedirect = await runPostAuthHook({
            postAuthHook,
            postAuthHookErrorMode,
            supabase,
            user,
            request,
            origin,
            redirectPath: next,
            flow: "otp",
            otpType,
            signInPath,
          });

          if (postAuthHookRedirect) {
            return postAuthHookRedirect;
          }
        }

        return NextResponse.redirect(`${origin}${next}`);
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
