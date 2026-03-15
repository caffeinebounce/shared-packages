import { render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { EditorialHero } from "./EditorialHero";
import { FocalMediaFrame } from "./FocalMediaFrame";

const originalResizeObserver = globalThis.ResizeObserver;
let resizeRect = { width: 900, height: 400 };

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
  resizeRect = { width: 900, height: 400 };
  globalThis.ResizeObserver =
    ResizeObserverMock as unknown as typeof ResizeObserver;
});

afterEach(() => {
  globalThis.ResizeObserver = originalResizeObserver;
});

describe("EditorialHero", () => {
  it("renders content and the expected responsive structure", () => {
    const { container } = render(
      <EditorialHero
        eyebrow="Keenan Beasley"
        heading="Building the infrastructure for culture-led ownership."
        description="Factory is the platform behind media, capital, and ownership."
        actions={[
          { label: "Explore Factory", href: "/factory" },
          { label: "View Portfolio", href: "/portfolio", variant: "outline" },
        ]}
        signals={[
          {
            title: "Platform Design",
            description:
              "Capital, media, and partnerships aligned around ownership.",
          },
          {
            title: "Operator Lens",
            description: "Built from brand leadership and founder execution.",
          },
          {
            title: "Long Horizon",
            description:
              "Focused on durable assets, not short-term visibility.",
          },
        ]}
        media={{
          src: "/images/hero-1.webp",
          alt: "Keenan Beasley portrait",
          width: 1500,
          height: 625,
          badge: "Founder of Factory",
          callout: {
            eyebrow: "Platform Thesis",
            content:
              "The next generation of wealth will be built by people who can convert cultural relevance into owned infrastructure.",
          },
        }}
      />,
    );

    expect(
      screen.getByRole("heading", {
        name: "Building the infrastructure for culture-led ownership.",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Factory is the platform behind media, capital, and ownership.",
      ),
    ).toBeInTheDocument();

    const actions = container.querySelector(
      '[data-slot="editorial-hero-actions"]',
    );
    const signals = container.querySelector(
      '[data-slot="editorial-hero-signals"]',
    );
    const mobileMedia = container.querySelector(
      '[data-slot="editorial-hero-media-mobile"]',
    );
    const desktopMedia = container.querySelector(
      '[data-slot="editorial-hero-media-desktop"]',
    );
    const content = container.querySelector(
      '[data-slot="editorial-hero-content"]',
    );
    const heroContainer = content?.parentElement;

    expect(heroContainer).toHaveClass(
      "lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]",
    );
    expect(heroContainer).toHaveClass("lg:items-stretch");
    expect(mobileMedia).toHaveClass("lg:hidden");
    expect(desktopMedia).toHaveClass("hidden");
    expect(desktopMedia).toHaveClass("lg:block");
    expect(desktopMedia).toHaveClass("lg:h-full");
    expect(desktopMedia).toHaveClass("lg:self-stretch");
    expect(actions).toHaveClass("grid");
    expect(actions).toHaveClass("sm:grid-cols-2");
    expect(actions).toHaveClass("sm:mx-auto");
    expect(actions).toHaveClass("lg:mx-0");
    expect(signals).toHaveClass("sm:grid-cols-2");
    expect(signals).toHaveClass("md:grid-cols-3");
    const primaryAction = screen.getByRole("link", { name: "Explore Factory" });
    const secondaryAction = screen.getByRole("link", {
      name: "View Portfolio",
    });

    expect(primaryAction).toHaveAttribute("href", "/factory");
    expect(primaryAction).toHaveClass("min-h-12");
    expect(primaryAction).toHaveClass("sm:col-span-2");
    expect(secondaryAction).toHaveAttribute("href", "/portfolio");
    expect(secondaryAction).not.toHaveClass("sm:col-span-2");
    const mediaFrame = container.querySelector(
      '[data-slot="focal-media-frame"]',
    );
    expect(mediaFrame).toHaveClass("lg:h-full");
    expect(mediaFrame).toHaveClass("lg:min-h-[32rem]");
    expect(screen.getAllByText("Platform Thesis")).toHaveLength(2);
    expect(
      screen.getAllByText(
        "The next generation of wealth will be built by people who can convert cultural relevance into owned infrastructure.",
      ),
    ).toHaveLength(2);
  });

  it("keeps mobile and desktop callouts in sync from the same callout data", () => {
    const { container } = render(
      <EditorialHero
        heading="A sharper hero"
        media={{
          src: "/images/hero-1.webp",
          alt: "Portrait",
          width: 1500,
          height: 625,
          callout: {
            eyebrow: "Platform Thesis",
            content:
              "One callout rendered in two breakpoint-specific containers.",
          },
        }}
      />,
    );

    const mobileCallout = container.querySelector(
      '[data-slot="editorial-hero-callout-mobile"]',
    );
    const desktopCallout = container.querySelector(
      '[data-slot="editorial-hero-callout-desktop"]',
    );

    expect(mobileCallout).toBeInTheDocument();
    expect(desktopCallout).toBeInTheDocument();
    expect(
      within(mobileCallout as HTMLElement).getByText("Platform Thesis"),
    ).toBeInTheDocument();
    expect(
      within(desktopCallout as HTMLElement).getByText("Platform Thesis"),
    ).toBeInTheDocument();
    expect(
      within(mobileCallout as HTMLElement).getByText(
        "One callout rendered in two breakpoint-specific containers.",
      ),
    ).toBeInTheDocument();
    expect(
      within(desktopCallout as HTMLElement).getByText(
        "One callout rendered in two breakpoint-specific containers.",
      ),
    ).toBeInTheDocument();
  });

  it("positions focal media from the supplied focal point", async () => {
    const { container } = render(
      <FocalMediaFrame
        alt="Portrait"
        className="h-[24rem] w-full"
        focalPoint={{ x: 0.6, y: 0.42 }}
        height={625}
        src="/images/hero-1.webp"
        width={1500}
      />,
    );

    const image = container.querySelector('[data-slot="focal-media-image"]');

    await waitFor(() => {
      expect(image).toHaveStyle("width: 960px");
    });

    expect(image).toHaveStyle("height: 400px");
    expect(image).toHaveStyle("top: 0px");
    expect(image?.getAttribute("style")).toContain("left: -");
    expect(image).not.toHaveStyle("left: 0px");
  });
});
