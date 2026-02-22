import { expect, afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";

// Extend vitest matchers with jest-dom
expect.extend(matchers);

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
