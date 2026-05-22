import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  createUseClientOnSuccess,
  listBuiltClientJavaScriptFiles,
} from "../../../../scripts/tsup/use-client";

const tempDirs: string[] = [];

function createTempDir() {
  const dir = mkdtempSync(path.join(tmpdir(), "use-client-test-"));
  tempDirs.push(dir);
  return dir;
}

function writeBuiltOutput(
  dir: string,
  fileName: string,
  sourceContent: string,
) {
  const filePath = path.join(dir, fileName);
  writeFileSync(
    filePath,
    "export const value = 1;\n//# sourceMappingURL=output.map\n",
  );
  writeFileSync(
    `${filePath}.map`,
    JSON.stringify({
      version: 3,
      sources: [`../src/${fileName.replace(/\.[cm]?js$/, ".tsx")}`],
      sourcesContent: [sourceContent],
      mappings: "",
    }),
  );
  return filePath;
}

describe("use-client build helper", () => {
  afterEach(() => {
    while (tempDirs.length > 0) {
      const dir = tempDirs.pop();
      if (dir) {
        rmSync(dir, { recursive: true, force: true });
      }
    }
  });

  it("lists only built JavaScript files generated from client source modules", () => {
    const distDir = createTempDir();
    const clientFile = writeBuiltOutput(
      distDir,
      "client.mjs",
      '"use client";\n\nexport function ClientComponent() { return null; }\n',
    );
    writeBuiltOutput(
      distDir,
      "server.mjs",
      "export function serverUtility() { return true; }\n",
    );

    expect(listBuiltClientJavaScriptFiles(distDir)).toEqual([clientFile]);
  });

  it("prepends the directive to client outputs without marking server outputs", async () => {
    const distDir = createTempDir();
    const clientFile = writeBuiltOutput(
      distDir,
      "client.js",
      "'use client';\n\nexport function ClientComponent() { return null; }\n",
    );
    const serverFile = writeBuiltOutput(
      distDir,
      "server.js",
      "export function serverUtility() { return true; }\n",
    );

    await createUseClientOnSuccess({
      files: () => listBuiltClientJavaScriptFiles(distDir),
    })();

    expect(readFileSync(clientFile, "utf8")).toMatch(/^"use client";\n/);
    expect(readFileSync(serverFile, "utf8")).not.toMatch(/^"use client";/);
  });
});
