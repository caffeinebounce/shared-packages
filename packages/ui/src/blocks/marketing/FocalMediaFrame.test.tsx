import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { FocalMediaFrame } from "./FocalMediaFrame";

const originalResizeObserver = globalThis.ResizeObserver;

class ResizeObserverMock {
  disconnect() {}

  observe() {}

  unobserve() {}
}

beforeEach(() => {
  globalThis.ResizeObserver =
    ResizeObserverMock as unknown as typeof ResizeObserver;
});

afterEach(() => {
  globalThis.ResizeObserver = originalResizeObserver;
});

describe("FocalMediaFrame", () => {
  it("renders a static fallback image while the pixelated canvas is preparing", () => {
    const { container } = render(
      <FocalMediaFrame
        alt="Keenan portrait"
        height={625}
        pixelatedCanvas
        src="/images/hero-1.webp"
        width={1500}
      />,
    );

    expect(
      container.querySelector('[data-slot="focal-media-fallback-image"]'),
    ).not.toBeNull();
  });

  it("renders the plain image fallback when pixelated canvas is disabled", () => {
    const { container } = render(
      <FocalMediaFrame
        alt="Keenan portrait"
        height={625}
        src="/images/hero-1.webp"
        width={1500}
      />,
    );

    expect(
      container.querySelector('[data-slot="focal-media-image"]'),
    ).not.toBeNull();
    expect(
      container.querySelector('[data-slot="focal-media-fallback-image"]'),
    ).toBeNull();
  });
});
