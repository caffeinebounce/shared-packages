import { describe, expect, it } from "vitest";
import type { SendEmailResult } from "./types";

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
