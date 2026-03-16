import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { StickyScrollStorySection } from "./StickyScrollStorySection";

class IO {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
}

describe("StickyScrollStorySection", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "IntersectionObserver",
      IO as unknown as typeof IntersectionObserver,
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders steps and first visual", () => {
    render(
      <StickyScrollStorySection
        items={[
          {
            id: "1",
            title: "Plan",
            body: "Define the work",
            visual: <div>One</div>,
          },
          {
            id: "2",
            title: "Ship",
            body: "Deploy safely",
            visual: <div>Two</div>,
          },
        ]}
      />,
    );

    expect(screen.getByText("Plan")).toBeInTheDocument();
    expect(screen.getByText("Ship")).toBeInTheDocument();
    expect(screen.getByText("One")).toBeInTheDocument();
  });
});
