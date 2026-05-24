import { describe, expect, it } from "vitest";
import {
  assessChangelogDiscipline,
  hasSkipMarker,
  validateCurrentChangelogs,
} from "./check-changelog-discipline.mjs";

describe("changelog discipline policy", () => {
  it("requires a changeset when a package source file changes", () => {
    const result = assessChangelogDiscipline({
      changedFiles: ["packages/ui/src/components/Button.tsx"],
      pullRequestBody: "",
    });

    expect(result.ok).toBe(false);
    expect(result.impactedFiles).toEqual(["packages/ui/src/components/Button.tsx"]);
  });

  it("accepts package source changes when a changeset is present", () => {
    const result = assessChangelogDiscipline({
      changedFiles: [
        "packages/ui/src/components/Button.tsx",
        ".changeset/fresh-buttons.md",
      ],
      pullRequestBody: "",
    });

    expect(result.ok).toBe(true);
    expect(result.reason).toBe("changeset-present");
  });

  it("does not require a changeset for tests, docs, or changelog-only package edits", () => {
    const result = assessChangelogDiscipline({
      changedFiles: [
        "packages/ui/src/components/Button.test.tsx",
        "packages/ui/CHANGELOG.md",
        "docs/auto-publish-system.md",
      ],
      pullRequestBody: "",
    });

    expect(result.ok).toBe(true);
    expect(result.reason).toBe("no-publish-impact");
  });

  it("requires a changeset for shared build tooling that can alter published output", () => {
    const result = assessChangelogDiscipline({
      changedFiles: ["scripts/tsup/use-client.ts"],
      pullRequestBody: "",
    });

    expect(result.ok).toBe(false);
    expect(result.impactedFiles).toEqual(["scripts/tsup/use-client.ts"]);
  });

  it("allows an explicit PR-body skip marker for internal-only exceptions", () => {
    const result = assessChangelogDiscipline({
      changedFiles: ["packages/ui/src/components/Button.tsx"],
      pullRequestBody: "Changelog: skip - test-only generated type cleanup.",
    });

    expect(result.ok).toBe(true);
    expect(result.reason).toBe("skip-marker");
  });

  it("recognizes supported skip marker spellings", () => {
    expect(hasSkipMarker("Changeset: skip - docs only")).toBe(true);
    expect(hasSkipMarker("Changelog: skip - internal tooling only")).toBe(true);
    expect(hasSkipMarker("No changeset needed: docs-only update")).toBe(true);
    expect(hasSkipMarker("No changelog needed: test-only update")).toBe(true);
  });

  it("reports packages whose changelog top version does not match package.json", () => {
    const result = validateCurrentChangelogs([
      {
        name: "@caffeinebounce/ui",
        version: "1.2.3",
        changelog: "# @caffeinebounce/ui\n\n## 1.2.3\n\n### Patch Changes\n",
      },
      {
        name: "@caffeinebounce/logger",
        version: "2.0.0",
        changelog: "# @caffeinebounce/logger\n\n## 1.9.0\n",
      },
    ]);

    expect(result).toEqual([
      "@caffeinebounce/logger: package.json is 2.0.0 but CHANGELOG.md starts at 1.9.0",
    ]);
  });
});
