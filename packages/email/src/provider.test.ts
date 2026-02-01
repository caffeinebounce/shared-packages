import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mockEmailTransport } from "./mock";
import { createUniversalEmailClient } from "./provider";

describe("createUniversalEmailClient", () => {
  beforeEach(() => {
    mockEmailTransport.clear();
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("provider selection", () => {
    it("uses mock provider by default when no API key", () => {
      const client = createUniversalEmailClient();
      expect(client.provider).toBe("mock");
    });

    it("uses resend provider when API key is provided", () => {
      const client = createUniversalEmailClient({
        provider: "resend",
        resendApiKey: "test-key", // pragma: allowlist secret
      });
      expect(client.provider).toBe("resend");
    });

    it("uses smtp provider when explicitly set", () => {
      const client = createUniversalEmailClient({
        provider: "smtp",
        smtpConfig: { host: "localhost", port: 1025 },
      });
      expect(client.provider).toBe("smtp");
    });

    it("respects EMAIL_PROVIDER environment variable", () => {
      vi.stubEnv("EMAIL_PROVIDER", "mock");
      vi.stubEnv("RESEND_API_KEY", "test-key");

      const client = createUniversalEmailClient();
      expect(client.provider).toBe("mock");
    });
  });

  describe("mock provider", () => {
    it("captures sent emails", async () => {
      const client = createUniversalEmailClient({ provider: "mock" });

      const result = await client.send({
        from: "test@example.com",
        to: "user@example.com",
        subject: "Test",
        html: "<p>Hello</p>",
      });

      expect(result.success).toBe(true);
      expect(result.id).toBeDefined();
    });
  });

  describe("defaultFrom", () => {
    it("uses provided defaultFrom", () => {
      const client = createUniversalEmailClient({
        defaultFrom: "custom@example.com",
      });
      expect(client.defaultFrom).toBe("custom@example.com");
    });

    it("uses EMAIL_FROM environment variable", () => {
      vi.stubEnv("EMAIL_FROM", "env@example.com");

      const client = createUniversalEmailClient();
      expect(client.defaultFrom).toBe("env@example.com");
    });

    it("falls back to default", () => {
      const client = createUniversalEmailClient();
      expect(client.defaultFrom).toBe("noreply@example.com");
    });
  });
});
