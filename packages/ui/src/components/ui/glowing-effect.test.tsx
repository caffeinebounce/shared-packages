import { render, screen } from "@testing-library/react";
import { animate, useReducedMotion } from "motion/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GlowingEffect } from "./glowing-effect";

const animationStops: ReturnType<typeof vi.fn>[] = [];

vi.mock("motion/react", () => ({
  animate: vi.fn(
    (
      _from: number,
      to: number,
      options?: { onUpdate?: (value: number) => void },
    ) => {
      const stop = vi.fn();
      animationStops.push(stop);
      options?.onUpdate?.(to);
      return { stop };
    },
  ),
  useReducedMotion: vi.fn(() => false),
}));

const mockRect = (element: HTMLElement, rect: Partial<DOMRect>) => {
  vi.spyOn(element, "getBoundingClientRect").mockReturnValue({
    bottom: rect.bottom ?? 0,
    height: rect.height ?? 0,
    left: rect.left ?? 0,
    right: rect.right ?? 0,
    top: rect.top ?? 0,
    width: rect.width ?? 0,
    x: rect.x ?? rect.left ?? 0,
    y: rect.y ?? rect.top ?? 0,
    toJSON: () => ({}),
  });
};

describe("GlowingEffect", () => {
  beforeEach(() => {
    vi.mocked(animate).mockClear();
    vi.mocked(useReducedMotion).mockReturnValue(false);
    animationStops.length = 0;
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      callback(0);
      return 1;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.mocked(useReducedMotion).mockReturnValue(false);
    animationStops.length = 0;
  });

  it("uses the shared box radius by default", () => {
    render(<GlowingEffect data-testid="glow" />);

    const glow = screen.getByTestId("glow");
    expect(glow).toHaveAttribute("data-slot", "glowing-effect");
    expect(glow).toHaveClass("rounded-box");
    expect(glow).not.toHaveClass("rounded-none");
  });

  it("can render with sharp corners", () => {
    render(<GlowingEffect corners="sharp" data-testid="glow" />);

    const glow = screen.getByTestId("glow");
    expect(glow).toHaveClass("rounded-none");
    expect(glow).not.toHaveClass("rounded-box");
  });

  it("exposes motion tuning through CSS variables", () => {
    render(
      <GlowingEffect
        borderWidth={2}
        blur={4}
        data-testid="glow"
        movementDuration={3}
        proximity={96}
        spread={32}
      />,
    );

    const glow = screen.getByTestId("glow");
    expect(glow).toHaveStyle({
      "--glowing-effect-border-width": "2px",
      "--glowing-effect-blur": "4px",
      "--glowing-effect-duration": "3s",
      "--glowing-effect-proximity": "96px",
      "--glowing-effect-spread": "32",
    });
    expect(glow).not.toHaveClass("blur-[var(--glowing-effect-blur)]");
  });

  it("tracks pointer proximity instead of revealing the full border on group hover", () => {
    render(
      <GlowingEffect
        data-testid="glow"
        glow
        inactiveZone={0.7}
        proximity={64}
      />,
    );

    const glow = screen.getByTestId("glow");
    mockRect(glow, {
      bottom: 150,
      height: 100,
      left: 100,
      right: 300,
      top: 50,
      width: 200,
    });

    expect(glow.className).not.toContain("group-hover");
    expect(glow).toHaveStyle({ "--glowing-effect-active": "0" });

    document.body.dispatchEvent(
      new MouseEvent("pointermove", {
        bubbles: true,
        clientX: 300,
        clientY: 100,
      }),
    );

    expect(glow).toHaveStyle({
      "--glowing-effect-active": "1",
      "--glowing-effect-start": "90",
      "--glowing-effect-x": "200px",
      "--glowing-effect-y": "50px",
    });

    document.body.dispatchEvent(
      new MouseEvent("pointermove", {
        bubbles: true,
        clientX: 200,
        clientY: 100,
      }),
    );

    expect(glow).toHaveStyle({ "--glowing-effect-active": "0" });
  });

  it("stops the previous angle animation before starting a new pointer update", () => {
    render(<GlowingEffect data-testid="glow" proximity={64} />);

    const glow = screen.getByTestId("glow");
    mockRect(glow, {
      bottom: 150,
      height: 100,
      left: 100,
      right: 300,
      top: 50,
      width: 200,
    });

    document.body.dispatchEvent(
      new MouseEvent("pointermove", {
        bubbles: true,
        clientX: 300,
        clientY: 100,
      }),
    );
    document.body.dispatchEvent(
      new MouseEvent("pointermove", {
        bubbles: true,
        clientX: 260,
        clientY: 60,
      }),
    );

    expect(animate).toHaveBeenCalledTimes(2);
    expect(animationStops[0]).toHaveBeenCalledTimes(1);
  });

  it("does not install pointer-driven animation when reduced motion is preferred", () => {
    vi.mocked(useReducedMotion).mockReturnValue(true);

    render(<GlowingEffect data-testid="glow" proximity={64} />);

    const glow = screen.getByTestId("glow");
    mockRect(glow, {
      bottom: 150,
      height: 100,
      left: 100,
      right: 300,
      top: 50,
      width: 200,
    });

    document.body.dispatchEvent(
      new MouseEvent("pointermove", {
        bubbles: true,
        clientX: 300,
        clientY: 100,
      }),
    );

    expect(animate).not.toHaveBeenCalled();
    expect(glow).toHaveStyle({ "--glowing-effect-active": "0" });
  });

  it("marks disabled effects", () => {
    render(<GlowingEffect data-testid="glow" disabled />);

    expect(screen.getByTestId("glow")).toHaveAttribute("data-disabled", "true");
  });
});
