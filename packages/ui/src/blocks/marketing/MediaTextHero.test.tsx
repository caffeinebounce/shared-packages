import { render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { MediaTextHero } from "./MediaTextHero";

const originalResizeObserver = globalThis.ResizeObserver;
let resizeRect = { width: 320, height: 500 };

class ResizeObserverMock {
  private callback: ResizeObserverCallback;

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }

  disconnect() {}

  observe(target: Element) {
    this.callback(
      [
        {
          contentRect: resizeRect,
          target,
        } as ResizeObserverEntry,
      ],
      this as unknown as ResizeObserver,
    );
  }

  unobserve() {}
}

beforeEach(() => {
  resizeRect = { width: 320, height: 500 };
  globalThis.ResizeObserver =
    ResizeObserverMock as unknown as typeof ResizeObserver;
});

afterEach(() => {
  globalThis.ResizeObserver = originalResizeObserver;
});

describe("MediaTextHero", () => {
  it("renders eyebrow, heading, description, and media", () => {
    const { container } = render(
      <MediaTextHero
        eyebrow="About"
        heading="Douglas Ebanks"
        description="Cross-functional investor, builder, and operator."
        media={{
          src: "/doug-hero.png",
          alt: "Douglas Ebanks portrait",
          width: 320,
          height: 500,
        }}
      />,
    );

    expect(screen.getByText("About")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Douglas Ebanks" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Cross-functional investor, builder, and operator."),
    ).toBeInTheDocument();
    expect(
      container.querySelector('[data-slot="media-text-hero-media"]'),
    ).toBeInTheDocument();
    expect(
      container.querySelector('[data-slot="focal-media-image"]'),
    ).toBeInTheDocument();
  });

  it("renders media after copy when mediaPosition is end", () => {
    const { container } = render(
      <MediaTextHero
        heading="Douglas Ebanks"
        media={{
          src: "/doug-hero.png",
          alt: "Douglas Ebanks portrait",
          width: 320,
          height: 500,
        }}
        mediaPosition="end"
      />,
    );

    const heroContainer = container.querySelector(
      '[data-slot="media-text-hero-container"]',
    ) as HTMLElement;

    expect(heroContainer.children[0]).toHaveAttribute(
      "data-slot",
      "media-text-hero-content",
    );
    expect(heroContainer.children[1]).toHaveAttribute(
      "data-slot",
      "media-text-hero-media-pane",
    );
  });

  it("applies a mobile top inset via CSS variable", () => {
    const { container } = render(
      <MediaTextHero
        heading="Douglas Ebanks"
        media={{
          src: "/doug-hero.png",
          alt: "Douglas Ebanks portrait",
          width: 320,
          height: 500,
        }}
        mobileTopInset="calc(env(safe-area-inset-top) + 5rem)"
      />,
    );

    const hero = container.querySelector('[data-slot="media-text-hero"]');

    expect(hero?.getAttribute("style")).toContain(
      "--media-text-hero-mobile-top-inset: calc(env(safe-area-inset-top) + 5rem);",
    );
  });

  it("gives the media pane an explicit width for desktop auto-track sizing", () => {
    const { container } = render(
      <MediaTextHero
        heading="Douglas Ebanks"
        media={{
          src: "/doug-hero.png",
          alt: "Douglas Ebanks portrait",
          width: 320,
          height: 500,
        }}
      />,
    );

    const mediaPane = container.querySelector(
      '[data-slot="media-text-hero-media-pane"]',
    );

    expect(mediaPane?.getAttribute("style")).toContain("width: 320px;");
    expect(mediaPane?.getAttribute("style")).toContain("max-width: 100%;");
  });

  it("supports pixelated media while keeping the fallback image available", async () => {
    const { container } = render(
      <MediaTextHero
        heading="Douglas Ebanks"
        media={{
          src: "/doug-hero.png",
          alt: "Douglas Ebanks portrait",
          width: 320,
          height: 500,
          pixelatedCanvas: true,
          pixelatedCanvasProps: {
            distortionMode: "swirl",
          },
        }}
      />,
    );

    const media = container.querySelector(
      '[data-slot="media-text-hero-media"]',
    ) as HTMLElement;

    await waitFor(() => {
      expect(
        within(media).getByLabelText("Douglas Ebanks portrait"),
      ).toBeInTheDocument();
    });

    expect(
      container.querySelector('[data-slot="focal-media-fallback-image"]'),
    ).toBeInTheDocument();
    expect(
      container.querySelector('[data-slot="focal-media-canvas"]'),
    ).toBeInTheDocument();
  });
});
