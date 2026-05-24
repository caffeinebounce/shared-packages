#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

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
const FULL_WORKSPACE_IMPACT_PATTERNS = [
  /^package\.json$/,
  /^yarn\.lock$/,
  /^turbo\.json$/,
  /^biome\.json$/,
  /^vitest\.config\.[cm]?[jt]s$/,
  /^vitest\.setup\.[cm]?[jt]s$/,
  /^tsconfig\..*\.json$/,
  /^\.yarnrc(\..*)?\.yml$/,
  /^scripts\/tsup\//,
];

function normalizeFilePath(filePath) {
  return filePath.replaceAll("\\", "/").replace(/^\.\//, "");
}

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

function hasFullWorkspaceImpact(changedFiles) {
  return changedFiles.some((filePath) =>
    FULL_WORKSPACE_IMPACT_PATTERNS.some((pattern) =>
      pattern.test(normalizeFilePath(filePath)),
    ),
  );
}

function readChangedFiles(baseRef) {
  const output = execFileSync("git", ["diff", "--name-only", `${baseRef}...HEAD`], {
    encoding: "utf8",
  });

  return output
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function parseTurboDryRunPackageNames({
  dryRunOutput,
  workspacePackageNames,
}) {
  const jsonStart = dryRunOutput.indexOf("{");

  if (jsonStart === -1) {
    return [];
  }

  const dryRun = JSON.parse(dryRunOutput.slice(jsonStart));
  return (dryRun.packages ?? [])
    .filter((pkgName) => workspacePackageNames.has(pkgName))
    .sort((a, b) => a.localeCompare(b));
}

function readTurboAffectedPackageNames({ baseRef, workspacePackages }) {
  const workspacePackageNames = new Set(
    workspacePackages.map(({ pkgName }) => pkgName),
  );
  const output = execFileSync(
    "yarn",
    [
      "turbo",
      "run",
      "build",
      "--dry=json",
      `--filter=...[${baseRef}]`,
    ],
    {
      encoding: "utf8",
    },
  );

  return parseTurboDryRunPackageNames({
    dryRunOutput: output,
    workspacePackageNames,
  });
}

export function readWorkspacePackages({ repoRoot = process.cwd() } = {}) {
  const packagesDir = path.join(repoRoot, "packages");
  const packageDirs = readdirSync(packagesDir).sort();

  return packageDirs.flatMap((dir) => {
    const packageDir = path.join(packagesDir, dir);
    const packageJsonPath = path.join(packageDir, "package.json");

    if (!existsSync(packageJsonPath)) {
      return [];
    }

    const manifest = JSON.parse(readFileSync(packageJsonPath, "utf8"));
    return [
      {
        dir,
        packageDir,
        packageJsonPath,
        manifest,
        pkgName: manifest.name ?? dir,
      },
    ];
  });
}

export function getAffectedPackageNames({ changedFiles, workspacePackages }) {
  const sortedPackageNames = workspacePackages
    .map(({ pkgName }) => pkgName)
    .sort((a, b) => a.localeCompare(b));

  if (hasFullWorkspaceImpact(changedFiles)) {
    return sortedPackageNames;
  }

  const packagesByDir = new Map(
    workspacePackages.map((workspacePackage) => [
      workspacePackage.dir,
      workspacePackage,
    ]),
  );
  const dependentsByDependency = new Map();

  for (const { manifest, pkgName } of workspacePackages) {
    for (const field of INTERNAL_DEPENDENCY_FIELDS) {
      for (const dependencyName of Object.keys(manifest[field] ?? {})) {
        if (!dependencyName.startsWith(INTERNAL_SCOPE) || dependencyName === pkgName) {
          continue;
        }

        const dependents = dependentsByDependency.get(dependencyName) ?? new Set();
        dependents.add(pkgName);
        dependentsByDependency.set(dependencyName, dependents);
      }
    }
  }

  const affected = new Set();
  const queue = [];

  for (const filePath of changedFiles.map(normalizeFilePath)) {
    const packageDir = filePath.match(/^packages\/([^/]+)\//)?.[1];
    const workspacePackage = packageDir ? packagesByDir.get(packageDir) : undefined;

    if (workspacePackage && !affected.has(workspacePackage.pkgName)) {
      affected.add(workspacePackage.pkgName);
      queue.push(workspacePackage.pkgName);
    }
  }

  while (queue.length > 0) {
    const pkgName = queue.shift();
    for (const dependent of dependentsByDependency.get(pkgName) ?? []) {
      if (affected.has(dependent)) {
        continue;
      }

      affected.add(dependent);
      queue.push(dependent);
    }
  }

  return [...affected].sort((a, b) => a.localeCompare(b));
}

export function validateWorkspacePackages({
  repoRoot = process.cwd(),
  distPackageNames = null,
} = {}) {
  const failures = [];
  const workspacePackages = readWorkspacePackages({ repoRoot });
  const workspacePackageNames = new Set(
    workspacePackages.map(({ pkgName }) => pkgName),
  );
  const workspaceVersions = new Map(
    workspacePackages.flatMap(({ manifest, pkgName }) => {
      if (typeof manifest.version !== "string" || manifest.version.trim() === "") {
        failures.push(`${pkgName}: missing valid version`);
        return [];
      }

      return [[pkgName, manifest.version]];
    }),
  );
  const distPackageNameSet =
    distPackageNames == null ? null : new Set(distPackageNames);

  for (const { packageDir, manifest, pkgName } of workspacePackages) {
    for (const field of INTERNAL_DEPENDENCY_FIELDS) {
      for (const [dependencyName, dependencyRange] of Object.entries(
        manifest[field] ?? {},
      )) {
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

    if (distPackageNameSet && !distPackageNameSet.has(pkgName)) {
      continue;
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

  return {
    checkedDistPackageCount: distPackageNameSet?.size ?? workspacePackages.length,
    failures,
    packageCount: workspacePackages.length,
  };
}

function parseArgs(argv) {
  const affectedIndex = argv.indexOf("--affected");

  if (affectedIndex === -1) {
    return { affectedBaseRef: null };
  }

  return {
    affectedBaseRef: argv[affectedIndex + 1] ?? "origin/main",
  };
}

function printFailures(failures) {
  console.error("Workspace package validation failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
}

function runCli() {
  const { affectedBaseRef } = parseArgs(process.argv.slice(2));
  const workspacePackages = readWorkspacePackages();
  let distPackageNames = null;

  if (affectedBaseRef) {
    try {
      distPackageNames = readTurboAffectedPackageNames({
        baseRef: affectedBaseRef,
        workspacePackages,
      });
    } catch (error) {
      console.warn(
        `Falling back to git-based affected package detection: ${error.message}`,
      );
      distPackageNames = getAffectedPackageNames({
        changedFiles: readChangedFiles(affectedBaseRef),
        workspacePackages,
      });
    }
  }

  const result = validateWorkspacePackages({ distPackageNames });

  if (result.failures.length > 0) {
    printFailures(result.failures);
    process.exit(1);
  }

  if (distPackageNames) {
    console.log(
      `Validated ${result.packageCount} workspace packages; checked built export targets for ${result.checkedDistPackageCount} affected packages.`,
    );
    return;
  }

  console.log(`Validated ${result.packageCount} workspace packages.`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runCli();
}
