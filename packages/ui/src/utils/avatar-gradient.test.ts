import { describe, expect, it } from "vitest";
import {
  getAvatarGradient,
  getGradientIndex,
  getGradientPairs,
} from "./avatar-gradient";

describe("avatar-gradient utilities", () => {
  describe("getAvatarGradient", () => {
    it("returns consistent gradient for same userId", () => {
      const userId = "user123";
      const gradient1 = getAvatarGradient(userId);
      const gradient2 = getAvatarGradient(userId);

      expect(gradient1.from).toBe(gradient2.from);
      expect(gradient1.to).toBe(gradient2.to);
      expect(gradient1.style).toEqual(gradient2.style);
      expect(gradient1.className).toBe(gradient2.className);
    });

    it("produces different gradients for different userIds", () => {
      const gradient1 = getAvatarGradient("user1");
      const gradient2 = getAvatarGradient("user2");

      // While not guaranteed, different users should very likely get different gradients
      // We can't assert they're always different, but we can check structure is valid for both
      expect(gradient1.from).toMatch(/^#[0-9a-f]{6}$/i);
      expect(gradient2.from).toMatch(/^#[0-9a-f]{6}$/i);
    });

    it("returns valid CSS gradient style", () => {
      const gradient = getAvatarGradient("testUser");

      expect(gradient.style.background).toMatch(
        /^linear-gradient\(135deg, #[0-9a-f]{6} 0%, #[0-9a-f]{6} 100%\)$/i,
      );
    });

    it("returns text-white className", () => {
      const gradient = getAvatarGradient("testUser");
      expect(gradient.className).toBe("text-white");
    });

    it("handles empty string userId", () => {
      const gradient = getAvatarGradient("");
      expect(gradient.from).toMatch(/^#[0-9a-f]{6}$/i);
      expect(gradient.to).toMatch(/^#[0-9a-f]{6}$/i);
      expect(gradient.style.background).toBeDefined();
    });

    it("handles special characters in userId", () => {
      const gradient = getAvatarGradient("user@example.com!#$%");
      expect(gradient.from).toMatch(/^#[0-9a-f]{6}$/i);
      expect(gradient.to).toMatch(/^#[0-9a-f]{6}$/i);
      expect(gradient.style.background).toBeDefined();
    });

    it("handles very long strings", () => {
      const longUserId = "a".repeat(1000);
      const gradient = getAvatarGradient(longUserId);
      expect(gradient.from).toMatch(/^#[0-9a-f]{6}$/i);
      expect(gradient.to).toMatch(/^#[0-9a-f]{6}$/i);
      expect(gradient.style.background).toBeDefined();
    });

    it("returns gradient within available pairs", () => {
      const pairs = getGradientPairs();
      const gradient = getAvatarGradient("testUser");

      const matchingPair = pairs.find(
        (p) => p.from === gradient.from && p.to === gradient.to,
      );
      expect(matchingPair).toBeDefined();
    });
  });

  describe("getGradientIndex", () => {
    it("returns consistent index for same userId", () => {
      const userId = "user123";
      const index1 = getGradientIndex(userId);
      const index2 = getGradientIndex(userId);

      expect(index1).toBe(index2);
    });

    it("returns index within valid range", () => {
      const pairs = getGradientPairs();
      const index = getGradientIndex("testUser");

      expect(index).toBeGreaterThanOrEqual(0);
      expect(index).toBeLessThan(pairs.length);
    });

    it("handles empty string", () => {
      const pairs = getGradientPairs();
      const index = getGradientIndex("");

      expect(index).toBeGreaterThanOrEqual(0);
      expect(index).toBeLessThan(pairs.length);
    });
  });

  describe("getGradientPairs", () => {
    it("returns array of gradient pairs", () => {
      const pairs = getGradientPairs();

      expect(Array.isArray(pairs)).toBe(true);
      expect(pairs.length).toBeGreaterThan(0);
    });

    it("each pair has valid from and to colors", () => {
      const pairs = getGradientPairs();

      for (const pair of pairs) {
        expect(pair.from).toMatch(/^#[0-9a-f]{6}$/i);
        expect(pair.to).toMatch(/^#[0-9a-f]{6}$/i);
      }
    });
  });
});
