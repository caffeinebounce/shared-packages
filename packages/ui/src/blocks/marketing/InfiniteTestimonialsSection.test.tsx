import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { InfiniteTestimonialsSection } from "./InfiniteTestimonialsSection";

describe("InfiniteTestimonialsSection", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockImplementation(() => ({
        matches: false,
        media: "",
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders duplicated marquee cards", () => {
    render(
      <InfiniteTestimonialsSection
        testimonials={[
          { id: "1", quote: "Great", author: "Alex" },
          { id: "2", quote: "Love it", author: "Sam" },
        ]}
      />,
    );

    expect(screen.getAllByText("Great").length).toBeGreaterThan(1);
    expect(screen.getAllByText("Love it").length).toBeGreaterThan(1);
  });
});
