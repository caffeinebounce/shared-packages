import { createRequire } from "node:module";

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

const failures = [];

for (const { exportName, mode, packageName } of checks) {
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

console.log(`Consumer package import smoke passed (${checks.length} checks).`);
