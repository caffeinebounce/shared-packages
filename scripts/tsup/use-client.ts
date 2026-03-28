import { readdirSync, readFileSync, writeFileSync } from "node:fs";

const USE_CLIENT_BANNER = '"use client";\n';

type OutputFiles = string[] | (() => string[]);

interface CreateUseClientOnSuccessOptions {
  files: OutputFiles;
  afterSuccess?: () => void | Promise<void>;
}

export function listBuiltJavaScriptFiles(distDir = "dist"): string[] {
  return readdirSync(distDir)
    .filter((fileName) => fileName.endsWith(".mjs") || fileName.endsWith(".js"))
    .map((fileName) => `${distDir}/${fileName}`);
}

export function prependUseClientDirective(filePath: string): boolean {
  const content = readFileSync(filePath, "utf-8");
  if (content.startsWith(USE_CLIENT_BANNER)) {
    return false;
  }

  writeFileSync(filePath, `${USE_CLIENT_BANNER}${content}`);
  console.log(`Added "use client" to ${filePath}`);
  return true;
}

function resolveOutputFiles(files: OutputFiles): string[] {
  return typeof files === "function" ? files() : files;
}

export function createUseClientOnSuccess({
  files,
  afterSuccess,
}: CreateUseClientOnSuccessOptions) {
  return async () => {
    for (const filePath of resolveOutputFiles(files)) {
      prependUseClientDirective(filePath);
    }

    await afterSuccess?.();
  };
}
