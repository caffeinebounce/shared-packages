import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createEmailClient,
  type EmailClient,
  type EmailClientConfig,
  EmailHeader,
  type SendEmailResult,
  SocialLinks,
  UnsubscribeBlock,
} from "./index";

// Mock console.warn to suppress expected warnings when creating client without API key
let warnSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  warnSpy.mockRestore();
});

describe("package exports", () => {
  it("exports createEmailClient function", () => {
    expect(createEmailClient).toBeDefined();
    expect(typeof createEmailClient).toBe("function");
  });

  it("exports EmailHeader component", () => {
    expect(EmailHeader).toBeDefined();
    expect(typeof EmailHeader).toBe("function");
  });

  it("exports SocialLinks component", () => {
    expect(SocialLinks).toBeDefined();
    expect(typeof SocialLinks).toBe("function");
  });

  it("exports UnsubscribeBlock component", () => {
    expect(UnsubscribeBlock).toBeDefined();
    expect(typeof UnsubscribeBlock).toBe("function");
  });

  it("exports EmailClient type", () => {
    const client = createEmailClient();
    const typedClient: EmailClient = client;
    expect(typedClient).toBeDefined();
  });

  it("exports EmailClientConfig type", () => {
    const config: EmailClientConfig = {
      apiKey: "test", // pragma: allowlist secret
      defaultFrom: "test@example.com",
    };
    expect(config).toBeDefined();
  });

  it("exports SendEmailResult type", () => {
    const result: SendEmailResult = {
      success: true,
      id: "test",
    };
    expect(result).toBeDefined();
  });

  it("all exports are accessible", () => {
    // This test ensures all named exports are accessible
    const exports = {
      createEmailClient,
      EmailHeader,
      SocialLinks,
      UnsubscribeBlock,
    };

    Object.values(exports).forEach((exportedValue) => {
      expect(exportedValue).toBeDefined();
    });
  });
});
