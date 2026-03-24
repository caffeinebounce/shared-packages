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

  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({ error: null });
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });
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
      expect(linkError).toContain(
        "already connected to another Compass account",
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
  });

  describe("admin user handling", () => {
    it("redirects admin to /admin/dashboard in development", async () => {
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
      });

      const request = new Request("http://localhost:3000/callback?code=valid");
      const response = await handler(request);

      expect(response.url).toBe("http://localhost:3000/admin/dashboard");
    });

    it("redirects pending admin to /admin-pending", async () => {
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
      });

      const request = new Request("http://localhost:3000/callback?code=valid");
      const response = await handler(request);

      expect(response.url).toBe("http://localhost:3000/admin-pending");
    });

    it("redirects admin to admin subdomain in Compass production", async () => {
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
      });

      const request = new Request(
        "https://app.thecapitalcompass.ai/callback?code=valid",
      );
      const response = await handler(request);

      expect(response.url).toBe("https://admin.thecapitalcompass.ai/dashboard");
    });

    it("keeps non-production hosts on same origin /admin/dashboard", async () => {
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
      });

      const request = new Request(
        "https://doogteams-mac-mini.tail535a4.ts.net/callback?code=valid",
      );
      const response = await handler(request);

      expect(response.url).toBe(
        "https://doogteams-mac-mini.tail535a4.ts.net/admin/dashboard",
      );
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
