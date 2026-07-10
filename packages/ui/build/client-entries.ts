import { existsSync, readFileSync, rmSync } from "node:fs";
import { basename, isAbsolute, join, resolve } from "node:path";
import {
  hasUseClientDirective,
  listBuiltClientJavaScriptFiles,
} from "../../../scripts/tsup/use-client";

const CLIENT_ENTRYPOINTS = [
  "index",
  "layouts",
  "marketing",
  "navigation",
] as const;
const JAVASCRIPT_EXTENSIONS = ["js", "mjs"] as const;
const BUILD_METAFILES = ["metafile-cjs.json", "metafile-esm.json"] as const;

interface BuildMetafileOutput {
  inputs?: Record<string, unknown>;
}

interface BuildMetafile {
  outputs: Record<string, BuildMetafileOutput>;
}

function parseBuildMetafile(filePath: string): BuildMetafile | null {
  try {
    const parsed: unknown = JSON.parse(readFileSync(filePath, "utf8"));
    if (
      parsed &&
      typeof parsed === "object" &&
      "outputs" in parsed &&
      parsed.outputs &&
      typeof parsed.outputs === "object"
    ) {
      return parsed as BuildMetafile;
    }
  } catch {
    return null;
  }

  return null;
}

function resolveMetafilePath(filePath: string, distDir: string) {
  const resolvedFromCwd = isAbsolute(filePath) ? filePath : resolve(filePath);
  if (existsSync(resolvedFromCwd)) {
    return resolvedFromCwd;
  }

  const resolvedFromDist = join(distDir, basename(filePath));
  return existsSync(resolvedFromDist) ? resolvedFromDist : null;
}

function listMetafileClientJavaScriptFiles(distDir: string) {
  const files = new Set<string>();

  for (const metafileName of BUILD_METAFILES) {
    const metafilePath = join(distDir, metafileName);
    if (!existsSync(metafilePath)) {
      continue;
    }

    const metafile = parseBuildMetafile(metafilePath);
    if (!metafile) {
      continue;
    }

    for (const [outputPath, output] of Object.entries(metafile.outputs)) {
      if (!outputPath.endsWith(".js") && !outputPath.endsWith(".mjs")) {
        continue;
      }

      const hasClientSource = Object.keys(output.inputs ?? {}).some(
        (inputPath) => {
          const sourcePath = resolveMetafilePath(inputPath, distDir);
          return (
            sourcePath !== null &&
            hasUseClientDirective(readFileSync(sourcePath, "utf8"))
          );
        },
      );
      if (!hasClientSource) {
        continue;
      }

      const builtFilePath = resolveMetafilePath(outputPath, distDir);
      if (builtFilePath) {
        files.add(builtFilePath);
      }
    }
  }

  return [...files];
}

export function listUiBuiltClientJavaScriptFiles(distDir = "dist"): string[] {
  const files = new Set(listBuiltClientJavaScriptFiles(distDir));

  for (const filePath of listMetafileClientJavaScriptFiles(distDir)) {
    files.add(filePath);
  }

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

export function removeUiBuildMetafiles(distDir = "dist"): void {
  for (const metafileName of BUILD_METAFILES) {
    rmSync(join(distDir, metafileName), { force: true });
  }
}
