import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SocialLinks } from "./SocialLinks";

// Suppress React HTML nesting warnings from @react-email/components library
// The library generates nested table structures that React warns about
let errorSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  errorSpy.mockRestore();
});

describe("SocialLinks", () => {
  it("renders with default links", () => {
    const { container } = render(<SocialLinks />);

    const links = container.querySelectorAll("a");
    expect(links).toHaveLength(2);

    // Check LinkedIn link
    expect(links[0].getAttribute("href")).toBe(
      "https://linkedin.com/company/thecapitalcollective",
    );

    // Check Instagram link
    expect(links[1].getAttribute("href")).toBe(
      "https://instagram.com/thecapitalcollective",
    );
  });

  it("renders with custom links", () => {
    const customLinks = [
      {
        platform: "twitter" as const,
        url: "https://twitter.com/example",
      },
      {
        platform: "facebook" as const,
        url: "https://facebook.com/example",
      },
    ];

    const { container } = render(<SocialLinks links={customLinks} />);

    const links = container.querySelectorAll("a");
    expect(links).toHaveLength(2);

    expect(links[0].getAttribute("href")).toBe("https://twitter.com/example");
    expect(links[1].getAttribute("href")).toBe("https://facebook.com/example");
  });

  it("renders icons with default size", () => {
    const { container } = render(<SocialLinks />);

    const images = container.querySelectorAll("img");
    expect(images).toHaveLength(2);

    images.forEach((img) => {
      expect(img.getAttribute("width")).toBe("24");
      expect(img.getAttribute("height")).toBe("24");
    });
  });

  it("renders icons with custom size", () => {
    const { container } = render(<SocialLinks iconSize={32} />);

    const images = container.querySelectorAll("img");
    images.forEach((img) => {
      expect(img.getAttribute("width")).toBe("32");
      expect(img.getAttribute("height")).toBe("32");
    });
  });

  it("renders correct alt text for each platform", () => {
    const { container } = render(<SocialLinks />);

    const images = container.querySelectorAll("img");
    expect(images[0].getAttribute("alt")).toBe("LinkedIn");
    expect(images[1].getAttribute("alt")).toBe("Instagram");
  });

  it("renders all supported platforms", () => {
    const allPlatforms = [
      {
        platform: "linkedin" as const,
        url: "https://linkedin.com/company/test",
      },
      {
        platform: "instagram" as const,
        url: "https://instagram.com/test",
      },
      {
        platform: "twitter" as const,
        url: "https://twitter.com/test",
      },
      {
        platform: "facebook" as const,
        url: "https://facebook.com/test",
      },
    ];

    const { container } = render(<SocialLinks links={allPlatforms} />);

    const links = container.querySelectorAll("a");
    expect(links).toHaveLength(4);

    const images = container.querySelectorAll("img");
    expect(images[0].getAttribute("alt")).toBe("LinkedIn");
    expect(images[1].getAttribute("alt")).toBe("Instagram");
    expect(images[2].getAttribute("alt")).toBe("Twitter");
    expect(images[3].getAttribute("alt")).toBe("Facebook");
  });

  it("renders with single link", () => {
    const singleLink = [
      {
        platform: "linkedin" as const,
        url: "https://linkedin.com/company/test",
      },
    ];

    const { container } = render(<SocialLinks links={singleLink} />);

    const links = container.querySelectorAll("a");
    expect(links).toHaveLength(1);
  });

  it("renders with empty links array", () => {
    const { container } = render(<SocialLinks links={[]} />);

    const links = container.querySelectorAll("a");
    expect(links).toHaveLength(0);
  });

  it("generates data URI icons", () => {
    const { container } = render(<SocialLinks />);

    const images = container.querySelectorAll("img");
    images.forEach((img) => {
      const src = img.getAttribute("src");
      expect(src).toMatch(/^data:image\/svg\+xml;base64,/);
    });
  });
});
