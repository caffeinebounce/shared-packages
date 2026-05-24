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
      bytes: 75 * 1024,
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

function isJavaScriptTarget(target) {
  return /\.(mjs|js)$/.test(target);
}

function toPackageTarget(absolutePath) {
  return `./${path.relative(uiPackageDir, absolutePath).split(path.sep).join("/")}`;
}

function collectRelativeImports(source) {
  const imports = new Set();
  const patterns = [
    /(?:import|export)\s+(?:[^'"]*?\s+from\s+)?["'](\.[^"']+)["']/g,
    /import\(\s*["'](\.[^"']+)["']\s*\)/g,
    /require\(\s*["'](\.[^"']+)["']\s*\)/g,
  ];

  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) {
      imports.add(match[1]);
    }
  }

  return imports;
}

function resolveJavaScriptImport(fromFile, specifier) {
  const resolved = path.resolve(path.dirname(fromFile), specifier);
  const candidates = path.extname(resolved)
    ? [resolved]
    : [`${resolved}.mjs`, `${resolved}.js`, path.join(resolved, "index.mjs"), path.join(resolved, "index.js")];

  return candidates.find((candidate) => existsSync(candidate));
}

function traceJavaScriptFiles(target) {
  const absoluteTarget = path.join(uiPackageDir, target.slice(2));
  const files = new Set();
  const stack = [absoluteTarget];

  while (stack.length > 0) {
    const current = stack.pop();

    if (!current || files.has(current) || !existsSync(current)) {
      continue;
    }

    files.add(current);

    const source = readFileSync(current, "utf8");
    for (const specifier of collectRelativeImports(source)) {
      const imported = resolveJavaScriptImport(current, specifier);
      if (imported?.startsWith(path.join(uiPackageDir, "dist"))) {
        stack.push(imported);
      }
    }
  }

  return files;
}

function sumFileSizes(files) {
  return [...files].reduce((total, file) => total + statSync(file).size, 0);
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
  const transitiveJavaScriptFiles = new Set();
  const traces = [];

  for (const { bytes, target } of sizes) {
    if (bytes != null && isJavaScriptTarget(target)) {
      const files = traceJavaScriptFiles(target);
      traces.push({
        bytes: sumFileSizes(files),
        files,
        target,
      });

      for (const file of files) {
        transitiveJavaScriptFiles.add(file);
      }
    }
  }

  const totalJavaScriptBytes = Math.max(0, ...traces.map((trace) => trace.bytes));

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
    traces,
    transitiveJavaScriptFiles,
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

  const transitiveTargets = [...row.transitiveJavaScriptFiles]
    .map(toPackageTarget)
    .sort();
  for (const trace of row.traces) {
    console.log(
      `  ${trace.target} transitive runtime: ${formatBytes(trace.bytes)} (${trace.files.size} files)`,
    );
  }
  if (transitiveTargets.length > 0) {
    console.log(`  distinct transitive JS files: ${transitiveTargets.length}`);
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
