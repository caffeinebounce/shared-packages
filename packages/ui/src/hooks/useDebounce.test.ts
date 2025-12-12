import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useDebounce } from "./useDebounce";

describe("useDebounce", () => {
  it("returns initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("initial", 500));
    expect(result.current).toBe("initial");
  });

  it("updates value after delay", async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: "initial", delay: 100 } },
    );

    expect(result.current).toBe("initial");

    // Update the value
    rerender({ value: "updated", delay: 100 });

    // Value should still be initial immediately after change
    expect(result.current).toBe("initial");

    // Wait for debounce delay
    await waitFor(
      () => {
        expect(result.current).toBe("updated");
      },
      { timeout: 200 },
    );
  });

  it("resets timer on new value before delay completes", async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 100),
      { initialProps: { value: "initial" } },
    );

    expect(result.current).toBe("initial");

    // First update
    rerender({ value: "first" });
    expect(result.current).toBe("initial");

    // Wait 50ms (half the delay)
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Second update before first delay completes
    rerender({ value: "second" });

    // Should still be initial
    expect(result.current).toBe("initial");

    // Wait for debounce to complete
    await waitFor(
      () => {
        expect(result.current).toBe("second");
      },
      { timeout: 200 },
    );

    // Should skip "first" and go directly to "second"
    expect(result.current).toBe("second");
  });

  it("handles different delay values", async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: "initial", delay: 50 } },
    );

    rerender({ value: "updated", delay: 50 });

    await waitFor(
      () => {
        expect(result.current).toBe("updated");
      },
      { timeout: 150 },
    );
  });

  it("cleans up timer on unmount", () => {
    const clearTimeoutSpy = vi.spyOn(global, "clearTimeout");

    const { unmount } = renderHook(() => useDebounce("test", 500));

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });

  it("works with non-string values", async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 100),
      { initialProps: { value: { name: "initial" } } },
    );

    expect(result.current).toEqual({ name: "initial" });

    rerender({ value: { name: "updated" } });

    await waitFor(
      () => {
        expect(result.current).toEqual({ name: "updated" });
      },
      { timeout: 200 },
    );
  });

  it("uses default delay of 500ms when not specified", async () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value), {
      initialProps: { value: "initial" },
    });

    rerender({ value: "updated" });

    // Should not update immediately
    expect(result.current).toBe("initial");

    // Should update after default 500ms delay
    await waitFor(
      () => {
        expect(result.current).toBe("updated");
      },
      { timeout: 600 },
    );
  });
});
