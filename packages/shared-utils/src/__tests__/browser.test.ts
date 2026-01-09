import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { generateDeviceFingerprint } from "../browser";

// Mock browser APIs
const mockNavigator = {
  userAgent:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  platform: "MacIntel",
  language: "en-US",
};

const mockScreen = {
  width: 1920,
  height: 1080,
};

const mockIntl = {
  DateTimeFormat: () => ({
    resolvedOptions: () => ({ timeZone: "America/New_York" }),
  }),
};

describe("browser utilities", () => {
  describe("generateDeviceFingerprint", () => {
    beforeEach(() => {
      // Setup browser mocks
      vi.stubGlobal("navigator", mockNavigator);
      vi.stubGlobal("screen", mockScreen);
      vi.stubGlobal("Intl", mockIntl);
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it("should return device fingerprint with all properties", () => {
      const fingerprint = generateDeviceFingerprint();

      expect(fingerprint).toHaveProperty("userAgent");
      expect(fingerprint).toHaveProperty("platform");
      expect(fingerprint).toHaveProperty("language");
      expect(fingerprint).toHaveProperty("screenResolution");
      expect(fingerprint).toHaveProperty("timezone");
      expect(fingerprint).toHaveProperty("browserName");
      expect(fingerprint).toHaveProperty("osName");
    });

    it("should capture screen resolution correctly", () => {
      const fingerprint = generateDeviceFingerprint();
      expect(fingerprint.screenResolution).toBe("1920x1080");
    });

    it("should capture timezone correctly", () => {
      const fingerprint = generateDeviceFingerprint();
      expect(fingerprint.timezone).toBe("America/New_York");
    });

    it("should capture language correctly", () => {
      const fingerprint = generateDeviceFingerprint();
      expect(fingerprint.language).toBe("en-US");
    });

    describe("browser detection", () => {
      it("should detect Chrome browser", () => {
        vi.stubGlobal("navigator", {
          ...mockNavigator,
          userAgent:
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        });

        const fingerprint = generateDeviceFingerprint();
        expect(fingerprint.browserName).toBe("Chrome");
      });

      it("should detect Safari browser", () => {
        vi.stubGlobal("navigator", {
          ...mockNavigator,
          userAgent:
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
        });

        const fingerprint = generateDeviceFingerprint();
        expect(fingerprint.browserName).toBe("Safari");
      });

      it("should detect Firefox browser", () => {
        vi.stubGlobal("navigator", {
          ...mockNavigator,
          userAgent:
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0",
        });

        const fingerprint = generateDeviceFingerprint();
        expect(fingerprint.browserName).toBe("Firefox");
      });

      it("should detect Edge browser", () => {
        vi.stubGlobal("navigator", {
          ...mockNavigator,
          userAgent:
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
        });

        const fingerprint = generateDeviceFingerprint();
        expect(fingerprint.browserName).toBe("Edge");
      });

      it("should return undefined for unknown browsers", () => {
        vi.stubGlobal("navigator", {
          ...mockNavigator,
          userAgent: "Some Unknown Browser/1.0",
        });

        const fingerprint = generateDeviceFingerprint();
        expect(fingerprint.browserName).toBeUndefined();
      });
    });

    describe("OS detection", () => {
      it("should detect Windows OS", () => {
        vi.stubGlobal("navigator", {
          ...mockNavigator,
          platform: "Win32",
        });

        const fingerprint = generateDeviceFingerprint();
        expect(fingerprint.osName).toBe("Windows");
      });

      it("should detect macOS", () => {
        vi.stubGlobal("navigator", {
          ...mockNavigator,
          platform: "MacIntel",
        });

        const fingerprint = generateDeviceFingerprint();
        expect(fingerprint.osName).toBe("macOS");
      });

      it("should detect Linux", () => {
        vi.stubGlobal("navigator", {
          ...mockNavigator,
          platform: "Linux x86_64",
        });

        const fingerprint = generateDeviceFingerprint();
        expect(fingerprint.osName).toBe("Linux");
      });

      it("should detect iOS from iPhone platform", () => {
        vi.stubGlobal("navigator", {
          ...mockNavigator,
          platform: "iPhone",
        });

        const fingerprint = generateDeviceFingerprint();
        expect(fingerprint.osName).toBe("iOS");
      });

      it("should detect iOS from iPad platform", () => {
        vi.stubGlobal("navigator", {
          ...mockNavigator,
          platform: "iPad",
        });

        const fingerprint = generateDeviceFingerprint();
        expect(fingerprint.osName).toBe("iOS");
      });

      it("should detect Android from user agent", () => {
        vi.stubGlobal("navigator", {
          ...mockNavigator,
          platform: "Linux armv7l",
          userAgent:
            "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
        });

        const fingerprint = generateDeviceFingerprint();
        expect(fingerprint.osName).toBe("Android");
      });

      it("should return undefined for unknown OS", () => {
        vi.stubGlobal("navigator", {
          ...mockNavigator,
          platform: "UnknownOS",
          userAgent: "Generic/1.0",
        });

        const fingerprint = generateDeviceFingerprint();
        expect(fingerprint.osName).toBeUndefined();
      });
    });

    describe("fallback behavior", () => {
      it("should handle different screen resolutions", () => {
        vi.stubGlobal("screen", { width: 2560, height: 1440 });

        const fingerprint = generateDeviceFingerprint();
        expect(fingerprint.screenResolution).toBe("2560x1440");
      });

      it("should handle different timezones", () => {
        vi.stubGlobal("Intl", {
          DateTimeFormat: () => ({
            resolvedOptions: () => ({ timeZone: "Europe/London" }),
          }),
        });

        const fingerprint = generateDeviceFingerprint();
        expect(fingerprint.timezone).toBe("Europe/London");
      });
    });
  });
});
