import { readFileSync, writeFileSync } from "node:fs";
import { defineConfig } from "tsup";

const USE_CLIENT_BANNER = '"use client";\n';

export default defineConfig({
  entry: {
    index: "src/index.ts",
    server: "src/server.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  splitting: true,
  sourcemap: true,
  clean: true,
  external: ["react", "react-dom", "stripe"],
  treeshake: true,
  minify: false,
  outExtension({ format }) {
    return {
      js: format === "esm" ? ".mjs" : ".js",
    };
  },
  async onSuccess() {
    // Add "use client" directive only to client entry point (index.mjs and index.js)
    const clientFiles = ["dist/index.mjs", "dist/index.js"];

    for (const filePath of clientFiles) {
      try {
        const content = readFileSync(filePath, "utf-8");
        if (!content.startsWith('"use client"')) {
          writeFileSync(filePath, USE_CLIENT_BANNER + content);
          console.log(`Added "use client" to ${filePath}`);
        }
      } catch (e) {
        console.error(`Failed to add "use client" to ${filePath}:`, e);
      }
    }
  },
});
