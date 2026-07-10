import { existsSync } from "node:fs";
import { join } from "node:path";
import { listBuiltClientJavaScriptFiles } from "../../../scripts/tsup/use-client";

const CLIENT_ENTRYPOINTS = ["index", "layouts", "marketing"] as const;
const JAVASCRIPT_EXTENSIONS = ["js", "mjs"] as const;

export function listUiBuiltClientJavaScriptFiles(distDir = "dist"): string[] {
  const files = new Set(listBuiltClientJavaScriptFiles(distDir));

  for (const entrypoint of CLIENT_ENTRYPOINTS) {
    for (const extension of JAVASCRIPT_EXTENSIONS) {
      const filePath = join(distDir, `${entrypoint}.${extension}`);
      if (existsSync(filePath)) {
        files.add(filePath);
      }
    }
  }

  return [...files];
}
