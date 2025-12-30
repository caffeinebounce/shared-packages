import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		globals: true,
		environment: "jsdom",
		setupFiles: ["../../vitest.setup.ts"],
		pool: "threads",
		poolOptions: {
			threads: {
				singleThread: true,
			},
		},
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
