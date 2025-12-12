import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  type KeyboardShortcutDefinition,
  matchesShortcut,
  useKeyboardShortcut,
} from "./useKeyboardShortcut";

describe("matchesShortcut", () => {
  const createKeyEvent = (
    key: string,
    modifiers?: {
      ctrl?: boolean;
      shift?: boolean;
      alt?: boolean;
      meta?: boolean;
    },
  ): KeyboardEvent => {
    return new KeyboardEvent("keydown", {
      key,
      ctrlKey: modifiers?.ctrl ?? false,
      shiftKey: modifiers?.shift ?? false,
      altKey: modifiers?.alt ?? false,
      metaKey: modifiers?.meta ?? false,
    });
  };

  it("matches simple key press", () => {
    const shortcut: KeyboardShortcutDefinition = { key: "Escape" };
    const event = createKeyEvent("Escape");

    expect(matchesShortcut(event, shortcut)).toBe(true);
  });

  it("does not match different key", () => {
    const shortcut: KeyboardShortcutDefinition = { key: "Escape" };
    const event = createKeyEvent("Enter");

    expect(matchesShortcut(event, shortcut)).toBe(false);
  });

  it("matches key with ctrl modifier", () => {
    const shortcut: KeyboardShortcutDefinition = { key: "k", ctrl: true };
    const event = createKeyEvent("k", { ctrl: true });

    expect(matchesShortcut(event, shortcut)).toBe(true);
  });

  it("does not match when ctrl modifier is missing", () => {
    const shortcut: KeyboardShortcutDefinition = { key: "k", ctrl: true };
    const event = createKeyEvent("k");

    expect(matchesShortcut(event, shortcut)).toBe(false);
  });

  it("does not match when unexpected ctrl modifier is present", () => {
    const shortcut: KeyboardShortcutDefinition = { key: "k" };
    const event = createKeyEvent("k", { ctrl: true });

    expect(matchesShortcut(event, shortcut)).toBe(false);
  });

  it("matches key with shift modifier", () => {
    const shortcut: KeyboardShortcutDefinition = { key: "L", shift: true };
    const event = createKeyEvent("L", { shift: true });

    expect(matchesShortcut(event, shortcut)).toBe(true);
  });

  it("matches key with alt modifier", () => {
    const shortcut: KeyboardShortcutDefinition = {
      key: "ArrowLeft",
      alt: true,
    };
    const event = createKeyEvent("ArrowLeft", { alt: true });

    expect(matchesShortcut(event, shortcut)).toBe(true);
  });

  it("matches key with meta modifier", () => {
    const shortcut: KeyboardShortcutDefinition = { key: "k", meta: true };
    const event = createKeyEvent("k", { meta: true });

    expect(matchesShortcut(event, shortcut)).toBe(true);
  });

  it("matches key with multiple modifiers", () => {
    const shortcut: KeyboardShortcutDefinition = {
      key: "L",
      ctrl: true,
      shift: true,
    };
    const event = createKeyEvent("L", { ctrl: true, shift: true });

    expect(matchesShortcut(event, shortcut)).toBe(true);
  });

  it("does not match when one modifier is missing", () => {
    const shortcut: KeyboardShortcutDefinition = {
      key: "L",
      ctrl: true,
      shift: true,
    };
    const event = createKeyEvent("L", { ctrl: true });

    expect(matchesShortcut(event, shortcut)).toBe(false);
  });

  it("does not match when extra modifier is present", () => {
    const shortcut: KeyboardShortcutDefinition = { key: "k", ctrl: true };
    const event = createKeyEvent("k", { ctrl: true, shift: true });

    expect(matchesShortcut(event, shortcut)).toBe(false);
  });

  it("respects enabled: false", () => {
    const shortcut: KeyboardShortcutDefinition = {
      key: "k",
      ctrl: true,
      enabled: false,
    };
    const event = createKeyEvent("k", { ctrl: true });

    expect(matchesShortcut(event, shortcut)).toBe(false);
  });

  it("matches when enabled is true", () => {
    const shortcut: KeyboardShortcutDefinition = {
      key: "k",
      ctrl: true,
      enabled: true,
    };
    const event = createKeyEvent("k", { ctrl: true });

    expect(matchesShortcut(event, shortcut)).toBe(true);
  });

  it("matches when enabled is undefined (defaults to true)", () => {
    const shortcut: KeyboardShortcutDefinition = {
      key: "k",
      ctrl: true,
    };
    const event = createKeyEvent("k", { ctrl: true });

    expect(matchesShortcut(event, shortcut)).toBe(true);
  });

  it("is case-sensitive for keys", () => {
    const shortcut: KeyboardShortcutDefinition = { key: "K" };
    const eventLower = createKeyEvent("k");
    const eventUpper = createKeyEvent("K");

    expect(matchesShortcut(eventLower, shortcut)).toBe(false);
    expect(matchesShortcut(eventUpper, shortcut)).toBe(true);
  });

  it("handles all modifiers together", () => {
    const shortcut: KeyboardShortcutDefinition = {
      key: "x",
      ctrl: true,
      shift: true,
      alt: true,
      meta: true,
    };
    const event = createKeyEvent("x", {
      ctrl: true,
      shift: true,
      alt: true,
      meta: true,
    });

    expect(matchesShortcut(event, shortcut)).toBe(true);
  });
});

describe("useKeyboardShortcut", () => {
  it("calls callback when shortcut is triggered", () => {
    const callback = vi.fn();
    const shortcut: KeyboardShortcutDefinition = { key: "k", ctrl: true };

    renderHook(() => useKeyboardShortcut(shortcut, callback));

    const event = new KeyboardEvent("keydown", {
      key: "k",
      ctrlKey: true,
      bubbles: true,
    });
    document.dispatchEvent(event);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("does not call callback when shortcut doesn't match", () => {
    const callback = vi.fn();
    const shortcut: KeyboardShortcutDefinition = { key: "k", ctrl: true };

    renderHook(() => useKeyboardShortcut(shortcut, callback));

    const event = new KeyboardEvent("keydown", {
      key: "l",
      ctrlKey: true,
      bubbles: true,
    });
    document.dispatchEvent(event);

    expect(callback).not.toHaveBeenCalled();
  });

  it("does not call callback when disabled", () => {
    const callback = vi.fn();
    const shortcut: KeyboardShortcutDefinition = { key: "k", ctrl: true };

    renderHook(() =>
      useKeyboardShortcut(shortcut, callback, { enabled: false }),
    );

    const event = new KeyboardEvent("keydown", {
      key: "k",
      ctrlKey: true,
      bubbles: true,
    });
    document.dispatchEvent(event);

    expect(callback).not.toHaveBeenCalled();
  });

  it("cleans up event listener on unmount", () => {
    const callback = vi.fn();
    const shortcut: KeyboardShortcutDefinition = { key: "k", ctrl: true };

    const { unmount } = renderHook(() =>
      useKeyboardShortcut(shortcut, callback),
    );

    unmount();

    const event = new KeyboardEvent("keydown", {
      key: "k",
      ctrlKey: true,
      bubbles: true,
    });
    document.dispatchEvent(event);

    expect(callback).not.toHaveBeenCalled();
  });
});
