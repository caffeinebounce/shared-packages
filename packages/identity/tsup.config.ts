import { defineConfig } from "tsup";
import { createUseClientOnSuccess } from "../../scripts/tsup/use-client";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    server: "src/server.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: [
    "react",
    "react-dom",
    "next",
    "next/link",
    "next/image",
    "next/navigation",
    "next/server",
    "@supabase/ssr",
    "@supabase/supabase-js",
    "@caffeinebounce/ui",
    "@caffeinebounce/ui/primitives",
  ],
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
