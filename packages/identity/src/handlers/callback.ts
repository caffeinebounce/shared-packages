import type { SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export interface AuthCallbackConfig {
  /** Async Supabase client factory (for server-side) */
  createClient: () => Promise<SupabaseClient>;
  /** Default redirect path after successful auth */
  defaultRedirect?: string;
  /** Sign-in page path for error redirects */
  signInPath?: string;
}

/**
 * createAuthCallbackHandler - Factory for OAuth/email callback route handler
 *
 * Creates a GET handler that exchanges authorization codes for sessions.
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
 * });
 * ```
 */
export function createAuthCallbackHandler({
  createClient,
  defaultRedirect = "/dashboard",
  signInPath = "/signin",
}: AuthCallbackConfig) {
  return async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");
    const nextParam = requestUrl.searchParams.get("next") ?? defaultRedirect;
    // Validate that next is a relative path to prevent open redirect attacks
    const next =
      nextParam.startsWith("/") && !nextParam.startsWith("//")
        ? nextParam
        : defaultRedirect;
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
          // Fetch user's admin role from profiles
          const { data: profile } = await supabase
            .from("profiles")
            .select("admin_role")
            .eq("id", user.id)
            .single();

          // If user has an admin role, redirect to admin dashboard
          if (profile?.admin_role) {
            // Check if we should use admin subdomain
            const url = new URL(origin);
            const hostname = url.hostname;

            // In production, redirect to admin subdomain
            if (
              !hostname.includes("localhost") &&
              !hostname.includes("127.0.0.1")
            ) {
              url.hostname = `admin.${hostname}`;
              url.pathname = "/dashboard"; // On subdomain, we use /dashboard not /admin/dashboard
              return NextResponse.redirect(url.toString());
            }

            // In development, use /admin/dashboard path
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

    return NextResponse.redirect(
      `${origin}${signInPath}?error=No authorization code received`,
    );
  };
}
