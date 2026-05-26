import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { OAuthButtons } from "./OAuthButtons";

vi.mock("@caffeinebounce/ui/primitives", () => ({
  Button: ({
    children,
    className,
    disabled,
    onClick,
    ...props
  }: ButtonHTMLAttributes<HTMLButtonElement> & {
    children: ReactNode;
    className?: string;
  }) => (
    <button
      className={className}
      disabled={disabled}
      onClick={onClick}
      type="button"
      {...props}
    >
      {children}
    </button>
  ),
  cn: (...classes: Array<string | false | null | undefined>) =>
    classes.filter(Boolean).join(" "),
}));

describe("OAuthButtons", () => {
  it("renders configured providers and calls the selected provider", async () => {
    const user = userEvent.setup();
    const onProviderSelect = vi.fn();

    render(
      <OAuthButtons
        providers={["google", "azure"]}
        loadingProvider={null}
        onProviderSelect={onProviderSelect}
      />,
    );

    await user.click(screen.getByRole("button", { name: /google/i }));
    await user.click(screen.getByRole("button", { name: /microsoft/i }));

    expect(onProviderSelect).toHaveBeenNthCalledWith(1, "google");
    expect(onProviderSelect).toHaveBeenNthCalledWith(2, "azure");
  });

  it("disables coming-soon providers without calling selection", async () => {
    const user = userEvent.setup();
    const onProviderSelect = vi.fn();

    render(
      <OAuthButtons
        providers={["google", "azure"]}
        googleComingSoon
        loadingProvider={null}
        onProviderSelect={onProviderSelect}
      />,
    );

    expect(screen.getByRole("button", { name: /google/i })).toBeDisabled();
    expect(screen.getByText("Soon")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /google/i }));
    expect(onProviderSelect).not.toHaveBeenCalled();
  });

  it("shows the signin last-used badge without showing it for coming-soon providers", () => {
    render(
      <OAuthButtons
        providers={["google", "azure"]}
        azureComingSoon
        loadingProvider={null}
        onProviderSelect={vi.fn()}
        isLastMethod={(method) => method === "google" || method === "azure"}
        showLastUsedBadge
        mode="signin"
      />,
    );

    expect(screen.getByText("Last Used")).toBeInTheDocument();
    expect(screen.getAllByText("Soon")).toHaveLength(1);
  });

  it("shows loading state and disables all providers while redirecting", () => {
    render(
      <OAuthButtons
        providers={["google", "azure"]}
        loadingProvider="azure"
        onProviderSelect={vi.fn()}
        mode="signin"
      />,
    );

    expect(screen.getByRole("button", { name: /google/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /microsoft/i })).toBeDisabled();
    expect(screen.getByText("Redirecting...")).toBeInTheDocument();
  });

  it("uses the signup loading overlay style without the signin background class", () => {
    render(
      <OAuthButtons
        providers={["google"]}
        loadingProvider="google"
        onProviderSelect={vi.fn()}
      />,
    );

    expect(screen.getByText("Redirecting...")).toHaveClass("opacity-100");
    expect(screen.getByText("Redirecting...")).not.toHaveClass("bg-muted/50");
  });
});
