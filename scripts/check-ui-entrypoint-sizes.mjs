import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const uiPackageDir = path.join(repoRoot, "packages/ui");
const uiPackageJsonPath = path.join(uiPackageDir, "package.json");
const uiPackageJson = JSON.parse(readFileSync(uiPackageJsonPath, "utf8"));

const budgets = new Map([
  [
    "./primitives",
    {
      bytes: 50 * 1024,
      reason: "Primitive-only consumers should not inherit heavy UI surfaces.",
    },
  ],
]);

const heavyEntrypoints = new Set([
  ".",
  "./charts",
  "./editor",
  "./marketing-3d",
  "./media",
]);

function collectTargets(value, targets = new Set()) {
  if (typeof value === "string") {
    targets.add(value);
    return targets;
  }

  if (value && typeof value === "object") {
    for (const nested of Object.values(value)) {
      collectTargets(nested, targets);
    }
  }

  return targets;
}

function formatBytes(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  return `${(bytes / 1024).toFixed(2)} KB`;
}

const failures = [];
const rows = [];

for (const [exportPath, exportConfig] of Object.entries(uiPackageJson.exports)) {
  if (exportPath === "./styles.css") {
    continue;
  }

  const targets = [...collectTargets(exportConfig)]
    .filter((target) => target.startsWith("./dist/"))
    .sort();
  const sizes = targets.map((target) => {
    const absoluteTarget = path.join(uiPackageDir, target.slice(2));
    const bytes = existsSync(absoluteTarget) ? statSync(absoluteTarget).size : null;

    return { bytes, target };
  });
  const budget = budgets.get(exportPath);
  const totalJavaScriptBytes = sizes
    .filter(({ bytes, target }) => bytes != null && /\.(mjs|js)$/.test(target))
    .reduce((total, { bytes }) => total + bytes, 0);

  rows.push({
    budget,
    exportPath,
    note: heavyEntrypoints.has(exportPath)
      ? "heavy/documented"
      : budget
        ? "budgeted"
        : "reported",
    sizes,
    totalJavaScriptBytes,
  });

  if (budget && totalJavaScriptBytes > budget.bytes) {
    failures.push(
      `${exportPath}: ${formatBytes(totalJavaScriptBytes)} exceeds ${formatBytes(
        budget.bytes,
      )}. ${budget.reason}`,
    );
  }

  for (const { bytes, target } of sizes) {
    if (bytes == null) {
      failures.push(`${exportPath}: missing built target ${target}`);
    }
  }
}

console.log("@caffeinebounce/ui public entrypoint sizes:");
for (const row of rows) {
  const budgetText = row.budget
    ? ` / budget ${formatBytes(row.budget.bytes)}`
    : "";
  console.log(
    `- ${row.exportPath}: ${formatBytes(row.totalJavaScriptBytes)} JS${budgetText} (${row.note})`,
  );

  for (const { bytes, target } of row.sizes) {
    console.log(`  ${target}: ${bytes == null ? "missing" : formatBytes(bytes)}`);
  }
}

if (failures.length > 0) {
  console.error("\nUI entrypoint size check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("\nUI entrypoint size check passed.");
