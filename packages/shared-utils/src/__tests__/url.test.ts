import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  createSocialHandleSchema,
  createSocialUrlSchema,
  createUrlSchema,
  facebookUrlSchema,
  getAppOrigin,
  getClientOrigin,
  getServerOrigin,
  getSiteOrigin,
  getSupabaseRedirectUrls,
  instagramHandleSchema,
  isDevLikeHost,
  isPreviewEnvironment,
  isRenderPreviewDomain,
  linkedinUrlSchema,
  pinterestUrlSchema,
  resolveAdminRedirectTarget,
  tiktokHandleSchema,
  tiktokUrlSchema,
  websiteUrlSchema,
  xHandleSchema,
  xUrlSchema,
  youtubeUrlSchema,
} from "../url";

describe("URL Validators", () => {
  // ---------------------------------------------------------------------------
  // createUrlSchema (generic URL validator)
  // ---------------------------------------------------------------------------
  describe("createUrlSchema", () => {
    const urlSchema = createUrlSchema("Invalid URL");

    it("accepts valid URLs with https", () => {
      expect(urlSchema.safeParse("https://example.com").success).toBe(true);
      expect(urlSchema.safeParse("https://sub.example.com/path").success).toBe(
        true,
      );
    });

    it("accepts valid URLs with http", () => {
      expect(urlSchema.safeParse("http://example.com").success).toBe(true);
    });

    it("accepts valid URLs without protocol", () => {
      expect(urlSchema.safeParse("example.com").success).toBe(true);
      expect(urlSchema.safeParse("www.example.com").success).toBe(true);
    });

    it("accepts localhost", () => {
      expect(urlSchema.safeParse("localhost").success).toBe(true);
      expect(urlSchema.safeParse("http://localhost:3000").success).toBe(true);
    });

    it("accepts empty string", () => {
      expect(urlSchema.safeParse("").success).toBe(true);
    });

    it("rejects single words without dots", () => {
      expect(urlSchema.safeParse("example").success).toBe(false);
      expect(urlSchema.safeParse("dscsdc").success).toBe(false);
    });

    it("rejects invalid URLs", () => {
      expect(urlSchema.safeParse("not a url at all").success).toBe(false);
      expect(urlSchema.safeParse("://missing-protocol.com").success).toBe(
        false,
      );
    });
  });

  // ---------------------------------------------------------------------------
  // createSocialUrlSchema (factory function)
  // ---------------------------------------------------------------------------
  describe("createSocialUrlSchema", () => {
    const customSchema = createSocialUrlSchema({
      name: "TestPlatform",
      hostnames: ["test.com", "www.test.com"],
      allowSubdomains: true,
      baseDomain: "test.com",
      example: "https://test.com/profile",
    });

    it("accepts URLs matching configured hostnames", () => {
      expect(customSchema.safeParse("https://test.com/profile").success).toBe(
        true,
      );
      expect(
        customSchema.safeParse("https://www.test.com/profile").success,
      ).toBe(true);
    });

    it("accepts subdomains when allowSubdomains is true", () => {
      expect(
        customSchema.safeParse("https://sub.test.com/profile").success,
      ).toBe(true);
      expect(customSchema.safeParse("https://deep.sub.test.com").success).toBe(
        true,
      );
    });

    it("accepts URLs without protocol", () => {
      expect(customSchema.safeParse("test.com/profile").success).toBe(true);
    });

    it("rejects URLs from other domains", () => {
      expect(customSchema.safeParse("https://other.com/profile").success).toBe(
        false,
      );
      expect(customSchema.safeParse("https://nottest.com").success).toBe(false);
    });

    it("accepts empty string", () => {
      expect(customSchema.safeParse("").success).toBe(true);
    });

    it("returns helpful error message", () => {
      const result = customSchema.safeParse("https://other.com");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("TestPlatform");
        expect(result.error.issues[0].message).toContain(
          "https://test.com/profile",
        );
      }
    });

    it("handles subdomains disabled", () => {
      const noSubdomainsSchema = createSocialUrlSchema({
        name: "NoSub",
        hostnames: ["nosub.com", "www.nosub.com"],
        allowSubdomains: false,
        example: "https://nosub.com",
      });
      expect(noSubdomainsSchema.safeParse("https://nosub.com").success).toBe(
        true,
      );
      expect(
        noSubdomainsSchema.safeParse("https://sub.nosub.com").success,
      ).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // createSocialHandleSchema (factory function)
  // ---------------------------------------------------------------------------
  describe("createSocialHandleSchema", () => {
    const customHandleSchema = createSocialHandleSchema({
      name: "TestPlatform",
      maxLength: 10,
      pattern: /^[a-z0-9_]*$/i,
      validCharsDescription: "letters, numbers, underscores",
    });

    it("accepts valid handles", () => {
      expect(customHandleSchema.safeParse("username").success).toBe(true);
      expect(customHandleSchema.safeParse("user_123").success).toBe(true);
    });

    it("strips @ prefix before validation", () => {
      expect(customHandleSchema.safeParse("@username").success).toBe(true);
    });

    it("accepts empty string", () => {
      expect(customHandleSchema.safeParse("").success).toBe(true);
    });

    it("rejects handles exceeding max length", () => {
      expect(customHandleSchema.safeParse("verylongname").success).toBe(false);
    });

    it("rejects invalid characters", () => {
      expect(customHandleSchema.safeParse("user.name").success).toBe(false); // dot not in pattern
      expect(customHandleSchema.safeParse("user name").success).toBe(false);
    });

    it("returns helpful error message for invalid characters", () => {
      const result = customHandleSchema.safeParse("user!");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("TestPlatform");
        expect(result.error.issues[0].message).toContain(
          "letters, numbers, underscores",
        );
      }
    });
  });

  // ---------------------------------------------------------------------------
  // Pre-built URL Validators
  // ---------------------------------------------------------------------------
  describe("linkedinUrlSchema", () => {
    it("accepts valid LinkedIn URLs", () => {
      expect(
        linkedinUrlSchema.safeParse("https://linkedin.com/company/example")
          .success,
      ).toBe(true);
      expect(
        linkedinUrlSchema.safeParse("https://www.linkedin.com/in/username")
          .success,
      ).toBe(true);
      expect(
        linkedinUrlSchema.safeParse("linkedin.com/company/test").success,
      ).toBe(true);
    });

    it("accepts LinkedIn subdomains", () => {
      expect(
        linkedinUrlSchema.safeParse("https://business.linkedin.com").success,
      ).toBe(true);
    });

    it("rejects non-LinkedIn URLs", () => {
      expect(
        linkedinUrlSchema.safeParse("https://facebook.com/example").success,
      ).toBe(false);
      expect(
        linkedinUrlSchema.safeParse("https://fakelinkdin.com").success,
      ).toBe(false);
    });

    it("accepts empty string", () => {
      expect(linkedinUrlSchema.safeParse("").success).toBe(true);
    });
  });

  describe("facebookUrlSchema", () => {
    it("accepts valid Facebook URLs", () => {
      expect(
        facebookUrlSchema.safeParse("https://facebook.com/example").success,
      ).toBe(true);
      expect(
        facebookUrlSchema.safeParse("https://www.facebook.com/example").success,
      ).toBe(true);
      expect(
        facebookUrlSchema.safeParse("https://fb.com/example").success,
      ).toBe(true);
      expect(
        facebookUrlSchema.safeParse("https://www.fb.com/example").success,
      ).toBe(true);
    });

    it("accepts Facebook subdomains", () => {
      expect(
        facebookUrlSchema.safeParse("https://business.facebook.com").success,
      ).toBe(true);
    });

    it("rejects non-Facebook URLs", () => {
      expect(
        facebookUrlSchema.safeParse("https://linkedin.com/example").success,
      ).toBe(false);
    });

    it("accepts empty string", () => {
      expect(facebookUrlSchema.safeParse("").success).toBe(true);
    });
  });

  describe("pinterestUrlSchema", () => {
    it("accepts valid Pinterest URLs", () => {
      expect(
        pinterestUrlSchema.safeParse("https://pinterest.com/example").success,
      ).toBe(true);
      expect(
        pinterestUrlSchema.safeParse("https://www.pinterest.com/example")
          .success,
      ).toBe(true);
    });

    it("accepts Pinterest subdomains", () => {
      expect(
        pinterestUrlSchema.safeParse("https://business.pinterest.com").success,
      ).toBe(true);
    });

    it("rejects non-Pinterest URLs", () => {
      expect(
        pinterestUrlSchema.safeParse("https://facebook.com/example").success,
      ).toBe(false);
    });

    it("accepts empty string", () => {
      expect(pinterestUrlSchema.safeParse("").success).toBe(true);
    });
  });

  describe("xUrlSchema", () => {
    it("accepts valid X/Twitter URLs", () => {
      expect(xUrlSchema.safeParse("https://x.com/username").success).toBe(true);
      expect(xUrlSchema.safeParse("https://www.x.com/username").success).toBe(
        true,
      );
      expect(xUrlSchema.safeParse("https://twitter.com/username").success).toBe(
        true,
      );
      expect(
        xUrlSchema.safeParse("https://www.twitter.com/username").success,
      ).toBe(true);
    });

    it("rejects non-X URLs", () => {
      expect(xUrlSchema.safeParse("https://facebook.com/example").success).toBe(
        false,
      );
    });

    it("accepts empty string", () => {
      expect(xUrlSchema.safeParse("").success).toBe(true);
    });
  });

  describe("youtubeUrlSchema", () => {
    it("accepts valid YouTube URLs", () => {
      expect(
        youtubeUrlSchema.safeParse("https://youtube.com/@channel").success,
      ).toBe(true);
      expect(
        youtubeUrlSchema.safeParse("https://www.youtube.com/watch?v=123")
          .success,
      ).toBe(true);
      expect(youtubeUrlSchema.safeParse("https://youtu.be/123").success).toBe(
        true,
      );
    });

    it("accepts YouTube subdomains", () => {
      expect(
        youtubeUrlSchema.safeParse("https://music.youtube.com").success,
      ).toBe(true);
    });

    it("rejects non-YouTube URLs", () => {
      expect(
        youtubeUrlSchema.safeParse("https://facebook.com/example").success,
      ).toBe(false);
    });

    it("accepts empty string", () => {
      expect(youtubeUrlSchema.safeParse("").success).toBe(true);
    });
  });

  describe("tiktokUrlSchema", () => {
    it("accepts valid TikTok URLs", () => {
      expect(
        tiktokUrlSchema.safeParse("https://tiktok.com/@username").success,
      ).toBe(true);
      expect(
        tiktokUrlSchema.safeParse("https://www.tiktok.com/@username").success,
      ).toBe(true);
    });

    it("rejects non-TikTok URLs", () => {
      expect(
        tiktokUrlSchema.safeParse("https://facebook.com/example").success,
      ).toBe(false);
    });

    it("accepts empty string", () => {
      expect(tiktokUrlSchema.safeParse("").success).toBe(true);
    });
  });

  describe("websiteUrlSchema", () => {
    it("accepts valid website URLs", () => {
      expect(websiteUrlSchema.safeParse("https://example.com").success).toBe(
        true,
      );
      expect(websiteUrlSchema.safeParse("example.com").success).toBe(true);
    });

    it("rejects invalid URLs", () => {
      expect(websiteUrlSchema.safeParse("notaurl").success).toBe(false);
    });

    it("accepts empty string", () => {
      expect(websiteUrlSchema.safeParse("").success).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // Pre-built Handle Validators
  // ---------------------------------------------------------------------------
  describe("instagramHandleSchema", () => {
    it("accepts valid Instagram handles", () => {
      expect(instagramHandleSchema.safeParse("username").success).toBe(true);
      expect(instagramHandleSchema.safeParse("user_name").success).toBe(true);
      expect(instagramHandleSchema.safeParse("user.name").success).toBe(true);
      expect(instagramHandleSchema.safeParse("user123").success).toBe(true);
    });

    it("accepts handles with @ prefix", () => {
      expect(instagramHandleSchema.safeParse("@username").success).toBe(true);
    });

    it("rejects handles over 30 characters", () => {
      expect(instagramHandleSchema.safeParse("a".repeat(31)).success).toBe(
        false,
      );
    });

    it("rejects invalid characters", () => {
      expect(instagramHandleSchema.safeParse("user-name").success).toBe(false);
      expect(instagramHandleSchema.safeParse("user name").success).toBe(false);
    });

    it("accepts empty string", () => {
      expect(instagramHandleSchema.safeParse("").success).toBe(true);
    });
  });

  describe("xHandleSchema", () => {
    it("accepts valid X handles", () => {
      expect(xHandleSchema.safeParse("username").success).toBe(true);
      expect(xHandleSchema.safeParse("user_name").success).toBe(true);
      expect(xHandleSchema.safeParse("user123").success).toBe(true);
    });

    it("accepts handles with @ prefix", () => {
      expect(xHandleSchema.safeParse("@username").success).toBe(true);
    });

    it("rejects handles over 15 characters", () => {
      expect(xHandleSchema.safeParse("a".repeat(16)).success).toBe(false);
    });

    it("rejects periods (not allowed in X handles)", () => {
      expect(xHandleSchema.safeParse("user.name").success).toBe(false);
    });

    it("accepts empty string", () => {
      expect(xHandleSchema.safeParse("").success).toBe(true);
    });
  });

  describe("tiktokHandleSchema", () => {
    it("accepts valid TikTok handles", () => {
      expect(tiktokHandleSchema.safeParse("username").success).toBe(true);
      expect(tiktokHandleSchema.safeParse("user_name").success).toBe(true);
      expect(tiktokHandleSchema.safeParse("user.name").success).toBe(true);
      expect(tiktokHandleSchema.safeParse("user123").success).toBe(true);
    });

    it("accepts handles with @ prefix", () => {
      expect(tiktokHandleSchema.safeParse("@username").success).toBe(true);
    });

    it("rejects handles over 24 characters", () => {
      expect(tiktokHandleSchema.safeParse("a".repeat(25)).success).toBe(false);
    });

    it("rejects invalid characters", () => {
      expect(tiktokHandleSchema.safeParse("user-name").success).toBe(false);
      expect(tiktokHandleSchema.safeParse("user name").success).toBe(false);
    });

    it("accepts empty string", () => {
      expect(tiktokHandleSchema.safeParse("").success).toBe(true);
    });
  });
});

// ---------------------------------------------------------------------------
// Environment Detection Functions
// ---------------------------------------------------------------------------
describe("Environment Detection", () => {
  describe("isRenderPreviewDomain", () => {
    it("identifies Render preview domains", () => {
      expect(isRenderPreviewDomain("compass-pr-194.onrender.com")).toBe(true);
      expect(isRenderPreviewDomain("my-app-123.onrender.com")).toBe(true);
      expect(isRenderPreviewDomain("preview-abc.onrender.com")).toBe(true);
    });

    it("excludes production domains with app/admin prefixes", () => {
      expect(isRenderPreviewDomain("app.compass.onrender.com")).toBe(false);
      expect(isRenderPreviewDomain("admin.compass.onrender.com")).toBe(false);
    });

    it("allows domains starting with app/admin as single label", () => {
      // Single labels like "application" or "admiral" should be allowed
      expect(isRenderPreviewDomain("application.onrender.com")).toBe(true);
      expect(isRenderPreviewDomain("admiral.onrender.com")).toBe(true);
      expect(isRenderPreviewDomain("app-preview.onrender.com")).toBe(true);
    });

    it("handles multi-label preview domains", () => {
      // Multi-label domains that don't start with app/admin are preview
      expect(isRenderPreviewDomain("staging.compass.onrender.com")).toBe(true);
      expect(isRenderPreviewDomain("dev.myapp.onrender.com")).toBe(true);
    });

    it("handles case insensitivity", () => {
      expect(isRenderPreviewDomain("COMPASS-PR-194.ONRENDER.COM")).toBe(true);
      expect(isRenderPreviewDomain("APP.COMPASS.ONRENDER.COM")).toBe(false);
    });

    it("rejects non-Render domains", () => {
      expect(isRenderPreviewDomain("thecapitalcompass.ai")).toBe(false);
      expect(isRenderPreviewDomain("example.com")).toBe(false);
      expect(isRenderPreviewDomain("vercel.app")).toBe(false);
    });

    it("handles hostnames with ports", () => {
      expect(isRenderPreviewDomain("compass-pr-194.onrender.com:443")).toBe(
        true,
      );
    });

    it("rejects bare onrender.com", () => {
      expect(isRenderPreviewDomain("onrender.com")).toBe(false);
    });
  });

  describe("isDevLikeHost", () => {
    it("returns true for all dev-like host variants", () => {
      const devLikeHosts = [
        "localhost",
        "localhost:3000",
        "127.0.0.1",
        "127.0.0.1:54321",
        "::1",
        "[::1]:3000",
        "myapp.local",
        "dev.myapp.local",
        "doogteams-mac-mini.tail535a4.ts.net",
        "doogteams-mac-mini",
        "100.107.35.36",
        "100.107.35.36:3000",
      ];

      for (const host of devLikeHosts) {
        expect(isDevLikeHost(host), `expected ${host} to be dev-like`).toBe(
          true,
        );
      }
    });

    it("returns false for production-style hostnames", () => {
      const productionHosts = [
        "thecapitalcompass.ai",
        "app.thecapitalcompass.ai",
        "admin.thecapitalcompass.ai",
        "example.com",
      ];

      for (const host of productionHosts) {
        expect(isDevLikeHost(host), `expected ${host} to not be dev-like`).toBe(
          false,
        );
      }
    });
  });

  describe("isPreviewEnvironment", () => {
    it("identifies localhost variants", () => {
      expect(isPreviewEnvironment("localhost")).toBe(true);
      expect(isPreviewEnvironment("localhost:3000")).toBe(true);
      expect(isPreviewEnvironment("127.0.0.1")).toBe(true);
      expect(isPreviewEnvironment("127.0.0.1:3000")).toBe(true);
      expect(isPreviewEnvironment("::1")).toBe(true);
      expect(isPreviewEnvironment("[::1]:3000")).toBe(true);
    });

    it("identifies .local domains", () => {
      expect(isPreviewEnvironment("myapp.local")).toBe(true);
      expect(isPreviewEnvironment("dev.myapp.local")).toBe(true);
    });

    it("identifies tailscale, short hostnames, and IPv4 hosts", () => {
      expect(isPreviewEnvironment("doogteams-mac-mini.tail535a4.ts.net")).toBe(
        true,
      );
      expect(isPreviewEnvironment("doogteams-mac-mini")).toBe(true);
      expect(isPreviewEnvironment("100.107.35.36")).toBe(true);
      expect(isPreviewEnvironment("100.107.35.36:3000")).toBe(true);
    });

    it("identifies Render preview domains", () => {
      expect(isPreviewEnvironment("compass-pr-194.onrender.com")).toBe(true);
      // Note: render.com removed from PREVIEW_DOMAINS as it's too broad
      // Only onrender.com subdomains are detected as preview
    });

    it("identifies Vercel preview domains", () => {
      expect(isPreviewEnvironment("my-app-abc123.vercel.app")).toBe(true);
      expect(isPreviewEnvironment("preview-123.vercel.app")).toBe(true);
    });

    it("identifies Netlify preview domains", () => {
      expect(isPreviewEnvironment("deploy-preview-123.netlify.app")).toBe(true);
    });

    it("identifies Railway preview domains", () => {
      expect(isPreviewEnvironment("my-app.railway.app")).toBe(true);
    });

    it("rejects production domains", () => {
      expect(isPreviewEnvironment("thecapitalcompass.ai")).toBe(false);
      expect(isPreviewEnvironment("app.thecapitalcompass.ai")).toBe(false);
      expect(isPreviewEnvironment("example.com")).toBe(false);
    });

    it("handles case insensitivity", () => {
      expect(isPreviewEnvironment("LOCALHOST")).toBe(true);
      expect(isPreviewEnvironment("COMPASS.VERCEL.APP")).toBe(true);
    });
  });

  describe("getClientOrigin", () => {
    let originalWindow: typeof globalThis.window;
    let originalEnv: NodeJS.ProcessEnv;
    const setMockWindowLocation = (
      location: Pick<Location, "origin" | "hostname">,
    ) => {
      globalThis.window = {
        location: location as Location,
      } as Window & typeof globalThis;
    };

    beforeEach(() => {
      // Store original window
      originalWindow = globalThis.window;
      // Store original env
      originalEnv = { ...process.env };
    });

    afterEach(() => {
      // Restore original window
      if (originalWindow === undefined) {
        Reflect.deleteProperty(globalThis, "window");
      } else {
        globalThis.window = originalWindow;
      }
      // Restore original env
      process.env = originalEnv;
    });

    it("returns empty string in SSR context when no env var set", () => {
      Reflect.deleteProperty(globalThis, "window");
      delete process.env.NEXT_PUBLIC_SITE_URL;
      expect(getClientOrigin()).toBe("");
    });

    it("returns env var in SSR context when env var is set", () => {
      Reflect.deleteProperty(globalThis, "window");
      process.env.NEXT_PUBLIC_SITE_URL = "https://thecapitalcompass.ai";
      expect(getClientOrigin()).toBe("https://thecapitalcompass.ai");
    });

    it("returns window.location.origin in preview environment", () => {
      setMockWindowLocation({
        origin: "https://compass-pr-194.onrender.com",
        hostname: "compass-pr-194.onrender.com",
      });
      expect(getClientOrigin()).toBe("https://compass-pr-194.onrender.com");
    });

    it("returns window.location.origin in preview even when env var is set to production", () => {
      process.env.NEXT_PUBLIC_SITE_URL = "https://thecapitalcompass.ai";
      setMockWindowLocation({
        origin: "https://compass-pr-194.onrender.com",
        hostname: "compass-pr-194.onrender.com",
      });
      // Preview environment should use actual origin, ignoring env var
      expect(getClientOrigin()).toBe("https://compass-pr-194.onrender.com");
    });

    it("returns window.location.origin for localhost", () => {
      setMockWindowLocation({
        origin: "http://localhost:3000",
        hostname: "localhost",
      });
      expect(getClientOrigin()).toBe("http://localhost:3000");
    });

    it("returns request origin for dev-like hosts even when env var is set", () => {
      process.env.NEXT_PUBLIC_SITE_URL = "https://thecapitalcompass.ai";

      const cases = [
        {
          origin: "http://doogteams-mac-mini:3000",
          hostname: "doogteams-mac-mini",
        },
        {
          origin: "https://doogteams-mac-mini.tail535a4.ts.net",
          hostname: "doogteams-mac-mini.tail535a4.ts.net",
        },
        { origin: "http://100.107.35.36:3000", hostname: "100.107.35.36" },
      ];

      for (const testCase of cases) {
        setMockWindowLocation(testCase);
        expect(getClientOrigin()).toBe(testCase.origin);
      }
    });

    it("returns env var in production when env var is set", () => {
      process.env.NEXT_PUBLIC_SITE_URL = "https://thecapitalcompass.ai/";
      setMockWindowLocation({
        origin: "https://app.thecapitalcompass.ai",
        hostname: "app.thecapitalcompass.ai",
      });
      // Production should use env var (with trailing slash removed)
      expect(getClientOrigin()).toBe("https://thecapitalcompass.ai");
    });

    it("returns window.location.origin in production when no env var", () => {
      delete process.env.NEXT_PUBLIC_SITE_URL;
      setMockWindowLocation({
        origin: "https://thecapitalcompass.ai",
        hostname: "thecapitalcompass.ai",
      });
      // Without env var set, falls back to window.location.origin
      expect(getClientOrigin()).toBe("https://thecapitalcompass.ai");
    });

    it("uses custom env var name when specified", () => {
      process.env.CUSTOM_APP_URL = "https://custom.example.com";
      setMockWindowLocation({
        origin: "https://production.example.com",
        hostname: "production.example.com",
      });
      expect(getClientOrigin("CUSTOM_APP_URL")).toBe(
        "https://custom.example.com",
      );
    });
  });

  describe("getSiteOrigin", () => {
    let originalWindow: typeof globalThis.window;
    let originalEnv: NodeJS.ProcessEnv;

    beforeEach(() => {
      originalWindow = globalThis.window;
      originalEnv = { ...process.env };
    });

    afterEach(() => {
      if (originalWindow === undefined) {
        Reflect.deleteProperty(globalThis, "window");
      } else {
        globalThis.window = originalWindow;
      }
      process.env = originalEnv;
    });

    it("uses request origin for preview-like hosts", () => {
      process.env.NEXT_PUBLIC_SITE_URL = "https://zenbid.com";

      expect(
        getSiteOrigin({
          headers: {
            get: (name: string) =>
              name === "host"
                ? "preview-123.onrender.com"
                : name === "x-forwarded-proto"
                  ? "https"
                  : null,
          },
        }),
      ).toBe("https://preview-123.onrender.com");
    });

    it("uses production env for non-preview request hosts", () => {
      process.env.NEXT_PUBLIC_SITE_URL = "https://zenbid.com/";

      expect(
        getSiteOrigin({
          headers: {
            get: (name: string) =>
              name === "host"
                ? "app.zenbid.com"
                : name === "x-forwarded-proto"
                  ? "https"
                  : null,
          },
        }),
      ).toBe("https://zenbid.com");
    });

    it("falls back to client origin behavior when request is omitted", () => {
      process.env.NEXT_PUBLIC_SITE_URL = "https://zenbid.com/";
      globalThis.window = {
        location: {
          origin: "https://preview-123.onrender.com",
          hostname: "preview-123.onrender.com",
        } as Location,
      } as Window & typeof globalThis;

      expect(getSiteOrigin()).toBe("https://preview-123.onrender.com");
    });
  });

  describe("getAppOrigin", () => {
    let originalWindow: typeof globalThis.window;
    let originalEnv: NodeJS.ProcessEnv;

    beforeEach(() => {
      originalWindow = globalThis.window;
      originalEnv = { ...process.env };
    });

    afterEach(() => {
      if (originalWindow === undefined) {
        Reflect.deleteProperty(globalThis, "window");
      } else {
        globalThis.window = originalWindow;
      }
      process.env = originalEnv;
    });

    it("uses request origin for dev-like hosts", () => {
      process.env.NEXT_PUBLIC_APP_URL = "https://app.zenbid.com";

      expect(
        getAppOrigin({
          headers: {
            get: (name: string) =>
              name === "host"
                ? "100.107.35.36:3011"
                : name === "x-forwarded-proto"
                  ? "http"
                  : null,
          },
        }),
      ).toBe("http://100.107.35.36:3011");
    });

    it("uses production app env for non-preview request hosts", () => {
      process.env.NEXT_PUBLIC_APP_URL = "https://app.zenbid.com/";

      expect(
        getAppOrigin({
          headers: {
            get: (name: string) =>
              name === "host"
                ? "app.zenbid.com"
                : name === "x-forwarded-proto"
                  ? "https"
                  : null,
          },
        }),
      ).toBe("https://app.zenbid.com");
    });

    it("falls back to client origin behavior when request is omitted", () => {
      process.env.NEXT_PUBLIC_APP_URL = "https://app.zenbid.com/";
      globalThis.window = {
        location: {
          origin: "http://localhost:3000",
          hostname: "localhost",
        } as Location,
      } as Window & typeof globalThis;

      expect(getAppOrigin()).toBe("http://localhost:3000");
    });
  });

  describe("resolveAdminRedirectTarget", () => {
    it("uses path-based admin routing for dev-like hosts", () => {
      expect(
        resolveAdminRedirectTarget({
          host: "doogteams-mac-mini:3000",
          protocol: "http",
          appOrigin: "http://doogteams-mac-mini:3000",
        }),
      ).toBe("http://doogteams-mac-mini:3000/admin/dashboard");

      expect(
        resolveAdminRedirectTarget({
          host: "100.107.35.36:3000",
          protocol: "http",
          appOrigin: "http://100.107.35.36:3000",
        }),
      ).toBe("http://100.107.35.36:3000/admin/dashboard");

      expect(
        resolveAdminRedirectTarget({
          host: "doogteams-mac-mini.tail535a4.ts.net",
          protocol: "https",
          appOrigin: "https://doogteams-mac-mini.tail535a4.ts.net",
        }),
      ).toBe("https://doogteams-mac-mini.tail535a4.ts.net/admin/dashboard");
    });

    it("uses subdomain admin routing for production hosts", () => {
      expect(
        resolveAdminRedirectTarget({
          host: "app.thecapitalcompass.ai",
          protocol: "https",
        }),
      ).toBe("https://admin.app.thecapitalcompass.ai/dashboard");
    });
  });

  describe("getSupabaseRedirectUrls", () => {
    it("returns canonical redirect variants", () => {
      expect(getSupabaseRedirectUrls("http://100.107.35.36:3000")).toEqual([
        "http://100.107.35.36:3000",
        "http://100.107.35.36:3000/callback",
        "http://100.107.35.36:3000/callback?next=/dashboard",
        "http://100.107.35.36:3000/**",
      ]);
    });
  });

  describe("getServerOrigin", () => {
    let originalEnv: NodeJS.ProcessEnv;

    beforeEach(() => {
      originalEnv = { ...process.env };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it("returns https origin with host and protocol", () => {
      expect(getServerOrigin("compass-pr-194.onrender.com", "https")).toBe(
        "https://compass-pr-194.onrender.com",
      );
    });

    it("returns http origin when protocol is http", () => {
      expect(getServerOrigin("localhost:3000", "http")).toBe(
        "http://localhost:3000",
      );
    });

    it("defaults to https when protocol is omitted", () => {
      expect(getServerOrigin("compass-pr-194.onrender.com")).toBe(
        "https://compass-pr-194.onrender.com",
      );
    });

    it("returns preview origin even when env var is set to production", () => {
      process.env.NEXT_PUBLIC_SITE_URL = "https://thecapitalcompass.ai";
      // Preview domains always use the actual host, ignoring env var
      expect(getServerOrigin("compass-pr-194.onrender.com", "https")).toBe(
        "https://compass-pr-194.onrender.com",
      );
    });

    it("returns localhost origin correctly", () => {
      // Localhost is also a preview environment
      expect(getServerOrigin("localhost:3000", "http")).toBe(
        "http://localhost:3000",
      );
    });

    it("returns request origin for dev-like hosts even when env var is set", () => {
      process.env.NEXT_PUBLIC_SITE_URL = "https://thecapitalcompass.ai";

      expect(getServerOrigin("doogteams-mac-mini:3000", "http")).toBe(
        "http://doogteams-mac-mini:3000",
      );
      expect(
        getServerOrigin("doogteams-mac-mini.tail535a4.ts.net", "https"),
      ).toBe("https://doogteams-mac-mini.tail535a4.ts.net");
      expect(getServerOrigin("100.107.35.36:3000", "http")).toBe(
        "http://100.107.35.36:3000",
      );
    });

    it("handles Vercel preview domain", () => {
      expect(getServerOrigin("my-app-abc123.vercel.app", "https")).toBe(
        "https://my-app-abc123.vercel.app",
      );
    });

    it("returns env var for production domains when set", () => {
      process.env.NEXT_PUBLIC_SITE_URL = "https://thecapitalcompass.ai/";
      // Production domain with env var should use env var (trailing slash removed)
      expect(getServerOrigin("app.thecapitalcompass.ai", "https")).toBe(
        "https://thecapitalcompass.ai",
      );
    });

    it("returns origin for production domains when no env var", () => {
      delete process.env.NEXT_PUBLIC_SITE_URL;
      // Production domain without env var falls back to request origin
      expect(getServerOrigin("thecapitalcompass.ai", "https")).toBe(
        "https://thecapitalcompass.ai",
      );
    });

    it("uses custom env var name when specified", () => {
      process.env.CUSTOM_APP_URL = "https://custom.example.com/";
      expect(
        getServerOrigin("production.example.com", "https", "CUSTOM_APP_URL"),
      ).toBe("https://custom.example.com");
    });
  });
});
