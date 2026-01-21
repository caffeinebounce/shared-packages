import { beforeEach, describe, expect, it, vi } from "vitest";
import { createRefund } from "../refunds";

// Mock the stripe module
const mockRefundsCreate = vi.fn();

vi.mock("../stripe", () => ({
  getStripe: vi.fn().mockResolvedValue({
    refunds: {
      create: mockRefundsCreate,
    },
  }),
}));

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

      mockRefundsCreate.mockResolvedValueOnce(mockRefund);

      const result = await createRefund("pi_123");

      expect(mockRefundsCreate).toHaveBeenCalledWith({
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

      mockRefundsCreate.mockResolvedValueOnce(mockRefund);

      const result = await createRefund("pi_123", 500);

      expect(mockRefundsCreate).toHaveBeenCalledWith({
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

      mockRefundsCreate.mockResolvedValueOnce(mockRefund);

      const result = await createRefund("pi_123", undefined, "fraudulent");

      expect(mockRefundsCreate).toHaveBeenCalledWith({
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

      mockRefundsCreate.mockResolvedValueOnce(mockRefund);

      const result = await createRefund("pi_123", 0, "duplicate");

      expect(mockRefundsCreate).toHaveBeenCalledWith({
        payment_intent: "pi_123",
        amount: 0,
        reason: "duplicate",
      });
      expect(result).toEqual(mockRefund);
    });

    it("propagates Stripe API errors", async () => {
      mockRefundsCreate.mockRejectedValueOnce(new Error("Insufficient funds"));

      await expect(createRefund("pi_123")).rejects.toThrow("Insufficient funds");
    });
  });
});
