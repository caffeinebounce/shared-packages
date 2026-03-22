import { copyFileSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { defineConfig } from "tsup";

const USE_CLIENT_BANNER = '"use client";\n';

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
  ],
  treeshake: true,
  minify: false,
  injectStyle: false,
  outExtension({ format }) {
    return {
      js: format === "esm" ? ".mjs" : ".js",
    };
  },
  async onSuccess() {
    // Add "use client" directive to all ESM and CJS output files
    const distFiles = readdirSync("dist").filter(
      (f) => f.endsWith(".mjs") || f.endsWith(".js"),
    );

    for (const file of distFiles) {
      const filePath = `dist/${file}`;
      try {
        const content = readFileSync(filePath, "utf-8");
        // Skip if already has "use client" directive
        if (!content.startsWith('"use client"')) {
          writeFileSync(filePath, USE_CLIENT_BANNER + content);
          console.log(`Added "use client" to ${filePath}`);
        }
      } catch (e) {
        throw new Error(`Failed to add "use client" to ${filePath}: ${String(e)}`);
      }
    }

    // Copy base CSS to dist/styles.css
    try {
      copyFileSync("src/styles/base.css", "dist/styles.css");
      console.log("Copied styles.css to dist/");
    } catch (e) {
      throw new Error(`Failed to copy styles.css to dist/: ${String(e)}`);
    }
  },
});
