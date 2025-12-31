import { expect, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";

// Extend vitest matchers with jest-dom
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
	cleanup();
	// Clear all timers
	vi.clearAllTimers();
	// Clear localStorage
	if (typeof window !== "undefined") {
		window.localStorage.clear();
	}
});
