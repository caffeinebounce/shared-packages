import { defineConfig } from "tsup";
import { createUseClientOnSuccess } from "../../scripts/tsup/use-client";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ["react", "react-dom", "@caffeinebounce/ui", "@caffeinebounce/ui/primitives"],
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
