import { render, screen } from "@testing-library/react";
import type { ImgHTMLAttributes } from "react";
import { describe, expect, it, vi } from "vitest";
import { MediaCard } from "./MediaCard";

vi.mock("next/image", () => ({
  default: ({ alt, ...props }: ImgHTMLAttributes<HTMLImageElement>) => (
    <img alt={alt ?? ""} {...props} />
  ),
}));

describe("MediaCard", () => {
  const baseItem = {
    title: "Press Feature",
    publication: "Daily Planet",
    url: "https://example.com/story",
  };

  it("renders long-form valid dates via shared utils", () => {
    render(<MediaCard item={{ ...baseItem, date: "2024-01-15T12:00:00" }} />);

    expect(screen.getByText("January 15, 2024")).toBeInTheDocument();
  });

  it("renders an em dash for empty or invalid dates", () => {
    const { rerender } = render(<MediaCard item={{ ...baseItem, date: "" }} />);

    expect(screen.getByText("—")).toBeInTheDocument();

    rerender(<MediaCard item={{ ...baseItem, date: "not-a-date" }} />);

    expect(screen.getByText("—")).toBeInTheDocument();
  });
});
