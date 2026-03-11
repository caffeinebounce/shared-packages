import { expect, afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";

// Extend vitest matchers with jest-dom
expect.extend(matchers);

function createLocalStorageMock(): Storage {
	const store = new Map<string, string>();
	return {
		get length() {
			return store.size;
		},
		clear() {
			store.clear();
		},
		getItem(key: string) {
			return store.has(key) ? store.get(key)! : null;
		},
		key(index: number) {
			return Array.from(store.keys())[index] ?? null;
		},
		removeItem(key: string) {
			store.delete(key);
		},
		setItem(key: string, value: string) {
			store.set(String(key), String(value));
		},
	};
}

function ensureLocalStorageMock() {
	if (typeof window === "undefined") {
		return;
	}

	let needsMock = false;
	try {
		needsMock =
			!window.localStorage ||
			typeof window.localStorage.clear !== "function" ||
			typeof window.localStorage.getItem !== "function" ||
			typeof window.localStorage.setItem !== "function";
	} catch {
		needsMock = true;
	}

	if (!needsMock) {
		return;
	}

	const mockStorage = createLocalStorageMock();
	Object.defineProperty(window, "localStorage", {
		value: mockStorage,
		configurable: true,
	});
	Object.defineProperty(globalThis, "localStorage", {
		value: mockStorage,
		configurable: true,
	});
}

ensureLocalStorageMock();

if (typeof globalThis.ResizeObserver === "undefined") {
	class ResizeObserverMock {
		observe() {}
		unobserve() {}
		disconnect() {}
	}
	// @ts-expect-error test polyfill
	globalThis.ResizeObserver = ResizeObserverMock;
}

// Cleanup after each test
afterEach(() => {
	cleanup();
	// Clear all timers if any are pending
	vi.clearAllTimers();
	// Clear localStorage
	if (typeof window !== "undefined" && window.localStorage && typeof window.localStorage.clear === "function") {
		window.localStorage.clear();
	}
});
