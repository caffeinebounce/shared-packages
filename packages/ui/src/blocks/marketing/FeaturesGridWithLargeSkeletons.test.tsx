import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  FeatureShieldSkeleton,
  FeatureStackSkeleton,
  FeaturesGridWithLargeSkeletons,
  FeatureWorkflowSkeleton,
} from "./FeaturesGridWithLargeSkeletons";

const originalResizeObserver = globalThis.ResizeObserver;
const originalIntersectionObserver = globalThis.IntersectionObserver;

class ResizeObserverMock {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
}

class IntersectionObserverMock {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
  takeRecords = vi.fn(() => []);
}

function mockCanvasContext() {
  return {
    arc: vi.fn(),
    beginPath: vi.fn(),
    clearRect: vi.fn(),
    createRadialGradient: vi.fn(() => ({
      addColorStop: vi.fn(),
    })),
    fill: vi.fn(),
    fillRect: vi.fn(),
    restore: vi.fn(),
    save: vi.fn(),
    setTransform: vi.fn(),
    fillStyle: "",
    globalAlpha: 1,
    shadowBlur: 0,
    shadowColor: "",
  } as unknown as CanvasRenderingContext2D;
}

beforeEach(() => {
  globalThis.ResizeObserver =
    ResizeObserverMock as unknown as typeof ResizeObserver;
  globalThis.IntersectionObserver =
    IntersectionObserverMock as unknown as typeof IntersectionObserver;
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(((
    contextId: string,
  ) => {
    if (contextId === "2d") {
      return mockCanvasContext();
    }

    return null;
  }) as typeof HTMLCanvasElement.prototype.getContext);
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
    return window.setTimeout(() => callback(performance.now()), 0);
  });
  vi.spyOn(window, "cancelAnimationFrame").mockImplementation((id) => {
    window.clearTimeout(id);
  });
});

afterEach(() => {
  globalThis.ResizeObserver = originalResizeObserver;
  globalThis.IntersectionObserver = originalIntersectionObserver;
  vi.restoreAllMocks();
});

describe("FeaturesGridWithLargeSkeletons", () => {
  it("renders the heading, description, cards, skeleton frames, and actions", () => {
    const handleAction = vi.fn();
    const { container } = render(
      <FeaturesGridWithLargeSkeletons
        description="A reusable grid for high-signal feature storytelling."
        heading={
          <>
            Built for fast moving <br /> teams.
          </>
        }
        items={[
          {
            id: "stack",
            title: "Coordinate complex work",
            actionLabel: "Open coordination feature",
            onActionClick: handleAction,
          },
          {
            id: "workflow",
            title: "Automate handoffs",
          },
          {
            id: "shield",
            title: "Keep approvals auditable",
          },
        ]}
      />,
    );

    expect(
      screen.getByRole("heading", { name: /built for fast moving teams/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("A reusable grid for high-signal feature storytelling."),
    ).toBeInTheDocument();
    expect(screen.getByText("Coordinate complex work")).toBeInTheDocument();
    expect(screen.getByText("Automate handoffs")).toBeInTheDocument();
    expect(screen.getByText("Keep approvals auditable")).toBeInTheDocument();
    expect(
      container.querySelectorAll(
        '[data-slot="features-grid-large-skeleton-card"]',
      ),
    ).toHaveLength(3);
    expect(
      container.querySelectorAll(
        '[data-slot="features-grid-large-skeleton-frame"]',
      ),
    ).toHaveLength(3);
    expect(
      container.querySelector('[data-slot="feature-stack-skeleton"]'),
    ).toBeInTheDocument();
    expect(
      container.querySelector('[data-slot="feature-workflow-skeleton"]'),
    ).toBeInTheDocument();
    expect(
      container.querySelector('[data-slot="feature-shield-skeleton"]'),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Open coordination feature" }),
    );

    expect(handleAction).toHaveBeenCalledTimes(1);
  });

  it("supports custom skeleton content and styling hooks", () => {
    const { container } = render(
      <FeaturesGridWithLargeSkeletons
        gridClassName="custom-grid"
        heading="Custom skeletons"
        items={[
          {
            id: "custom",
            title: "Bring your own visual",
            skeleton: <div data-testid="custom-skeleton">Custom visual</div>,
            cardClassName: "custom-card",
            titleClassName: "custom-title",
          },
        ]}
      />,
    );

    expect(screen.getByTestId("custom-skeleton")).toBeInTheDocument();
    expect(container.querySelector(".custom-grid")).toBeInTheDocument();
    expect(container.querySelector(".custom-card")).toBeInTheDocument();
    expect(container.querySelector(".custom-title")).toBeInTheDocument();
  });

  it("exports reusable skeleton primitives", () => {
    const { container } = render(
      <div>
        <FeatureStackSkeleton />
        <FeatureWorkflowSkeleton title="Review flow" />
        <FeatureShieldSkeleton />
      </div>,
    );

    expect(
      container.querySelectorAll('[data-slot="feature-skeleton-card"]'),
    ).toHaveLength(3);
    expect(screen.getByText("Review flow")).toBeInTheDocument();
    expect(
      container.querySelector('[data-slot="dotted-glow-background"] canvas'),
    ).toBeInTheDocument();
  });
});
