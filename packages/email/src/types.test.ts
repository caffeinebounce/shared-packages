import { describe, expect, it } from "vitest";
import type { SendEmailResult } from "./types";
import type {
  EmailPayload,
  EmailSendOptions,
  EmailTransport,
} from "./types/provider";

describe("types", () => {
  it("exports SendEmailResult type", () => {
    const successResult: SendEmailResult = {
      success: true,
      id: "test-id",
    };

    expect(successResult.success).toBe(true);
    expect(successResult.id).toBe("test-id");
  });

  it("SendEmailResult allows error property", () => {
    const errorResult: SendEmailResult = {
      success: false,
      error: "Test error",
    };

    expect(errorResult.success).toBe(false);
    expect(errorResult.error).toBe("Test error");
  });

  it("SendEmailResult allows all optional properties", () => {
    const minimalResult: SendEmailResult = {
      success: true,
    };

    expect(minimalResult.success).toBe(true);
    expect(minimalResult.id).toBeUndefined();
    expect(minimalResult.error).toBeUndefined();
  });
});

describe("EmailTransport", () => {
  it("accepts optional provider send options without requiring them", async () => {
    const receivedOptions: Array<EmailSendOptions | undefined> = [];
    const transport: EmailTransport = {
      async send(_payload, options) {
        receivedOptions.push(options);
        return { success: true };
      },
    };
    const payload: EmailPayload = {
      from: "test@example.com",
      to: "member@example.com",
      subject: "Welcome",
      html: "<p>Welcome</p>",
    };

    await transport.send(payload);
    await transport.send(payload, { idempotencyKey: "club-member-1" });

    expect(receivedOptions).toEqual([
      undefined,
      { idempotencyKey: "club-member-1" },
    ]);
  });
});
