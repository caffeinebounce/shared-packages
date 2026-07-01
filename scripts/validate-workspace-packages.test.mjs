import { describe, expect, it } from "vitest";
import {
  getAffectedPackageNames,
  parseTurboDryRunPackageNames,
} from "./validate-workspace-packages.mjs";

const workspacePackages = [
  {
    dir: "logger",
    pkgName: "@caffeinebounce/logger",
    manifest: {},
  },
  {
    dir: "shared-utils",
    pkgName: "@caffeinebounce/shared-utils",
    manifest: {},
  },
  {
    dir: "ui",
    pkgName: "@caffeinebounce/ui",
    manifest: {
      dependencies: {
        "@caffeinebounce/logger": "^0.9.130",
        "@caffeinebounce/shared-utils": "^0.7.133",
      },
    },
  },
  {
    dir: "identity",
    pkgName: "@caffeinebounce/identity",
    manifest: {
      dependencies: {
        "@caffeinebounce/logger": "^0.9.130",
        "@caffeinebounce/shared-utils": "^0.7.133",
        "@caffeinebounce/ui": "^0.59.1",
      },
    },
  },
  {
    dir: "ai-assistant",
    pkgName: "@caffeinebounce/ai-assistant",
    manifest: {
      dependencies: {
        "@caffeinebounce/ui": "^0.59.1",
      },
    },
  },
  {
    dir: "email",
    pkgName: "@caffeinebounce/email",
    manifest: {},
  },
];

describe("affected package selection", () => {
  it("includes a changed package and transitive dependents", () => {
    expect(
      getAffectedPackageNames({
        changedFiles: ["packages/logger/src/index.ts"],
        workspacePackages,
      }),
    ).toEqual([
      "@caffeinebounce/ai-assistant",
      "@caffeinebounce/identity",
      "@caffeinebounce/logger",
      "@caffeinebounce/ui",
    ]);
  });

  it("treats package manager and root compiler changes as full-workspace impact", () => {
    expect(
      getAffectedPackageNames({
        changedFiles: ["yarn.lock", "tsconfig.base.json"],
        workspacePackages,
      }),
    ).toEqual([
      "@caffeinebounce/ai-assistant",
      "@caffeinebounce/email",
      "@caffeinebounce/identity",
      "@caffeinebounce/logger",
      "@caffeinebounce/shared-utils",
      "@caffeinebounce/ui",
    ]);
  });

  it("ignores docs-only changes outside packages", () => {
    expect(
      getAffectedPackageNames({
        changedFiles: ["docs/auto-publish-system.md"],
        workspacePackages,
      }),
    ).toEqual([]);
  });

  it("extracts workspace packages from Turbo dry-run output", () => {
    expect(
      parseTurboDryRunPackageNames({
        dryRunOutput: `• turbo 2.9.14
{
  "packages": [
    "//",
    "@caffeinebounce/logger",
    "@caffeinebounce/ui"
  ]
}`,
        workspacePackageNames: new Set([
          "@caffeinebounce/logger",
          "@caffeinebounce/ui",
          "@caffeinebounce/email",
        ]),
      }),
    ).toEqual(["@caffeinebounce/logger", "@caffeinebounce/ui"]);
  });
});
