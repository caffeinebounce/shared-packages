import { render, screen } from "@testing-library/react";
import type { AnchorHTMLAttributes, ImgHTMLAttributes } from "react";
import { describe, expect, it, vi } from "vitest";
import { BlogCardGrid } from "./BlogCardGrid";

vi.mock("next/image", () => ({
  default: ({ alt, ...props }: ImgHTMLAttributes<HTMLImageElement>) => (
    <img alt={alt ?? ""} {...props} />
  ),
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("BlogCardGrid", () => {
  const basePost = {
    slug: "hello-world",
    title: "Hello World",
  };

  it("renders long-form valid dates via shared utils", () => {
    render(
      <BlogCardGrid posts={[{ ...basePost, date: "2024-01-15T12:00:00" }]} />,
    );

    expect(screen.getByText("January 15, 2024")).toBeInTheDocument();
  });

  it("renders an em dash for empty or invalid dates", () => {
    const { rerender } = render(
      <BlogCardGrid posts={[{ ...basePost, date: "" }]} />,
    );

    expect(screen.getByText("—")).toBeInTheDocument();

    rerender(<BlogCardGrid posts={[{ ...basePost, date: "not-a-date" }]} />);

    expect(screen.getByText("—")).toBeInTheDocument();
  });
});
