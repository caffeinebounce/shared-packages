import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock the stripe module
vi.mock("stripe", () => {
  const mockStripe = vi.fn().mockImplementation((secretKey: string, config: any) => ({
    _secretKey: secretKey,
    _config: config,
    refunds: {
      create: vi.fn(),
    },
    // Add other Stripe API methods as needed
  }));

  return {
    default: mockStripe,
  };
});

describe("Stripe Server Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the module cache to ensure fresh imports
    vi.resetModules();
  });

  describe("getStripe", () => {
    it("throws error when STRIPE_SECRET_KEY is not set", async () => {
      const originalEnv = process.env.STRIPE_SECRET_KEY;
      delete process.env.STRIPE_SECRET_KEY;

      const { getStripe } = await import("../stripe");

      await expect(getStripe()).rejects.toThrow("STRIPE_SECRET_KEY is not set");

      // Restore
      if (originalEnv) {
        process.env.STRIPE_SECRET_KEY = originalEnv;
      }
    });

    it("creates Stripe instance with correct config", async () => {
      process.env.STRIPE_SECRET_KEY = "sk_test_123";

      const { getStripe } = await import("../stripe");
      const stripe = await getStripe();

      expect(stripe).toBeDefined();
      expect(stripe._secretKey).toBe("sk_test_123");
      expect(stripe._config).toEqual({
        apiVersion: "2025-02-24.acacia",
        typescript: true,
      });
    });

    it("returns same instance on subsequent calls (singleton)", async () => {
      process.env.STRIPE_SECRET_KEY = "sk_test_123";

      const { getStripe } = await import("../stripe");
      const stripe1 = await getStripe();
      const stripe2 = await getStripe();

      expect(stripe1).toBe(stripe2);
    });
  });
});
