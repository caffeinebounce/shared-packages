import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    engine: "src/engine/index.ts",
    types: "src/types.ts",
    crypto: "src/crypto/index.ts",
    ports: "src/ports.ts",
    graph: "src/graph/index.ts",
    google: "src/google/index.ts",
    ics: "src/ics/index.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false,
  outExtension({ format }) {
    return {
      js: format === "esm" ? ".mjs" : ".js",
    };
  },
});
