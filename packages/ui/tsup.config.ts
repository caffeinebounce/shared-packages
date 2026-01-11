import { readFileSync, writeFileSync } from "node:fs";
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
  },
});
