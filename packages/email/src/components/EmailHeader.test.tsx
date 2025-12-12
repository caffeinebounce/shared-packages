import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EmailHeader } from "./EmailHeader";

describe("EmailHeader", () => {
  it("renders with default props", () => {
    const { container } = render(<EmailHeader />);

    const img = container.querySelector("img");
    expect(img).toBeDefined();
    expect(img?.getAttribute("src")).toBe(
      "https://compass.thecapitalcollective.org/logo.png",
    );
    expect(img?.getAttribute("width")).toBe("56");
    expect(img?.getAttribute("height")).toBe("56");
    expect(img?.getAttribute("alt")).toBe("Capital Collective");
  });

  it("renders with custom logo URL", () => {
    const { container } = render(
      <EmailHeader logoUrl="https://example.com/custom-logo.png" />,
    );

    const img = container.querySelector("img");
    expect(img?.getAttribute("src")).toBe(
      "https://example.com/custom-logo.png",
    );
  });

  it("renders with custom logo dimensions", () => {
    const { container } = render(
      <EmailHeader logoWidth={100} logoHeight={100} />,
    );

    const img = container.querySelector("img");
    expect(img?.getAttribute("width")).toBe("100");
    expect(img?.getAttribute("height")).toBe("100");
  });

  it("renders with custom logo alt text", () => {
    const { container } = render(<EmailHeader logoAlt="Custom Alt Text" />);

    const img = container.querySelector("img");
    expect(img?.getAttribute("alt")).toBe("Custom Alt Text");
  });

  it("renders brand name", () => {
    const { container } = render(<EmailHeader />);

    const brandName = container.textContent;
    expect(brandName).toContain("CAPITAL COMPASS");
  });

  it("renders brand tagline", () => {
    const { container } = render(<EmailHeader />);

    const tagline = container.textContent;
    expect(tagline).toContain("by The Capital Collective");
  });

  it("renders all elements with correct structure", () => {
    const { container } = render(<EmailHeader />);

    // Check for img element
    const img = container.querySelector("img");
    expect(img).toBeDefined();

    // Check for text content
    expect(container.textContent).toContain("CAPITAL COMPASS");
    expect(container.textContent).toContain("by The Capital Collective");
  });
});
