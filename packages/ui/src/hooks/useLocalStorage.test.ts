import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useLocalStorage } from "./useLocalStorage";

describe("useLocalStorage", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("returns initial value when localStorage is empty", () => {
    const { result } = renderHook(() => useLocalStorage("test-key", "initial"));

    waitFor(() => {
      expect(result.current[0]).toBe("initial");
    });
  });

  it("reads value from localStorage on mount", () => {
    localStorage.setItem("test-key", JSON.stringify("stored-value"));

    const { result } = renderHook(() => useLocalStorage("test-key", "initial"));

    waitFor(() => {
      expect(result.current[0]).toBe("stored-value");
    });
  });

  it("updates localStorage when setValue is called", async () => {
    const { result } = renderHook(() => useLocalStorage("test-key", "initial"));

    const [, setValue] = result.current;
    setValue("new-value");

    await waitFor(() => {
      expect(localStorage.getItem("test-key")).toBe(
        JSON.stringify("new-value"),
      );
      expect(result.current[0]).toBe("new-value");
    });
  });

  it("handles function updater for setValue", async () => {
    const { result } = renderHook(() => useLocalStorage("test-key", 0));

    await waitFor(() => {
      expect(result.current[0]).toBe(0);
    });

    const [, setValue] = result.current;
    setValue((prev) => prev + 1);

    await waitFor(() => {
      expect(result.current[0]).toBe(1);
    });
  });

  it("handles JSON serialization of complex objects", async () => {
    const initialValue = { name: "test", count: 0 };
    const { result } = renderHook(() =>
      useLocalStorage("test-key", initialValue),
    );

    const [, setValue] = result.current;
    const newValue = { name: "updated", count: 5 };
    setValue(newValue);

    await waitFor(() => {
      expect(result.current[0]).toEqual(newValue);
      expect(localStorage.getItem("test-key")).toBe(JSON.stringify(newValue));
    });
  });

  it("gracefully handles parse errors", () => {
    // Store invalid JSON
    localStorage.setItem("test-key", "invalid-json{");

    const consoleWarnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => {});

    const { result } = renderHook(() =>
      useLocalStorage("test-key", "fallback"),
    );

    waitFor(() => {
      expect(result.current[0]).toBe("fallback");
      expect(consoleWarnSpy).toHaveBeenCalled();
    });

    consoleWarnSpy.mockRestore();
  });

  it("removes value from localStorage when removeValue is called", async () => {
    localStorage.setItem("test-key", JSON.stringify("stored"));

    const { result } = renderHook(() => useLocalStorage("test-key", "initial"));

    await waitFor(() => {
      expect(result.current[0]).toBe("stored");
    });

    const [, , removeValue] = result.current;
    removeValue();

    await waitFor(() => {
      expect(localStorage.getItem("test-key")).toBeNull();
      expect(result.current[0]).toBe("initial");
    });
  });

  it("syncs across storage events (cross-tab sync)", async () => {
    const { result, unmount } = renderHook(() => useLocalStorage("test-key", "initial"));

    await waitFor(() => {
      expect(result.current[0]).toBe("initial");
    });

    // Simulate storage event from another tab
    const storageEvent = new StorageEvent("storage", {
      key: "test-key",
      newValue: JSON.stringify("from-other-tab"),
    });
    window.dispatchEvent(storageEvent);

    await waitFor(() => {
      expect(result.current[0]).toBe("from-other-tab");
    });

    unmount();
  });

  it("handles storage event with null value (removal)", async () => {
    localStorage.setItem("test-key", JSON.stringify("stored"));

    const { result, unmount } = renderHook(() => useLocalStorage("test-key", "initial"));

    await waitFor(() => {
      expect(result.current[0]).toBe("stored");
    });

    // Simulate removal from another tab
    const storageEvent = new StorageEvent("storage", {
      key: "test-key",
      newValue: null,
    });
    window.dispatchEvent(storageEvent);

    await waitFor(() => {
      expect(result.current[0]).toBe("initial");
    });

    unmount();
  });

  it("ignores storage events for different keys", async () => {
    const { result } = renderHook(() => useLocalStorage("test-key", "initial"));

    await waitFor(() => {
      expect(result.current[0]).toBe("initial");
    });

    // Simulate storage event for different key
    const storageEvent = new StorageEvent("storage", {
      key: "other-key",
      newValue: JSON.stringify("other-value"),
    });
    window.dispatchEvent(storageEvent);

    // Value should not change - just verify immediately
    expect(result.current[0]).toBe("initial");
  });

  it("handles different types of values", async () => {
    // Test with number
    const { result: numberResult } = renderHook(() =>
      useLocalStorage("number-key", 42),
    );
    await waitFor(() => {
      expect(numberResult.current[0]).toBe(42);
    });

    // Test with boolean
    const { result: boolResult } = renderHook(() =>
      useLocalStorage("bool-key", true),
    );
    await waitFor(() => {
      expect(boolResult.current[0]).toBe(true);
    });

    // Test with array
    const { result: arrayResult } = renderHook(() =>
      useLocalStorage("array-key", [1, 2, 3]),
    );
    await waitFor(() => {
      expect(arrayResult.current[0]).toEqual([1, 2, 3]);
    });
  });

  it("cleans up storage event listener on unmount", () => {
    const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

    const { unmount } = renderHook(() =>
      useLocalStorage("test-key", "initial"),
    );

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "storage",
      expect.any(Function),
    );

    removeEventListenerSpy.mockRestore();
  });
});
