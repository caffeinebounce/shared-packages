"use client";

import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useScrollDirection } from "./useScrollDirection";

describe("useScrollDirection", () => {
  let scrollY = 0;
  const listeners: Map<string, EventListener> = new Map();
  let rafCallback: FrameRequestCallback | null = null;

  beforeEach(() => {
    scrollY = 0;
    listeners.clear();
    rafCallback = null;

    // Mock window.scrollY
    Object.defineProperty(window, "scrollY", {
      get: () => scrollY,
      configurable: true,
    });

    // Mock requestAnimationFrame - store callback for deferred execution
    // This is necessary because the hook sets ticking=true AFTER calling rAF
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      rafCallback = cb;
      return 0;
    });

    // Mock addEventListener/removeEventListener
    vi.spyOn(window, "addEventListener").mockImplementation(
      (event, handler) => {
        listeners.set(event, handler as EventListener);
      },
    );
    vi.spyOn(window, "removeEventListener").mockImplementation((event) => {
      listeners.delete(event);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const simulateScroll = (newScrollY: number) => {
    scrollY = newScrollY;
    const handler = listeners.get("scroll");
    if (handler) {
      act(() => {
        handler(new Event("scroll"));
        // Execute RAF callback after ticking is set to true in the hook
        if (rafCallback) {
          rafCallback(0);
          rafCallback = null;
        }
      });
    }
  };

  it("should return initial state with direction null and isAtTop true", () => {
    const { result } = renderHook(() => useScrollDirection());

    expect(result.current.direction).toBe(null);
    expect(result.current.isAtTop).toBe(true);
  });

  it("should detect scroll down direction", () => {
    const { result } = renderHook(() =>
      useScrollDirection({ threshold: 10, topThreshold: 50 }),
    );

    // Scroll down past threshold
    simulateScroll(100);

    expect(result.current.direction).toBe("down");
    expect(result.current.isAtTop).toBe(false);
  });

  it("should detect scroll up direction", () => {
    const { result } = renderHook(() =>
      useScrollDirection({ threshold: 10, topThreshold: 50 }),
    );

    // First scroll down
    simulateScroll(200);
    expect(result.current.direction).toBe("down");

    // Then scroll up
    simulateScroll(150);
    expect(result.current.direction).toBe("up");
  });

  it("should respect threshold to prevent jitter", () => {
    const { result } = renderHook(() =>
      useScrollDirection({ threshold: 20, topThreshold: 50 }),
    );

    // Scroll down below threshold - direction should not change
    simulateScroll(15);
    expect(result.current.direction).toBe(null);

    // Scroll down past threshold
    simulateScroll(50);
    expect(result.current.direction).toBe("down");

    // Small scroll up below threshold - should stay "down"
    simulateScroll(45);
    expect(result.current.direction).toBe("down");

    // Scroll up past threshold
    simulateScroll(20);
    expect(result.current.direction).toBe("up");
  });

  it("should set isAtTop based on topThreshold", () => {
    const { result } = renderHook(() =>
      useScrollDirection({ threshold: 10, topThreshold: 100 }),
    );

    expect(result.current.isAtTop).toBe(true);

    // Scroll but stay within topThreshold
    simulateScroll(50);
    expect(result.current.isAtTop).toBe(true);

    // Scroll past topThreshold
    simulateScroll(150);
    expect(result.current.isAtTop).toBe(false);

    // Scroll back within topThreshold
    simulateScroll(50);
    expect(result.current.isAtTop).toBe(true);
  });

  it("should use default threshold values", () => {
    const { result } = renderHook(() => useScrollDirection());

    // Default threshold is 10, topThreshold is 50
    simulateScroll(60);
    expect(result.current.direction).toBe("down");
    expect(result.current.isAtTop).toBe(false);
  });

  it("should clean up event listener on unmount", () => {
    const { unmount } = renderHook(() => useScrollDirection());

    expect(listeners.has("scroll")).toBe(true);

    unmount();

    expect(window.removeEventListener).toHaveBeenCalledWith(
      "scroll",
      expect.any(Function),
    );
  });

  it("should use requestAnimationFrame for performance", () => {
    renderHook(() => useScrollDirection());

    simulateScroll(100);

    expect(window.requestAnimationFrame).toHaveBeenCalled();
  });
});
