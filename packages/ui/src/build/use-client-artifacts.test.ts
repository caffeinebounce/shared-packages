// @vitest-environment node

import { execFileSync } from "node:child_process";
import {
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { createUseClientOnSuccess } from "../../../../scripts/tsup/use-client";
import { listUiBuiltClientJavaScriptFiles } from "../../build/client-entries";

const packageRoot = process.cwd();
const tempDir = mkdtempSync(path.join(tmpdir(), "ui-client-artifacts-test-"));

afterAll(() => {
  rmSync(tempDir, { recursive: true, force: true });
});

describe("UI client build artifacts", () => {
  it("retains client directives in a fresh no-sourcemap build", async () => {
    const distDir = path.join(tempDir, "dist");
    const configPath = path.join(tempDir, "tsup.config.mjs");
    const tsupCli = path.resolve(
      packageRoot,
      "../../node_modules/tsup/dist/cli-default.js",
    );
    writeFileSync(
      configPath,
      `export default {
  clean: true,
  dts: false,
  entry: {
    index: ${JSON.stringify(path.join(packageRoot, "src/index.tsx"))},
    layouts: ${JSON.stringify(path.join(packageRoot, "src/entries/layouts.ts"))},
    marketing: ${JSON.stringify(path.join(packageRoot, "src/entries/marketing.ts"))},
    navigation: ${JSON.stringify(path.join(packageRoot, "src/entries/navigation.ts"))},
  },
  external: ${JSON.stringify([
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
  ])},
  format: ["esm", "cjs"],
  metafile: true,
  minify: false,
  outDir: ${JSON.stringify(distDir)},
  outExtension({ format }) {
    return { js: format === "esm" ? ".mjs" : ".js" };
  },
  silent: true,
  sourcemap: false,
  splitting: true,
  treeshake: true,
  tsconfig: ${JSON.stringify(path.join(packageRoot, "tsconfig.json"))},
};
`,
    );
    execFileSync(process.execPath, [tsupCli, "--config", configPath], {
      cwd: packageRoot,
      stdio: "pipe",
    });

    await createUseClientOnSuccess({
      files: () => listUiBuiltClientJavaScriptFiles(distDir),
    })();

    const artifactNames = readdirSync(distDir);
    expect(artifactNames.some((name) => name.endsWith(".map"))).toBe(false);

    for (const entrypoint of [
      "index.js",
      "index.mjs",
      "layouts.js",
      "layouts.mjs",
      "marketing.js",
      "marketing.mjs",
      "navigation.js",
      "navigation.mjs",
    ]) {
      expect(
        readFileSync(path.join(distDir, entrypoint), "utf8"),
        entrypoint,
      ).toMatch(/^"use client";\n/);
    }

    const sidebarArtifacts = artifactNames
      .filter((name) => name.endsWith(".js") || name.endsWith(".mjs"))
      .filter((name) =>
        readFileSync(path.join(distDir, name), "utf8").includes(
          "SIDEBAR_COOKIE_NAME",
        ),
      );
    expect(sidebarArtifacts).toHaveLength(2);
    for (const sidebarArtifact of sidebarArtifacts) {
      expect(
        readFileSync(path.join(distDir, sidebarArtifact), "utf8"),
        sidebarArtifact,
      ).toMatch(/^"use client";\n/);
    }
  }, 30_000);
});
