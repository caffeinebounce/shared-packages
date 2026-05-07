import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Footer } from "./Footer";

describe("Footer", () => {
  it("uses the shared container defaults in the default variant", () => {
    const { container } = render(
      <Footer logo={<span>Logo</span>} copyright="Copyright" />,
    );

    const footerContainer = container.querySelector(
      '[data-slot="footer-container"]',
    );

    expect(footerContainer).toHaveClass("w-full");
    expect(footerContainer).toHaveClass("px-4");
    expect(footerContainer).toHaveClass("sm:px-6");
    expect(footerContainer).toHaveClass("lg:px-8");
    expect(footerContainer).not.toHaveClass("md:px-8");
  });

  it("uses the shared container defaults in the brand variant", () => {
    const { container } = render(
      <Footer variant="brand" logo={<span>Logo</span>} copyright="Copyright" />,
    );

    const footerContainer = container.querySelector(
      '[data-slot="footer-container"]',
    );

    expect(footerContainer).toHaveClass("w-full");
    expect(footerContainer).toHaveClass("px-4");
    expect(footerContainer).toHaveClass("sm:px-6");
    expect(footerContainer).toHaveClass("lg:px-8");
    expect(footerContainer).not.toHaveClass("md:px-8");
  });

  it("preserves custom container overrides", () => {
    const { container } = render(
      <Footer
        variant="brand"
        logo={<span>Logo</span>}
        copyright="Copyright"
        containerClassName="max-w-5xl"
      />,
    );

    const footerContainer = container.querySelector(
      '[data-slot="footer-container"]',
    );

    expect(footerContainer).toHaveClass("max-w-5xl");
  });

  it("renders logo in the minimal variant", () => {
    const { container } = render(
      <Footer
        variant="minimal"
        logo={<span>Factory</span>}
        copyright="Copyright"
      />,
    );

    const logo = container.querySelector('[data-slot="footer-logo"]');

    expect(logo).toHaveTextContent("Factory");
  });
});
