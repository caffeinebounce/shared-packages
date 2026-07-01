import { defineConfig } from "tsup";
import { createUseClientOnSuccess } from "../../scripts/tsup/use-client";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    server: "src/server.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  splitting: true,
  sourcemap: false,
  clean: true,
  external: ["react", "react-dom", "stripe"],
  treeshake: true,
  minify: false,
  outExtension({ format }) {
    return {
      js: format === "esm" ? ".mjs" : ".js",
    };
  },
  onSuccess: createUseClientOnSuccess({
    files: ["dist/index.mjs", "dist/index.js"],
  }),
});
