import { copyFileSync } from "node:fs";
import { defineConfig } from "tsup";
import {
  createUseClientOnSuccess,
  listBuiltJavaScriptFiles,
} from "../../scripts/tsup/use-client";

export default defineConfig({
  entry: {
    // Main entry point (all exports for backwards compatibility)
    index: "src/index.tsx",
    // Subpath exports for tree-shaking heavy modules
    "data-table": "src/entries/data-table.ts",
    editor: "src/entries/editor.ts",
    layouts: "src/entries/layouts.ts",
    charts: "src/entries/charts.ts",
    hooks: "src/entries/hooks.ts",
    navigation: "src/entries/navigation.ts",
    marketing: "src/entries/marketing.ts",
    "marketing-3d": "src/entries/marketing-3d.ts",
    forms: "src/entries/forms.ts",
    settings: "src/entries/settings.ts",
    blog: "src/entries/blog.ts",
    portal: "src/entries/portal.ts",
    media: "src/entries/media.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  splitting: true,
  sourcemap: true,
  clean: true,
  external: [
    "react",
    "react-dom",
    "next",
    "next/link",
    "next/image",
    "next/navigation",
    "next-themes",
    "sonner",
    "three",
    "@react-three/fiber",
  ],
  treeshake: true,
  minify: false,
  injectStyle: false,
  outExtension({ format }) {
    return {
      js: format === "esm" ? ".mjs" : ".js",
    };
  },
  onSuccess: createUseClientOnSuccess({
    files: () => listBuiltJavaScriptFiles("dist"),
    afterSuccess: () => {
      copyFileSync("src/styles/base.css", "dist/styles.css");
      console.log("Copied styles.css to dist/");
    },
  }),
});
