import { describe, expect, it } from "vitest";
import { getColorScheme, getDefaultTheme } from "../../../config/themes";

describe("theme utility functions", () => {
  describe("getDefaultTheme", () => {
    it("returns theme for valid name", () => {
      const theme = getDefaultTheme("light");
      expect(theme).toBeDefined();
      expect(theme?.name).toBe("light");
    });

    it("returns undefined for invalid name", () => {
      const theme = getDefaultTheme("nonexistent");
      expect(theme).toBeUndefined();
    });
  });

  describe("getColorScheme", () => {
    it("returns light for light themes", () => {
      expect(getColorScheme("light")).toBe("light");
      expect(getColorScheme("colorful")).toBe("light");
    });

    it("returns dark for dark themes", () => {
      expect(getColorScheme("dark")).toBe("dark");
      expect(getColorScheme("high-contrast-dark")).toBe("dark");
    });

    it("returns light for unknown themes", () => {
      expect(getColorScheme("nonexistent")).toBe("light");
    });
  });
});
