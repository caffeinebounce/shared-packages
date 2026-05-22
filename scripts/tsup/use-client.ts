import {
  existsSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { dirname, resolve } from "node:path";

const USE_CLIENT_BANNER = '"use client";\n';
const USE_CLIENT_DIRECTIVE_PREFIX = /^['"]use client['"];?\s*/;

type OutputFiles = string[] | (() => string[]);

interface SourceMapLike {
  sources?: unknown;
  sourcesContent?: unknown;
}

interface CreateUseClientOnSuccessOptions {
  files: OutputFiles;
  afterSuccess?: () => void | Promise<void>;
}

export function listBuiltJavaScriptFiles(distDir = "dist"): string[] {
  return readdirSync(distDir)
    .filter((fileName) => fileName.endsWith(".mjs") || fileName.endsWith(".js"))
    .map((fileName) => `${distDir}/${fileName}`);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function parseSourceMap(filePath: string): SourceMapLike | null {
  try {
    const parsed: unknown = JSON.parse(readFileSync(filePath, "utf-8"));
    if (parsed && typeof parsed === "object") {
      return parsed;
    }
  } catch {
    return null;
  }

  return null;
}

function hasUseClientDirective(content: string): boolean {
  return USE_CLIENT_DIRECTIVE_PREFIX.test(content);
}

function outputHasUseClientSource(filePath: string): boolean {
  const content = readFileSync(filePath, "utf-8");
  if (hasUseClientDirective(content)) {
    return true;
  }

  const sourceMapPath = `${filePath}.map`;
  if (!existsSync(sourceMapPath)) {
    return false;
  }

  const sourceMap = parseSourceMap(sourceMapPath);
  if (!sourceMap) {
    return false;
  }

  if (isStringArray(sourceMap.sourcesContent)) {
    return sourceMap.sourcesContent.some(hasUseClientDirective);
  }

  if (!isStringArray(sourceMap.sources)) {
    return false;
  }

  return sourceMap.sources.some((sourcePath) => {
    const resolvedPath = resolve(dirname(sourceMapPath), sourcePath);
    return (
      existsSync(resolvedPath) &&
      hasUseClientDirective(readFileSync(resolvedPath, "utf-8"))
    );
  });
}

export function listBuiltClientJavaScriptFiles(distDir = "dist"): string[] {
  return listBuiltJavaScriptFiles(distDir).filter(outputHasUseClientSource);
}

export function prependUseClientDirective(filePath: string): boolean {
  const content = readFileSync(filePath, "utf-8");
  if (hasUseClientDirective(content)) {
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
