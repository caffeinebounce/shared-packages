import type { SupabaseClient } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createAuthCallbackHandler } from "./callback";

// Mock NextResponse
vi.mock("next/server", () => ({
  NextResponse: {
    redirect: vi.fn((url: string) => ({
      type: "redirect",
      url,
    })),
  },
}));

describe("createAuthCallbackHandler", () => {
  const mockSupabase = {
    auth: {
      exchangeCodeForSession: vi.fn(),
      verifyOtp: vi.fn(),
      getUser: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
    })),
  };

  const mockCreateClient = vi.fn(
    async () => mockSupabase as unknown as SupabaseClient,
  );

  const resolveConsumerAdminRedirect = async ({
    supabase,
    user,
    origin,
  }: Parameters<
    NonNullable<
      Parameters<typeof createAuthCallbackHandler>[0]["resolveSuccessRedirect"]
    >
  >[0]) => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, admin_approval_status")
      .eq("id", user.id)
      .single();

    const isAdmin = profile?.role?.startsWith("admin:");
    const isPendingApproval = profile?.admin_approval_status === "pending";

    if (!isAdmin) {
      return null;
    }

    if (isPendingApproval) {
      return "/admin-pending";
    }

    const url = new URL(origin);
    const hostname = url.hostname;
    const isProductionHost =
      hostname === "thecapitalcompass.ai" ||
      hostname === "app.thecapitalcompass.ai" ||
      hostname.endsWith(".thecapitalcompass.ai");

    if (isProductionHost) {
      url.hostname = hostname.startsWith("admin.")
        ? hostname
        : "admin.thecapitalcompass.ai";
      url.pathname = "/dashboard";
      return url;
    }

    return "/admin/dashboard";
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({ error: null });
    mockSupabase.auth.verifyOtp.mockResolvedValue({ error: null });
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null }),
        }),
      }),
    });
  });

  describe("open redirect prevention", () => {
    it("allows relative paths", async () => {
      const handler = createAuthCallbackHandler({
        createClient: mockCreateClient,
        defaultRedirect: "/dashboard",
      });

      const request = new Request(
        "https://example.com/callback?code=abc&next=/profile",
      );
      const response = await handler(request);

      expect(response.url).toBe("https://example.com/profile");
    });

    it("blocks protocol-relative URLs (//)", async () => {
      const handler = createAuthCallbackHandler({
        createClient: mockCreateClient,
        defaultRedirect: "/dashboard",
      });

      const request = new Request(
        "https://example.com/callback?code=abc&next=//evil.com",
      );
      const response = await handler(request);

      // Should fall back to defaultRedirect
      expect(response.url).toBe("https://example.com/dashboard");
    });

    it("blocks absolute URLs", async () => {
      const handler = createAuthCallbackHandler({
        createClient: mockCreateClient,
        defaultRedirect: "/dashboard",
      });

      const request = new Request(
        "https://example.com/callback?code=abc&next=https://evil.com",
      );
      const response = await handler(request);

      // Should fall back to defaultRedirect
      expect(response.url).toBe("https://example.com/dashboard");
    });

    it("uses defaultRedirect when next is not provided", async () => {
      const handler = createAuthCallbackHandler({
        createClient: mockCreateClient,
        defaultRedirect: "/dashboard",
      });

      const request = new Request("https://example.com/callback?code=abc");
      const response = await handler(request);

      expect(response.url).toBe("https://example.com/dashboard");
    });

    it("allows relative redirect_to paths when next is not provided", async () => {
      const handler = createAuthCallbackHandler({
        createClient: mockCreateClient,
        defaultRedirect: "/dashboard",
      });

      const request = new Request(
        "https://example.com/callback?code=abc&redirect_to=/welcome",
      );
      const response = await handler(request);

      expect(response.url).toBe("https://example.com/welcome");
    });

    it("blocks protocol-relative redirect_to URLs", async () => {
      const handler = createAuthCallbackHandler({
        createClient: mockCreateClient,
        defaultRedirect: "/dashboard",
      });

      const request = new Request(
        "https://example.com/callback?code=abc&redirect_to=//evil.com",
      );
      const response = await handler(request);

      expect(response.url).toBe("https://example.com/dashboard");
    });

    it("blocks absolute redirect_to URLs", async () => {
      const handler = createAuthCallbackHandler({
        createClient: mockCreateClient,
        defaultRedirect: "/dashboard",
      });

      const request = new Request(
        "https://example.com/callback?code=abc&redirect_to=https://evil.com",
      );
      const response = await handler(request);

      expect(response.url).toBe("https://example.com/dashboard");
    });
  });

  describe("error handling", () => {
    it("redirects to signin with error when OAuth returns error", async () => {
      const handler = createAuthCallbackHandler({
        createClient: mockCreateClient,
        signInPath: "/signin",
      });

      const request = new Request(
        "https://example.com/callback?error=access_denied&error_description=User%20denied%20access",
      );
      const response = await handler(request);

      expect(response.url).toBe(
        "https://example.com/signin?error=User%20denied%20access",
      );
    });

    it("uses error code when error_description is missing", async () => {
      const handler = createAuthCallbackHandler({
        createClient: mockCreateClient,
        signInPath: "/signin",
      });

      const request = new Request(
        "https://example.com/callback?error=access_denied",
      );
      const response = await handler(request);

      expect(response.url).toBe(
        "https://example.com/signin?error=access_denied",
      );
    });

    it("redirects to signin when no code is provided", async () => {
      const handler = createAuthCallbackHandler({
        createClient: mockCreateClient,
        signInPath: "/signin",
      });

      const request = new Request("https://example.com/callback");
      const response = await handler(request);

      expect(response.url).toBe(
        "https://example.com/signin?error=No authorization code received",
      );
    });

    it("handles code exchange errors", async () => {
      mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({
        error: { message: "Invalid code" },
      });

      const handler = createAuthCallbackHandler({
        createClient: mockCreateClient,
        signInPath: "/signin",
      });

      const request = new Request("https://example.com/callback?code=invalid");
      const response = await handler(request);

      expect(response.url).toBe(
        "https://example.com/signin?error=Invalid%20code",
      );
    });
  });

  describe("linking flow errors", () => {
    it("redirects to profile page with link_error for linking failures", async () => {
      const handler = createAuthCallbackHandler({
        createClient: mockCreateClient,
      });

      const request = new Request(
        "https://example.com/callback?error=identity_exists&error_description=identity%20already%20exists&next=/profile/security",
      );
      const response = await handler(request);

      expect(response.url).toContain("/profile/security");
      expect(response.url).toContain("link_error=");
    });

    it("provides user-friendly message for already linked accounts", async () => {
      const handler = createAuthCallbackHandler({
        createClient: mockCreateClient,
      });

      const request = new Request(
        "https://example.com/callback?error=identity_exists&error_description=identity%20already%20exists&next=/settings",
      );
      const response = await handler(request);

      const url = new URL(response.url);
      const linkError = url.searchParams.get("link_error");
      expect(linkError).toBe(
        "This account is already connected to another account. Each external account can only be linked to one account.",
      );
    });

    it("handles linking errors during code exchange", async () => {
      mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({
        error: { message: "identity already exists" },
      });

      const handler = createAuthCallbackHandler({
        createClient: mockCreateClient,
      });

      const request = new Request(
        "https://example.com/callback?code=abc&next=/profile",
      );
      const response = await handler(request);

      expect(response.url).toContain("/profile");
      expect(response.url).toContain("link_error=");
    });

    it("allows consumers to provide product-specific linking error copy", async () => {
      const resolveLinkingErrorMessage = vi.fn(
        ({ defaultMessage }) =>
          `${defaultMessage} Contact your workspace admin.`,
      );
      const handler = createAuthCallbackHandler({
        createClient: mockCreateClient,
        resolveLinkingErrorMessage,
      });

      const request = new Request(
        "https://example.com/callback?error=identity_exists&error_description=identity%20already%20exists&next=/settings",
      );
      const response = await handler(request);

      const url = new URL(response.url);
      expect(url.searchParams.get("link_error")).toBe(
        "This account is already connected to another account. Each external account can only be linked to one account. Contact your workspace admin.",
      );
      expect(resolveLinkingErrorMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          error: "identity_exists",
          errorDescription: "identity already exists",
          message: "identity already exists",
          defaultMessage:
            "This account is already connected to another account. Each external account can only be linked to one account.",
          source: "oauth_error",
        }),
      );
    });

    it("allows consumers to define which redirects are account-linking flows", async () => {
      const handler = createAuthCallbackHandler({
        createClient: mockCreateClient,
        isLinkingFlow: ({ redirectPath }) =>
          redirectPath.startsWith("/account/security"),
      });

      const request = new Request(
        "https://example.com/callback?error=identity_exists&error_description=identity%20already%20exists&next=/account/security",
      );
      const response = await handler(request);

      expect(response.url).toContain("/account/security");
      expect(response.url).toContain("link_error=");
    });

    it("passes code-exchange error names to linking error resolvers when available", async () => {
      const resolveLinkingErrorMessage = vi.fn(
        ({ error }) => `Handled ${error}`,
      );
      mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({
        error: {
          name: "AuthApiError",
          message: "identity already exists",
        },
      });

      const handler = createAuthCallbackHandler({
        createClient: mockCreateClient,
        resolveLinkingErrorMessage,
      });

      const request = new Request(
        "https://example.com/callback?code=abc&next=/profile",
      );
      const response = await handler(request);

      const url = new URL(response.url);
      expect(url.searchParams.get("link_error")).toBe("Handled AuthApiError");
      expect(resolveLinkingErrorMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          error: "AuthApiError",
          message: "identity already exists",
          defaultMessage:
            "This account is already connected to another account. Each external account can only be linked to one account.",
          source: "code_exchange",
        }),
      );
    });
  });

  describe("successful authentication", () => {
    it("redirects to next path on success", async () => {
      mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({
        error: null,
      });
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

      const handler = createAuthCallbackHandler({
        createClient: mockCreateClient,
        defaultRedirect: "/dashboard",
      });

      const request = new Request(
        "https://example.com/callback?code=valid&next=/home",
      );
      const response = await handler(request);

      expect(response.url).toBe("https://example.com/home");
    });

    it("does not query app-specific profile tables or admin-route by default", async () => {
      mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({
        error: null,
      });
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "123" } },
      });
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                role: "admin:super",
                admin_approval_status: "approved",
              },
            }),
          }),
        }),
      });

      const handler = createAuthCallbackHandler({
        createClient: mockCreateClient,
        defaultRedirect: "/dashboard",
      });

      const request = new Request(
        "https://app.thecapitalcompass.ai/callback?code=valid",
      );
      const response = await handler(request);

      expect(response.url).toBe("https://app.thecapitalcompass.ai/dashboard");
      expect(mockSupabase.from).not.toHaveBeenCalled();
    });

    it("calls postAuthHook after OAuth success with the authenticated user", async () => {
      const user = {
        id: "user-1",
        email: "maya@example.com",
        user_metadata: { display_name: "Maya" },
      };
      const postAuthHook = vi.fn().mockResolvedValue(undefined);
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user } });

      const handler = createAuthCallbackHandler({
        createClient: mockCreateClient,
        defaultRedirect: "/dashboard",
        postAuthHook,
      });

      const request = new Request(
        "https://example.com/callback?code=valid&next=/home",
      );
      const response = await handler(request);

      expect(response.url).toBe("https://example.com/home");
      expect(postAuthHook).toHaveBeenCalledWith(
        expect.objectContaining({
          supabase: mockSupabase,
          user,
          request,
          origin: "https://example.com",
          redirectPath: "/home",
          flow: "oauth",
        }),
      );
    });

    it("calls postAuthHook after OTP verification success", async () => {
      const user = {
        id: "user-2",
        email: "otp@example.com",
        user_metadata: { display_name: "OTP User" },
      };
      const postAuthHook = vi.fn().mockResolvedValue(undefined);
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user } });

      const handler = createAuthCallbackHandler({
        createClient: mockCreateClient,
        defaultRedirect: "/dashboard",
        postAuthHook,
      });

      const request = new Request(
        "https://example.com/callback?token_hash=hash-123&type=magiclink&redirect_to=/welcome",
      );
      const response = await handler(request);

      expect(response.url).toBe("https://example.com/welcome");
      expect(mockSupabase.auth.verifyOtp).toHaveBeenCalledWith({
        token_hash: "hash-123",
        type: "magiclink",
      });
      expect(postAuthHook).toHaveBeenCalledWith(
        expect.objectContaining({
          supabase: mockSupabase,
          user,
          request,
          origin: "https://example.com",
          redirectPath: "/welcome",
          flow: "otp",
          otpType: "magiclink",
        }),
      );
    });

    it("blocks the success redirect when postAuthHook fails by default", async () => {
      const user = {
        id: "user-3",
        email: "blocked@example.com",
        user_metadata: {},
      };
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user } });

      const handler = createAuthCallbackHandler({
        createClient: mockCreateClient,
        postAuthHook: vi.fn().mockRejectedValue(new Error("sync failed")),
      });

      const request = new Request(
        "https://example.com/callback?code=valid&next=/home",
      );
      const response = await handler(request);

      expect(response.url).toBe(
        "https://example.com/signin?error=Authentication%20completed%2C%20but%20setup%20failed.%20Please%20try%20again.",
      );
    });

    it("continues the success redirect when postAuthHookErrorMode is ignore", async () => {
      const user = {
        id: "user-4",
        email: "ignored@example.com",
        user_metadata: {},
      };
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user } });

      const handler = createAuthCallbackHandler({
        createClient: mockCreateClient,
        postAuthHook: vi.fn().mockRejectedValue(new Error("sync failed")),
        postAuthHookErrorMode: "ignore",
      });

      const request = new Request(
        "https://example.com/callback?code=valid&next=/home",
      );
      const response = await handler(request);

      expect(response.url).toBe("https://example.com/home");
    });

    it("redirects to sign in when OTP verification fails", async () => {
      mockSupabase.auth.verifyOtp.mockResolvedValue({
        error: { message: "Verification token expired" },
      });

      const handler = createAuthCallbackHandler({
        createClient: mockCreateClient,
        signInPath: "/signin",
      });

      const request = new Request(
        "https://example.com/callback?token_hash=hash-123&type=magiclink",
      );
      const response = await handler(request);

      expect(response.url).toBe(
        "https://example.com/signin?error=Verification%20token%20expired",
      );
    });

    it("rejects unsupported OTP verification types", async () => {
      const handler = createAuthCallbackHandler({
        createClient: mockCreateClient,
        signInPath: "/signin",
      });

      const request = new Request(
        "https://example.com/callback?token_hash=hash-123&type=not-real",
      );
      const response = await handler(request);

      expect(mockSupabase.auth.verifyOtp).not.toHaveBeenCalled();
      expect(response.url).toBe(
        "https://example.com/signin?error=Invalid%20verification%20link",
      );
    });
  });

  describe("consumer-provided success redirect resolver", () => {
    it("can redirect admin to /admin/dashboard in development", async () => {
      const mockProfile = {
        role: "admin:super",
        admin_approval_status: "approved",
      };
      mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({
        error: null,
      });
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "123" } },
      });
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockProfile }),
          }),
        }),
      });

      const handler = createAuthCallbackHandler({
        createClient: mockCreateClient,
        resolveSuccessRedirect: resolveConsumerAdminRedirect,
      });

      const request = new Request("http://localhost:3000/callback?code=valid");
      const response = await handler(request);

      expect(response.url).toBe("http://localhost:3000/admin/dashboard");
    });

    it("ignores absolute string redirects from custom success resolvers", async () => {
      mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({
        error: null,
      });
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "123" } },
      });

      const handler = createAuthCallbackHandler({
        createClient: mockCreateClient,
        defaultRedirect: "/dashboard",
        resolveSuccessRedirect: () => "https://evil.example.com/redirect",
      });

      const request = new Request("https://example.com/callback?code=valid");
      const response = await handler(request);

      expect(response.url).toBe("https://example.com/dashboard");
    });

    it("can redirect pending admin to /admin-pending", async () => {
      const mockProfile = {
        role: "admin:program",
        admin_approval_status: "pending",
      };
      mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({
        error: null,
      });
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "123" } },
      });
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockProfile }),
          }),
        }),
      });

      const handler = createAuthCallbackHandler({
        createClient: mockCreateClient,
        resolveSuccessRedirect: resolveConsumerAdminRedirect,
      });

      const request = new Request("http://localhost:3000/callback?code=valid");
      const response = await handler(request);

      expect(response.url).toBe("http://localhost:3000/admin-pending");
    });

    it("can redirect admin to a consumer admin subdomain in production", async () => {
      const mockProfile = {
        role: "admin:super",
        admin_approval_status: "approved",
      };
      mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({
        error: null,
      });
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "123" } },
      });
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockProfile }),
          }),
        }),
      });

      const handler = createAuthCallbackHandler({
        createClient: mockCreateClient,
        resolveSuccessRedirect: resolveConsumerAdminRedirect,
      });

      const request = new Request(
        "https://app.thecapitalcompass.ai/callback?code=valid",
      );
      const response = await handler(request);

      expect(response.url).toBe("https://admin.thecapitalcompass.ai/dashboard");
    });

    it("can keep non-production hosts on same origin /admin/dashboard", async () => {
      const mockProfile = {
        role: "admin:super",
        admin_approval_status: "approved",
      };
      mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({
        error: null,
      });
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "123" } },
      });
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockProfile }),
          }),
        }),
      });

      const handler = createAuthCallbackHandler({
        createClient: mockCreateClient,
        resolveSuccessRedirect: resolveConsumerAdminRedirect,
      });

      const request = new Request(
        "https://doogteams-mac-mini.tail535a4.ts.net/callback?code=valid",
      );
      const response = await handler(request);

      expect(response.url).toBe(
        "https://doogteams-mac-mini.tail535a4.ts.net/admin/dashboard",
      );
    });

    it("can apply custom redirects after OTP verification", async () => {
      const mockProfile = {
        role: "admin:super",
        admin_approval_status: "approved",
      };
      mockSupabase.auth.verifyOtp.mockResolvedValue({
        error: null,
      });
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "123" } },
      });
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockProfile }),
          }),
        }),
      });

      const handler = createAuthCallbackHandler({
        createClient: mockCreateClient,
        resolveSuccessRedirect: resolveConsumerAdminRedirect,
      });

      const request = new Request(
        "http://localhost:3000/callback?token_hash=hash-123&type=magiclink",
      );
      const response = await handler(request);

      expect(response.url).toBe("http://localhost:3000/admin/dashboard");
    });
  });

  describe("default configuration", () => {
    it("uses /dashboard as defaultRedirect", async () => {
      const handler = createAuthCallbackHandler({
        createClient: mockCreateClient,
      });

      const request = new Request("https://example.com/callback?code=valid");
      const response = await handler(request);

      expect(response.url).toBe("https://example.com/dashboard");
    });

    it("uses /signin as signInPath", async () => {
      const handler = createAuthCallbackHandler({
        createClient: mockCreateClient,
      });

      const request = new Request("https://example.com/callback");
      const response = await handler(request);

      expect(response.url).toContain("/signin");
    });
  });
});
