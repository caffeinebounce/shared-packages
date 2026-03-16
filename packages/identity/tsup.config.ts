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
  ],
  treeshake: true,
  minify: false,
  outExtension({ format }) {
    return {
      js: format === "esm" ? ".mjs" : ".js",
    };
  },
  async onSuccess() {
    // Only client-facing outputs should carry the directive.
    const files = ["dist/index.mjs", "dist/index.js"];
    for (const file of files) {
      try {
        const content = readFileSync(file, "utf-8");
        if (!content.startsWith('"use client"')) {
          writeFileSync(file, USE_CLIENT_BANNER + content);
          console.log(`Added "use client" to ${file}`);
        }
      } catch (e) {
        console.error(`Failed to add "use client" to ${file}:`, e);
      }
    }
  },
});
