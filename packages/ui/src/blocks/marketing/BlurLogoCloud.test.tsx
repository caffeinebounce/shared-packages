import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { BlurLogoCloud } from "./BlurLogoCloud";

const originalIntersectionObserver = globalThis.IntersectionObserver;

class IntersectionObserverMock {
  disconnect() {}

  observe() {}

  unobserve() {}
}

beforeEach(() => {
  globalThis.IntersectionObserver =
    IntersectionObserverMock as unknown as typeof IntersectionObserver;
});

afterEach(() => {
  globalThis.IntersectionObserver = originalIntersectionObserver;
});

describe("BlurLogoCloud", () => {
  it("renders logo items with the expected responsive grid classes", () => {
    const { container } = render(
      <BlurLogoCloud
        columns={4}
        items={[
          { name: "Forbes", logo: <span>Forbes logo</span> },
          { name: "Fast Company", logo: <span>Fast Company logo</span> },
          { name: "Adweek", logo: <span>Adweek logo</span> },
          {
            name: "The Breakfast Club",
            logo: <span>Breakfast Club logo</span>,
          },
        ]}
      />,
    );

    const root = container.querySelector('[data-slot="blur-logo-cloud"]');
    const items = container.querySelectorAll(
      '[data-slot="blur-logo-cloud-item"]',
    );

    expect(root).toHaveClass("grid-cols-2");
    expect(root).toHaveClass("md:grid-cols-4");
    expect(items).toHaveLength(4);
    expect(screen.getByText("Forbes logo")).toBeInTheDocument();
  });

  it("falls back to the item name when no logo node is provided", () => {
    render(
      <BlurLogoCloud
        items={[
          { name: "Forbes" },
          { name: "Fast Company", logo: <span>Fast Company logo</span> },
        ]}
      />,
    );

    expect(screen.getByText("Forbes")).toBeInTheDocument();
    expect(screen.getByText("Fast Company logo")).toBeInTheDocument();
  });
});
