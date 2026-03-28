import { render, screen } from "@testing-library/react";
import type { ImgHTMLAttributes } from "react";
import { describe, expect, it, vi } from "vitest";
import { BlogPostHeader } from "./BlogPostHeader";

vi.mock("next/image", () => ({
  default: ({ alt, ...props }: ImgHTMLAttributes<HTMLImageElement>) => (
    <img alt={alt ?? ""} {...props} />
  ),
}));

describe("BlogPostHeader", () => {
  it("renders long-form valid dates via shared utils", () => {
    render(
      <BlogPostHeader title="Post title" date="2024-01-15T12:00:00.000Z" />,
    );

    expect(screen.getByText("January 15, 2024")).toBeInTheDocument();
  });

  it("renders an em dash for empty or invalid dates", () => {
    const { rerender } = render(<BlogPostHeader title="Post title" date="" />);

    expect(screen.getByText("—")).toBeInTheDocument();

    rerender(<BlogPostHeader title="Post title" date="not-a-date" />);

    expect(screen.getByText("—")).toBeInTheDocument();
  });
});
