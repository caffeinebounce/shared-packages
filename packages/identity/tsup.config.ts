import { defineConfig } from "tsup";
import { writeFileSync, readFileSync } from "node:fs";

const USE_CLIENT_BANNER = '"use client";\n';

export default defineConfig([
  // Client components bundle (with "use client")
  {
    entry: { index: "src/index.ts" },
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
      // Add "use client" directive to client bundle only
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
  },
  // Server bundle (no "use client")
  {
    entry: { server: "src/server.ts" },
    format: ["esm", "cjs"],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: false, // Don't clean - client bundle already ran
    external: [
      "next",
      "next/server",
      "@supabase/supabase-js",
    ],
    treeshake: true,
    minify: false,
    outExtension({ format }) {
      return {
        js: format === "esm" ? ".mjs" : ".js",
      };
    },
  },
]);
