import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useLocalStorage } from "./useLocalStorage";

function requireWindowStorage(): Storage {
  if (
    typeof window === "undefined" ||
    !window.localStorage ||
    typeof window.localStorage.clear !== "function"
  ) {
    throw new Error(
      "window.localStorage is not available in this test environment",
    );
  }

  return window.localStorage;
}

describe("useLocalStorage", () => {
  let storage: Storage;

  beforeEach(() => {
    storage = requireWindowStorage();
    storage.clear();
  });

  afterEach(() => {
    storage.clear();
  });

  it("returns initial value when localStorage is empty", () => {
    const { result } = renderHook(() => useLocalStorage("test-key", "initial"));

    expect(result.current[0]).toBe("initial");
    expect(result.current[3]).toBe(true);
  });

  it("reads value from localStorage on mount", () => {
    storage.setItem("test-key", JSON.stringify("stored-value"));

    const { result } = renderHook(() => useLocalStorage("test-key", "initial"));

    // Hook hydrates immediately
    expect(result.current[0]).toBe("stored-value");
    expect(result.current[3]).toBe(true);
  });

  it("updates localStorage when setValue is called", () => {
    const { result } = renderHook(() => useLocalStorage("test-key", "initial"));

    act(() => {});

    act(() => {
      result.current[1]("new-value");
    });

    expect(storage.getItem("test-key")).toBe(JSON.stringify("new-value"));
    expect(result.current[0]).toBe("new-value");
  });

  it("handles function updater for setValue", () => {
    const { result } = renderHook(() => useLocalStorage("test-key", 0));

    act(() => {});

    expect(result.current[0]).toBe(0);

    act(() => {
      result.current[1]((prev) => prev + 1);
    });

    expect(result.current[0]).toBe(1);
  });

  it("handles JSON serialization of complex objects", () => {
    const initialValue = { name: "test", count: 0 };
    const { result } = renderHook(() =>
      useLocalStorage("test-key", initialValue),
    );

    act(() => {});

    const newValue = { name: "updated", count: 5 };

    act(() => {
      result.current[1](newValue);
    });

    expect(result.current[0]).toEqual(newValue);
    expect(storage.getItem("test-key")).toBe(JSON.stringify(newValue));
  });

  it("gracefully handles parse errors", () => {
    // Store invalid JSON
    storage.setItem("test-key", "invalid-json{");

    const consoleWarnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => {});

    const { result } = renderHook(() =>
      useLocalStorage("test-key", "fallback"),
    );

    act(() => {});

    expect(result.current[0]).toBe("fallback");
    expect(consoleWarnSpy).toHaveBeenCalled();

    consoleWarnSpy.mockRestore();
  });

  it("removes value from localStorage when removeValue is called", () => {
    storage.setItem("test-key", JSON.stringify("stored"));

    const { result } = renderHook(() => useLocalStorage("test-key", "initial"));

    act(() => {});

    expect(result.current[0]).toBe("stored");

    act(() => {
      result.current[2](); // removeValue
    });

    expect(storage.getItem("test-key")).toBeNull();
    expect(result.current[0]).toBe("initial");
  });

  it("syncs across storage events (cross-tab sync)", () => {
    const { result } = renderHook(() => useLocalStorage("test-key", "initial"));

    act(() => {});

    expect(result.current[0]).toBe("initial");

    // Simulate storage event from another tab
    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "test-key",
          newValue: JSON.stringify("from-other-tab"),
        }),
      );
    });

    expect(result.current[0]).toBe("from-other-tab");
  });

  it("handles storage event with null value (removal)", () => {
    storage.setItem("test-key", JSON.stringify("stored"));

    const { result } = renderHook(() => useLocalStorage("test-key", "initial"));

    act(() => {});

    expect(result.current[0]).toBe("stored");

    // Simulate removal from another tab
    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "test-key",
          newValue: null,
        }),
      );
    });

    expect(result.current[0]).toBe("initial");
  });

  it("ignores storage events for different keys", () => {
    const { result } = renderHook(() => useLocalStorage("test-key", "initial"));

    act(() => {});

    expect(result.current[0]).toBe("initial");

    // Simulate storage event for different key
    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "other-key",
          newValue: JSON.stringify("other-value"),
        }),
      );
    });

    // Value should not change
    expect(result.current[0]).toBe("initial");
  });

  it("handles number values", () => {
    const { result } = renderHook(() => useLocalStorage("number-key", 42));
    act(() => {});
    expect(result.current[0]).toBe(42);
  });

  it("handles boolean values", () => {
    const { result } = renderHook(() => useLocalStorage("bool-key", true));
    act(() => {});
    expect(result.current[0]).toBe(true);
  });

  it("handles array values", () => {
    const initialValue = [1, 2, 3];
    const { result } = renderHook(() =>
      useLocalStorage("array-key", initialValue),
    );

    // Hook hydrates immediately with stable initial reference
    expect(result.current[0]).toEqual(initialValue);
  });

  it("cleans up storage event listener on unmount", () => {
    const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

    const { result, unmount } = renderHook(() =>
      useLocalStorage("test-key", "initial"),
    );

    act(() => {});

    expect(result.current[0]).toBe("initial");

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "storage",
      expect.any(Function),
    );

    removeEventListenerSpy.mockRestore();
  });
});
