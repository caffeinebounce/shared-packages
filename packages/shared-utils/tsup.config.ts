import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/analytics.ts",
    "src/formatters.ts",
    "src/string.ts",
    "src/image.ts",
  ],
  format: ["esm", "cjs"],
  dts: true,
  splitting: false,
  sourcemap: false,
  clean: true,
  treeshake: true,
  minify: false,
  outExtension({ format }) {
    return {
      js: format === "esm" ? ".mjs" : ".js",
    };
  },
});
