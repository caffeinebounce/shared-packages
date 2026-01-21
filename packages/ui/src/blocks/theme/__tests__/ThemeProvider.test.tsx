import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getColorScheme, getDefaultTheme } from "../../../config/themes";
import {
  ThemeProvider,
  useThemeContext,
  useThemeContextOptional,
} from "../ThemeProvider";

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, "localStorage", { value: mockLocalStorage });

// Mock matchMedia
const mockMatchMedia = vi.fn((query: string) => ({
  matches: false,
  media: query,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
}));

Object.defineProperty(window, "matchMedia", { value: mockMatchMedia });

describe("ThemeProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.clear();
    document.documentElement.classList.remove("dark");
    document.documentElement.removeAttribute("data-theme");
  });

  describe("initialization", () => {
    it("uses defaultTheme when no stored preference", () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <ThemeProvider defaultTheme="light">{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useThemeContext(), { wrapper });

      expect(result.current.theme).toBe("light");
    });

    it("restores theme from localStorage", () => {
      mockLocalStorage.setItem("theme", "dark");

      const wrapper = ({ children }: { children: ReactNode }) => (
        <ThemeProvider defaultTheme="light">{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useThemeContext(), { wrapper });

      expect(result.current.theme).toBe("dark");
    });

    it("restores system preference from localStorage", () => {
      mockLocalStorage.setItem("theme-system", "true");

      const wrapper = ({ children }: { children: ReactNode }) => (
        <ThemeProvider defaultTheme="light" enableSystem>
          {children}
        </ThemeProvider>
      );

      const { result } = renderHook(() => useThemeContext(), { wrapper });

      expect(result.current.theme).toBe("system");
      expect(result.current.isSystemTheme).toBe(true);
    });
  });

  describe("setTheme", () => {
    it("updates theme state", () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <ThemeProvider defaultTheme="light">{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useThemeContext(), { wrapper });

      act(() => {
        result.current.setTheme("dark");
      });

      expect(result.current.theme).toBe("dark");
    });

    it("persists theme to localStorage", () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <ThemeProvider defaultTheme="light">{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useThemeContext(), { wrapper });

      act(() => {
        result.current.setTheme("dark");
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith("theme", "dark");
    });

    it("handles system theme specially", () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <ThemeProvider defaultTheme="light" enableSystem>
          {children}
        </ThemeProvider>
      );

      const { result } = renderHook(() => useThemeContext(), { wrapper });

      act(() => {
        result.current.setTheme("system");
      });

      expect(result.current.theme).toBe("system");
      expect(result.current.isSystemTheme).toBe(true);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "theme-system",
        "true",
      );
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("theme");
    });
  });

  describe("toggleTheme", () => {
    it("toggles from light to dark", () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <ThemeProvider defaultTheme="light">{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useThemeContext(), { wrapper });

      act(() => {
        result.current.toggleTheme();
      });

      expect(result.current.theme).toBe("dark");
    });

    it("toggles from dark to light", () => {
      mockLocalStorage.setItem("theme", "dark");

      const wrapper = ({ children }: { children: ReactNode }) => (
        <ThemeProvider defaultTheme="light">{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useThemeContext(), { wrapper });

      act(() => {
        result.current.toggleTheme();
      });

      expect(result.current.theme).toBe("light");
    });
  });

  describe("setSystemTheme", () => {
    it("sets theme to system", () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <ThemeProvider defaultTheme="light" enableSystem>
          {children}
        </ThemeProvider>
      );

      const { result } = renderHook(() => useThemeContext(), { wrapper });

      act(() => {
        result.current.setSystemTheme();
      });

      expect(result.current.theme).toBe("system");
      expect(result.current.isSystemTheme).toBe(true);
    });
  });

  describe("colorScheme", () => {
    it("returns light for light themes", () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <ThemeProvider defaultTheme="light">{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useThemeContext(), { wrapper });

      expect(result.current.colorScheme).toBe("light");
    });

    it("returns dark for dark themes", () => {
      mockLocalStorage.setItem("theme", "dark");

      const wrapper = ({ children }: { children: ReactNode }) => (
        <ThemeProvider defaultTheme="light">{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useThemeContext(), { wrapper });

      expect(result.current.colorScheme).toBe("dark");
    });
  });

  describe("themes list", () => {
    it("includes all default themes", () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useThemeContext(), { wrapper });

      expect(result.current.themes).toContain("light");
      expect(result.current.themes).toContain("dark");
      expect(result.current.themes).toContain("high-contrast");
    });

    it("includes custom themes when provided", () => {
      const customThemes = {
        "custom-theme": {
          name: "custom-theme",
          displayName: "Custom",
          colorScheme: "light" as const,
          colors: {} as Record<string, string>,
          radius: "0.5rem",
          shadowIntensity: 1,
        },
      };

      const wrapper = ({ children }: { children: ReactNode }) => (
        <ThemeProvider themes={customThemes}>{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useThemeContext(), { wrapper });

      expect(result.current.themes).toContain("custom-theme");
    });
  });
});

describe("useThemeContextOptional", () => {
  it("returns undefined when not in provider", () => {
    const { result } = renderHook(() => useThemeContextOptional());

    expect(result.current).toBeUndefined();
  });

  it("returns context when in provider", () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    );

    const { result } = renderHook(() => useThemeContextOptional(), { wrapper });

    expect(result.current).toBeDefined();
    expect(result.current?.theme).toBe("light");
  });
});

describe("useThemeContext", () => {
  it("throws when not in provider", () => {
    expect(() => {
      renderHook(() => useThemeContext());
    }).toThrow("useThemeContext must be used within a ThemeProvider");
  });
});

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
