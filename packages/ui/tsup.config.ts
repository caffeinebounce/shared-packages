import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { defineConfig } from "tsup";

const USE_CLIENT_BANNER = '"use client";\n';

export default defineConfig({
  entry: ["src/index.tsx"],
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
  ],
  treeshake: true,
  minify: false,
  // Inline CSS imports from node_modules (including GrapesJS CSS)
  injectStyle: false,
  outExtension({ format }) {
    return {
      js: format === "esm" ? ".mjs" : ".js",
    };
  },
  async onSuccess() {
    // Add "use client" directive to output files
    const files = ["dist/index.mjs", "dist/index.js"];
    for (const file of files) {
      try {
        const content = readFileSync(file, "utf-8");
        writeFileSync(file, USE_CLIENT_BANNER + content);
        console.log(`Added "use client" to ${file}`);
      } catch (e) {
        console.error(`Failed to add "use client" to ${file}:`, e);
      }
    }

    // Copy GrapesJS CSS to dist for consumers to import
    // GrapesJS is installed at monorepo root, so use relative path from here
    const grapesCSS = "../../node_modules/grapesjs/dist/css/grapes.min.css";
    const destDir = "dist";
    const destFile = join(destDir, "grapes.min.css");

    if (existsSync(grapesCSS)) {
      if (!existsSync(destDir)) {
        mkdirSync(destDir, { recursive: true });
      }
      copyFileSync(grapesCSS, destFile);
      console.log(`Copied GrapesJS CSS to ${destFile}`);
    } else {
      console.warn(`GrapesJS CSS not found at ${grapesCSS}`);
    }
  },
});
