import { render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import { AuthPageLayout } from "./AuthPageLayout";

vi.mock("@caffeinebounce/ui", () => ({
  BackgroundRippleEffect: () => <div data-testid="ripple-effect" />,
  RollingBackground: () => <div data-testid="rolling-background" />,
}));

describe("AuthPageLayout", () => {
  it("renders an external logo above the page content", () => {
    render(
      <AuthPageLayout externalLogo={{ src: "/brand.svg", alt: "Factory logo" }}>
        <main>Sign in form</main>
      </AuthPageLayout>,
    );

    const logo = screen.getByRole("img", { name: "Factory logo" });
    expect(logo).toHaveAttribute("src", "/brand.svg");
    expect(logo).toHaveAttribute("width", "180");
    expect(logo).toHaveAttribute("height", "180");
    expect(screen.getByText("Sign in form")).toBeInTheDocument();
  });

  it("applies external logo size presets", () => {
    render(
      <AuthPageLayout
        externalLogo={{ src: "/brand.svg", alt: "Factory logo" }}
        externalLogoSize="lg"
      >
        <main>Sign in form</main>
      </AuthPageLayout>,
    );

    const logo = screen.getByRole("img", { name: "Factory logo" });
    expect(logo).toHaveAttribute("width", "280");
    expect(logo).toHaveAttribute("height", "280");
    expect(logo).toHaveStyle({ maxWidth: "280px" });
  });

  it("uses a custom external logo image component", () => {
    function CustomImage({
      src,
      alt,
      width,
      height,
      className,
    }: ComponentProps<
      NonNullable<
        Parameters<typeof AuthPageLayout>[0]["ExternalLogoImageComponent"]
      >
    >) {
      return (
        <span
          aria-label={alt}
          className={className}
          data-height={height}
          data-src={src}
          data-testid="custom-logo"
          data-width={width}
          role="img"
        />
      );
    }

    render(
      <AuthPageLayout
        ExternalLogoImageComponent={CustomImage}
        externalLogo={{ src: "/custom.svg", alt: "Custom logo" }}
        externalLogoSize="sm"
      >
        <main>Sign in form</main>
      </AuthPageLayout>,
    );

    const logo = screen.getByTestId("custom-logo");
    expect(logo).toHaveAttribute("data-src", "/custom.svg");
    expect(logo).toHaveAttribute("data-width", "120");
    expect(logo).toHaveAttribute("data-height", "120");
  });
});
