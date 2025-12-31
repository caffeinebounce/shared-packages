import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		globals: true,
		environment: "jsdom",
		setupFiles: ["../../vitest.setup.ts"],
		pool: "forks",
		poolOptions: {
			forks: {
				singleFork: true,
			},
		},
		testTimeout: 10000,
		hookTimeout: 10000,
		teardownTimeout: 10000,
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
			exclude: [
				"**/node_modules/**",
				"**/dist/**",
				"**/*.config.*",
				"**/*.test.*",
				"**/vitest.setup.ts",
			],
		},
	},
});
