import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";

const requirePackage = createRequire(import.meta.url);

const checks = [
  {
    exportName: null,
    packageName: "@caffeinebounce/ui",
    mode: "resolve",
  },
  {
    exportName: "Button",
    packageName: "@caffeinebounce/ui/primitives",
    mode: "import",
  },
  {
    exportName: "useDebounce",
    packageName: "@caffeinebounce/ui/hooks",
    mode: "import",
  },
  {
    exportName: "createAuthCallbackHandler",
    packageName: "@caffeinebounce/identity/server",
    mode: "require",
  },
  {
    exportName: "logger",
    packageName: "@caffeinebounce/logger",
    mode: "import",
  },
  {
    exportName: "NotificationBell",
    packageName: "@caffeinebounce/notifications",
    mode: "import",
  },
  {
    exportName: "AiAssistantProvider",
    packageName: "@caffeinebounce/ai-assistant",
    mode: "import",
  },
];

function getWorkspacePackageName(packageName) {
  const parts = packageName.split("/");
  return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : packageName;
}

function parseTurboPackages(output) {
  const jsonStart = output.indexOf("{");
  if (jsonStart === -1) {
    return null;
  }

  const dryRun = JSON.parse(output.slice(jsonStart));
  return new Set((dryRun.packages ?? []).filter((packageName) => packageName !== "//"));
}

function getAffectedPackages() {
  const baseRef = process.env.TURBO_SCM_BASE ?? "origin/main";
  const output = execFileSync(
    "yarn",
    [
      "turbo",
      "run",
      "build",
      "--dry=json",
      `--filter=...[${baseRef}]`,
    ],
    { encoding: "utf8" },
  );

  return parseTurboPackages(output);
}

const affectedPackages =
  process.env.CONSUMER_SMOKE_SCOPE === "affected" ? getAffectedPackages() : null;
const scopedChecks = affectedPackages
  ? checks.filter(({ packageName }) =>
      affectedPackages.has(getWorkspacePackageName(packageName)),
    )
  : checks;
const failures = [];

for (const { exportName, mode, packageName } of scopedChecks) {
  try {
    if (mode === "resolve") {
      import.meta.resolve(packageName);
      continue;
    }

    const imported =
      mode === "require" ? requirePackage(packageName) : await import(packageName);
    if (exportName && !(exportName in imported)) {
      failures.push(`${packageName}: missing export "${exportName}"`);
    }
  } catch (error) {
    failures.push(
      `${packageName}: import failed (${error instanceof Error ? error.message : String(error)})`,
    );
  }
}

if (failures.length > 0) {
  console.error("Consumer package import smoke failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  `Consumer package import smoke passed (${scopedChecks.length}/${checks.length} checks).`,
);
