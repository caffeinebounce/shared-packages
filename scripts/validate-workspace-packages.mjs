import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const REQUIRED_SCRIPTS = ["build", "lint", "typecheck", "test", "clean"];
const REQUIRED_FIELDS = ["main", "module", "types", "exports", "files"];
const REQUIRED_PUBLISH_CONFIG_FIELDS = ["registry", "access"];
const REQUIRED_REPOSITORY_FIELDS = ["type", "url", "directory"];

const repoRoot = process.cwd();
const packagesDir = path.join(repoRoot, "packages");
const packageDirs = readdirSync(packagesDir).sort();
const failures = [];

function walkExportTargets(value, targets = []) {
  if (typeof value === "string") {
    targets.push(value);
    return targets;
  }

  if (value && typeof value === "object") {
    for (const nested of Object.values(value)) {
      walkExportTargets(nested, targets);
    }
  }

  return targets;
}

for (const dir of packageDirs) {
  const packageDir = path.join(packagesDir, dir);
  const packageJsonPath = path.join(packageDir, "package.json");

  if (!existsSync(packageJsonPath)) {
    continue;
  }

  const manifest = JSON.parse(readFileSync(packageJsonPath, "utf8"));
  const pkgName = manifest.name ?? dir;

  for (const script of REQUIRED_SCRIPTS) {
    if (!manifest.scripts?.[script]) {
      failures.push(`${pkgName}: missing required script "${script}"`);
    }
  }

  for (const field of REQUIRED_FIELDS) {
    if (manifest[field] == null) {
      failures.push(`${pkgName}: missing required field "${field}"`);
    }
  }

  for (const field of REQUIRED_PUBLISH_CONFIG_FIELDS) {
    if (manifest.publishConfig?.[field] == null) {
      failures.push(`${pkgName}: missing publishConfig.${field}`);
    }
  }

  for (const field of REQUIRED_REPOSITORY_FIELDS) {
    if (manifest.repository?.[field] == null) {
      failures.push(`${pkgName}: missing repository.${field}`);
    }
  }

  const distTargets = new Set([
    manifest.main,
    manifest.module,
    manifest.types,
    ...walkExportTargets(manifest.exports),
  ]);

  for (const target of distTargets) {
    if (typeof target !== "string" || !target.startsWith("./dist/")) {
      continue;
    }

    const filePath = path.join(packageDir, target.slice(2));
    if (!existsSync(filePath)) {
      failures.push(`${pkgName}: export target does not exist after build -> ${target}`);
    }
  }
}

if (failures.length > 0) {
  console.error("Workspace package validation failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`Validated ${packageDirs.length} workspace packages.`);
