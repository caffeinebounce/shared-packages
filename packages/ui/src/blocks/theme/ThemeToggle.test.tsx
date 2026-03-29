import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode, SVGProps } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ThemeToggle } from "./ThemeToggle";

const mockThemeState = vi.hoisted(() => ({
  resolvedTheme: "light" as string | undefined,
  setTheme: vi.fn(),
  theme: "light" as string | undefined,
}));

vi.mock("next-themes", () => ({
  useTheme: () => mockThemeState,
}));

vi.mock("lucide-react", () => ({
  Monitor: (props: SVGProps<SVGSVGElement>) => (
    <svg data-icon="monitor" {...props} />
  ),
  Moon: (props: SVGProps<SVGSVGElement>) => <svg data-icon="moon" {...props} />,
  Sun: (props: SVGProps<SVGSVGElement>) => <svg data-icon="sun" {...props} />,
}));

vi.mock("../../components/ui/tooltip", () => ({
  Tooltip: ({ children }: { children: ReactNode }) => <>{children}</>,
  TooltipContent: ({ children }: { children: ReactNode }) => (
    <div data-testid="tooltip-content">{children}</div>
  ),
  TooltipTrigger: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

function mockMatchMedia(matches: boolean) {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      addListener: vi.fn(),
      dispatchEvent: vi.fn(),
      removeEventListener: vi.fn(),
      removeListener: vi.fn(),
    })),
  });
}

function setMockTheme(
  theme: "light" | "dark" | "system",
  resolvedTheme: "light" | "dark" = theme === "dark" ? "dark" : "light",
) {
  mockThemeState.theme = theme;
  mockThemeState.resolvedTheme = resolvedTheme;
  document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
}

describe("ThemeToggle", () => {
  beforeEach(() => {
    mockThemeState.setTheme.mockReset();
    mockMatchMedia(false);
    setMockTheme("light");
    document.documentElement.className = "";
    localStorage.clear();
  });

  it("keeps the default binary toggle behavior", async () => {
    render(<ThemeToggle />);

    await waitFor(() => {
      expect(screen.getByRole("button")).toHaveAttribute(
        "aria-label",
        "Switch theme to dark",
      );
    });

    expect(screen.getByTestId("tooltip-content")).toHaveTextContent(
      "Switch theme to dark",
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Switch theme to dark" }),
    );

    expect(mockThemeState.setTheme).toHaveBeenCalledWith("dark");
    expect(document.documentElement).toHaveClass("dark");
    expect(localStorage.getItem("theme")).toBe("dark");
  });

  it("cycles light, dark, system, then light when system mode is enabled", async () => {
    const { rerender } = render(<ThemeToggle includeSystem />);

    await waitFor(() => {
      expect(screen.getByRole("button")).toHaveAttribute(
        "aria-label",
        "Switch theme to dark",
      );
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Switch theme to dark" }),
    );
    expect(mockThemeState.setTheme).toHaveBeenLastCalledWith("dark");
    expect(localStorage.getItem("theme")).toBe("dark");
    expect(document.documentElement).toHaveClass("dark");

    setMockTheme("dark", "dark");
    mockMatchMedia(false);
    rerender(<ThemeToggle includeSystem />);

    await waitFor(() => {
      expect(screen.getByRole("button")).toHaveAttribute(
        "aria-label",
        "Switch theme to system",
      );
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Switch theme to system" }),
    );
    expect(mockThemeState.setTheme).toHaveBeenLastCalledWith("system");
    expect(localStorage.getItem("theme")).toBe("system");
    expect(document.documentElement).not.toHaveClass("dark");

    setMockTheme("system", "dark");
    rerender(<ThemeToggle includeSystem />);

    await waitFor(() => {
      expect(screen.getByRole("button")).toHaveAttribute(
        "aria-label",
        "Switch theme to light",
      );
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Switch theme to light" }),
    );
    expect(mockThemeState.setTheme).toHaveBeenLastCalledWith("light");
    expect(localStorage.getItem("theme")).toBe("light");
    expect(document.documentElement).not.toHaveClass("dark");
  });

  it("cycles themes from the keyboard shortcut", async () => {
    setMockTheme("dark", "dark");
    mockMatchMedia(true);

    render(
      <ThemeToggle
        includeSystem
        shortcut={{ ctrl: true, key: "l" }}
        shortcutDisplay="⌃L"
      />,
    );

    await waitFor(() => {
      expect(screen.getByRole("button")).toHaveAttribute(
        "aria-label",
        "Switch theme to system",
      );
    });

    fireEvent.keyDown(window, { ctrlKey: true, key: "l" });

    expect(mockThemeState.setTheme).toHaveBeenCalledWith("system");
    expect(localStorage.getItem("theme")).toBe("system");
    expect(document.documentElement).toHaveClass("dark");
  });

  it("renders next-action icons and labels for each state", async () => {
    const { rerender } = render(<ThemeToggle includeSystem />);

    await waitFor(() => {
      expect(screen.getByRole("button")).toHaveAttribute(
        "aria-label",
        "Switch theme to dark",
      );
    });

    let button = screen.getByRole("button", { name: "Switch theme to dark" });
    expect(button.querySelector('svg[data-icon="moon"]')).toBeInTheDocument();

    setMockTheme("dark", "dark");
    rerender(<ThemeToggle includeSystem />);

    await waitFor(() => {
      expect(screen.getByRole("button")).toHaveAttribute(
        "aria-label",
        "Switch theme to system",
      );
    });

    button = screen.getByRole("button", { name: "Switch theme to system" });
    expect(
      button.querySelector('svg[data-icon="monitor"]'),
    ).toBeInTheDocument();

    setMockTheme("system", "dark");
    rerender(<ThemeToggle includeSystem />);

    await waitFor(() => {
      expect(screen.getByRole("button")).toHaveAttribute(
        "aria-label",
        "Switch theme to light",
      );
    });

    button = screen.getByRole("button", { name: "Switch theme to light" });
    expect(button.querySelector('svg[data-icon="sun"]')).toBeInTheDocument();
  });

  it("prefers custom tooltip content over the default label", async () => {
    render(
      <ThemeToggle includeSystem tooltip={<span>Custom theme tooltip</span>} />,
    );

    await waitFor(() => {
      expect(screen.getByRole("button")).toHaveAttribute(
        "aria-label",
        "Switch theme to dark",
      );
    });

    expect(screen.getByTestId("tooltip-content")).toHaveTextContent(
      "Custom theme tooltip",
    );
    expect(screen.getByTestId("tooltip-content")).not.toHaveTextContent(
      "Switch theme to dark",
    );
  });
});
