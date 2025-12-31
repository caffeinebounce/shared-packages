import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
	test: {
		globals: true,
		environment: "jsdom",
		setupFiles: [resolve(__dirname, "vitest.setup.ts")],
		pool: "forks",
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
