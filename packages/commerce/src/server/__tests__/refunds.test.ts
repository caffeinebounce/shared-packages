import { beforeEach, describe, expect, it, vi } from "vitest";
import { createRefund } from "../refunds";

// Store for mock reference (vi.mock is hoisted, so we use globalThis)
declare global {
  var __mockRefundsCreate: ReturnType<typeof vi.fn> | undefined;
}

vi.mock("../stripe", () => {
  // Create mock inside factory since vi.mock is hoisted
  const mockRefundsCreate = vi.fn();
  // Store reference on globalThis for external access
  globalThis.__mockRefundsCreate = mockRefundsCreate;
  return {
    getStripe: vi.fn().mockResolvedValue({
      refunds: {
        create: mockRefundsCreate,
      },
    }),
  };
});

// Helper to get the mock (available after module initialization)
const getMockRefundsCreate = () => globalThis.__mockRefundsCreate!;

describe("Refunds", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createRefund", () => {
    it("creates a full refund by default", async () => {
      const mockRefund = {
        id: "re_123",
        amount: 1000,
        status: "succeeded",
      };

      getMockRefundsCreate().mockResolvedValueOnce(mockRefund);

      const result = await createRefund("pi_123");

      expect(getMockRefundsCreate()).toHaveBeenCalledWith({
        payment_intent: "pi_123",
        reason: "requested_by_customer",
      });
      expect(result).toEqual(mockRefund);
    });

    it("creates a partial refund when amount is specified", async () => {
      const mockRefund = {
        id: "re_123",
        amount: 500,
        status: "succeeded",
      };

      getMockRefundsCreate().mockResolvedValueOnce(mockRefund);

      const result = await createRefund("pi_123", 500);

      expect(getMockRefundsCreate()).toHaveBeenCalledWith({
        payment_intent: "pi_123",
        amount: 500,
        reason: "requested_by_customer",
      });
      expect(result).toEqual(mockRefund);
    });

    it("accepts custom refund reason", async () => {
      const mockRefund = {
        id: "re_123",
        amount: 1000,
        status: "succeeded",
      };

      getMockRefundsCreate().mockResolvedValueOnce(mockRefund);

      const result = await createRefund("pi_123", undefined, "fraudulent");

      expect(getMockRefundsCreate()).toHaveBeenCalledWith({
        payment_intent: "pi_123",
        reason: "fraudulent",
      });
      expect(result).toEqual(mockRefund);
    });

    it("handles zero-value refunds correctly", async () => {
      const mockRefund = {
        id: "re_123",
        amount: 0,
        status: "succeeded",
      };

      getMockRefundsCreate().mockResolvedValueOnce(mockRefund);

      const result = await createRefund("pi_123", 0, "duplicate");

      expect(getMockRefundsCreate()).toHaveBeenCalledWith({
        payment_intent: "pi_123",
        amount: 0,
        reason: "duplicate",
      });
      expect(result).toEqual(mockRefund);
    });

    it("propagates Stripe API errors", async () => {
      getMockRefundsCreate().mockRejectedValueOnce(
        new Error("Insufficient funds"),
      );

      await expect(createRefund("pi_123")).rejects.toThrow(
        "Insufficient funds",
      );
    });
  });
});
