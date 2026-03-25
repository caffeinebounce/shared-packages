import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const REQUIRED_SCRIPTS = ["build", "lint", "typecheck", "test", "clean"];
const REQUIRED_FIELDS = ["main", "module", "types", "exports", "files"];
const REQUIRED_PUBLISH_CONFIG_FIELDS = ["registry", "access"];
const REQUIRED_REPOSITORY_FIELDS = ["type", "url", "directory"];
const INTERNAL_DEPENDENCY_FIELDS = [
  "dependencies",
  "peerDependencies",
  "devDependencies",
  "optionalDependencies",
];
const INTERNAL_SCOPE = "@caffeinebounce/";

const repoRoot = process.cwd();
const packagesDir = path.join(repoRoot, "packages");
const packageDirs = readdirSync(packagesDir).sort();
const failures = [];
const workspacePackages = [];

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
  workspacePackages.push({
    dir,
    packageDir,
    packageJsonPath,
    manifest,
    pkgName: manifest.name ?? dir,
  });
}

const workspacePackageNames = new Set(workspacePackages.map(({ pkgName }) => pkgName));
const workspaceVersions = new Map(
  workspacePackages.flatMap(({ manifest, pkgName }) => {
    if (typeof manifest.version !== "string" || manifest.version.trim() === "") {
      failures.push(`${pkgName}: missing valid version`);
      return [];
    }

    return [[pkgName, manifest.version]];
  }),
);

for (const { packageDir, manifest, pkgName } of workspacePackages) {
  for (const field of INTERNAL_DEPENDENCY_FIELDS) {
    for (const [dependencyName, dependencyRange] of Object.entries(manifest[field] ?? {})) {
      if (!dependencyName.startsWith(INTERNAL_SCOPE) || dependencyName === pkgName) {
        continue;
      }

      const workspaceVersion = workspaceVersions.get(dependencyName);

      if (!workspaceVersion) {
        if (workspacePackageNames.has(dependencyName)) {
          failures.push(
            `${pkgName}: ${field}.${dependencyName} points to a workspace package without a readable version`,
          );
        }
        continue;
      }

      const expectedRange = `^${workspaceVersion}`;

      if (dependencyRange !== expectedRange) {
        failures.push(
          `${pkgName}: ${field}.${dependencyName} should be "${expectedRange}" (found "${dependencyRange}")`,
        );
      }
    }
  }

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

console.log(`Validated ${workspacePackages.length} workspace packages.`);
