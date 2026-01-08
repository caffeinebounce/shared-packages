import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { SocialPlatform } from "../social-icon";
import { SocialIcon, socialPlatforms } from "../social-icon";

describe("SocialIcon", () => {
  it("renders an SVG icon", () => {
    render(<SocialIcon platform="linkedin" />);
    const svg = document.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("applies default size of 16", () => {
    render(<SocialIcon platform="linkedin" />);
    const svg = document.querySelector("svg");
    expect(svg).toHaveAttribute("width", "16");
    expect(svg).toHaveAttribute("height", "16");
  });

  it("applies custom size", () => {
    render(<SocialIcon platform="linkedin" size={32} />);
    const svg = document.querySelector("svg");
    expect(svg).toHaveAttribute("width", "32");
    expect(svg).toHaveAttribute("height", "32");
  });

  it("renders as a link when href is provided", () => {
    render(
      <SocialIcon platform="linkedin" href="https://linkedin.com/in/test" />,
    );
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "https://linkedin.com/in/test");
  });

  it("opens in new tab when newTab is true", () => {
    render(
      <SocialIcon platform="github" href="https://github.com/test" newTab />,
    );
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("does not add target/rel when newTab is false", () => {
    render(
      <SocialIcon
        platform="github"
        href="https://github.com/test"
        newTab={false}
      />,
    );
    const link = screen.getByRole("link");
    expect(link).not.toHaveAttribute("target");
    expect(link).not.toHaveAttribute("rel");
  });

  it("applies custom className", () => {
    render(<SocialIcon platform="linkedin" className="custom-class" />);
    const svg = document.querySelector("svg");
    expect(svg).toHaveClass("custom-class");
  });

  it("renders all supported platforms without error", () => {
    const platforms: SocialPlatform[] = [
      "x",
      "twitter",
      "facebook",
      "instagram",
      "linkedin",
      "pinterest",
      "youtube",
      "tiktok",
      "github",
    ];

    platforms.forEach((platform) => {
      const { container } = render(<SocialIcon platform={platform} />);
      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });
  });

  it("exports socialPlatforms array", () => {
    expect(socialPlatforms).toContain("linkedin");
    expect(socialPlatforms).toContain("x");
    expect(socialPlatforms).toContain("github");
    expect(socialPlatforms).toHaveLength(9);
  });

  it("renders accessible label by default", () => {
    render(<SocialIcon platform="linkedin" />);
    const svg = screen.getByRole("img", { name: "LinkedIn" });
    expect(svg).toBeInTheDocument();
  });
});
