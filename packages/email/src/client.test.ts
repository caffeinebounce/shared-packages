import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createEmailClient } from "./client";

// Mock console.warn globally for this test file to suppress expected warnings
let warnSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  warnSpy.mockRestore();
});

describe("createEmailClient", () => {
  describe("configuration", () => {
    it("creates client with default config", () => {
      const client = createEmailClient();

      expect(client).toBeDefined();
      expect(client.resend).toBeNull();
      expect(client.defaultFrom).toBe("noreply@example.com");
      expect(client.send).toBeDefined();
    });

    it("creates client with custom defaultFrom", () => {
      const client = createEmailClient({
        defaultFrom: "custom@example.com",
      });

      expect(client.defaultFrom).toBe("custom@example.com");
    });

    it("creates client with API key", () => {
      const client = createEmailClient({
        apiKey: "test-api-key",
      });

      expect(client.resend).toBeDefined();
      expect(client.resend).not.toBeNull();
    });

    it("creates client with custom config", () => {
      const client = createEmailClient({
        apiKey: "test-api-key",
        defaultFrom: "custom@example.com",
      });

      expect(client.resend).toBeDefined();
      expect(client.defaultFrom).toBe("custom@example.com");
    });
  });

  describe("send method", () => {
    it("returns error when API key not configured", async () => {
      const client = createEmailClient();

      const result = await client.send({
        from: "test@example.com",
        to: "user@example.com",
        subject: "Test",
        html: "<p>Test</p>",
      });

      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
      expect(result.error?.name).toBe("missing_api_key");
      expect(result.error?.message).toBe("API key not configured");
      expect(result.error?.statusCode).toBe(400);
    });

    it("has access to resend.emails.send when API key is configured", () => {
      const client = createEmailClient({
        apiKey: "test-api-key",
      });

      // Verify that resend client exists and has send method
      expect(client.resend).toBeDefined();
      expect(client.resend?.emails).toBeDefined();
      expect(typeof client.resend?.emails.send).toBe("function");
      expect(typeof client.send).toBe("function");
    });
  });

  describe("console warnings", () => {
    it("warns when created without API key", () => {
      // Clear any previous calls
      warnSpy.mockClear();

      createEmailClient();

      expect(warnSpy).toHaveBeenCalledWith(
        "Email client created without API key - emails will not be sent",
      );
    });

    it("does not warn when created with API key", () => {
      // Clear any previous calls
      warnSpy.mockClear();

      createEmailClient({
        apiKey: "test-api-key",
      });

      expect(warnSpy).not.toHaveBeenCalledWith(
        "Email client created without API key - emails will not be sent",
      );
    });

    it("warns when sending email without API key", async () => {
      // Clear any previous calls
      warnSpy.mockClear();

      const client = createEmailClient();

      await client.send({
        from: "test@example.com",
        to: "user@example.com",
        subject: "Test",
        html: "<p>Test</p>",
      });

      expect(warnSpy).toHaveBeenCalledWith(
        "Email not sent - API key not configured",
      );
    });
  });
});
