import { execFileSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  realpathSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const smokeDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(smokeDir, "../..");

function readManifest(packageDir) {
  return JSON.parse(readFileSync(join(packageDir, "package.json"), "utf8"));
}

function findWorkspacePackageDir(packageName) {
  const packagesDir = join(repoRoot, "packages");
  for (const entry of readdirSync(packagesDir)) {
    const packageDir = join(packagesDir, entry);
    if (
      existsSync(join(packageDir, "package.json")) &&
      readManifest(packageDir).name === packageName
    ) {
      return packageDir;
    }
  }

  throw new Error(`workspace package ${packageName} not found`);
}

// Resolve an installed dependency the way Node does: walk up node_modules
// directories from the package that depends on it.
function findInstalledPackageDir(name, fromDir) {
  let dir = fromDir;
  while (true) {
    const candidate = join(dir, "node_modules", name);
    if (existsSync(join(candidate, "package.json"))) {
      return realpathSync(candidate);
    }

    const parent = dirname(dir);
    if (parent === dir) {
      return null;
    }
    dir = parent;
  }
}

// Copy the runtime dependency closure (dependencies and installed optional
// dependencies, never peers) into a flat node_modules, like an install with
// peer auto-install turned off.
function copyDependencies(manifest, fromDir, nodeModulesDir, copied) {
  const optional = new Set(Object.keys(manifest.optionalDependencies ?? {}));
  const names = [
    ...Object.keys(manifest.dependencies ?? {}),
    ...optional,
  ].filter((name) => !copied.has(name));

  for (const name of names) {
    const sourceDir = findInstalledPackageDir(name, fromDir);
    if (!sourceDir) {
      if (optional.has(name)) {
        continue;
      }
      throw new Error(`dependency ${name} is not installed (from ${fromDir})`);
    }

    copied.add(name);
    cpSync(sourceDir, join(nodeModulesDir, name), {
      recursive: true,
      dereference: true,
    });
    copyDependencies(readManifest(sourceDir), sourceDir, nodeModulesDir, copied);
  }
}

/**
 * Install a built workspace package into an empty temp directory with only its
 * runtime dependency closure, then run a probe script from that directory.
 * Peer dependencies such as next and react are absent unless the package
 * depends on them directly.
 */
export function runIsolatedProbe({ packageName, probe }) {
  const workspacePackageName = packageName.split("/").slice(0, 2).join("/");
  const packageDir = findWorkspacePackageDir(workspacePackageName);
  const manifest = readManifest(packageDir);
  const installDir = mkdtempSync(join(tmpdir(), "consumer-smoke-"));

  try {
    const nodeModulesDir = join(installDir, "node_modules");
    const targetDir = join(nodeModulesDir, workspacePackageName);
    for (const file of ["package.json", ...(manifest.files ?? [])]) {
      cpSync(join(packageDir, file), join(targetDir, file), {
        recursive: true,
      });
    }
    copyDependencies(
      manifest,
      packageDir,
      nodeModulesDir,
      new Set([workspacePackageName]),
    );

    // Bare specifiers resolve from the importing file, so the probe must run
    // from inside the isolated install.
    const probeTarget = join(installDir, basename(probe));
    cpSync(join(smokeDir, probe), probeTarget);
    execFileSync(process.execPath, [probeTarget], {
      cwd: installDir,
      encoding: "utf8",
      stdio: "pipe",
      timeout: 60_000,
    });
  } catch (error) {
    const output = [error.stdout, error.stderr].filter(Boolean).join("\n");
    throw new Error(
      `isolated probe ${probe} failed${output ? `:\n${output.trim()}` : ` (${error.message})`}`,
    );
  } finally {
    rmSync(installDir, { recursive: true, force: true });
  }
}
