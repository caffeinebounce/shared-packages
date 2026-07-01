#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SKIP_MARKER_PATTERNS = [
  /\bchangeset:\s*skip\b/i,
  /\bchangelog:\s*skip\b/i,
  /\bno changeset needed\b/i,
  /\bno changelog needed\b/i,
];

const SHARED_BUILD_IMPACT_PATTERNS = [
  /^scripts\/tsup\//,
  /^tsconfig\.base\.json$/,
  /^tsconfig\.test\.base\.json$/,
];

function normalizeFilePath(filePath) {
  return filePath.replaceAll("\\", "/").replace(/^\.\//, "");
}

function isChangesetFile(filePath) {
  return /^\.changeset\/(?!README\.md$)[^/]+\.md$/.test(normalizeFilePath(filePath));
}

function isTestOrStoryFile(filePath) {
  const normalized = normalizeFilePath(filePath);
  return (
    /(^|\/)(__tests__|__mocks__|test|tests|stories|__snapshots__)(\/|$)/.test(
      normalized,
    ) ||
    /\.(test|spec|stories)\.[cm]?[jt]sx?$/.test(normalized) ||
    /\.snap$/.test(normalized)
  );
}

function isPackagePublishImpactFile(filePath) {
  const normalized = normalizeFilePath(filePath);
  const match = normalized.match(/^packages\/[^/]+\/(.+)$/);

  if (!match) {
    return false;
  }

  const packageRelativePath = match[1];

  if (
    packageRelativePath === "CHANGELOG.md" ||
    packageRelativePath === "README.md" ||
    packageRelativePath.startsWith("docs/") ||
    packageRelativePath === "tsconfig.test.json" ||
    isTestOrStoryFile(normalized)
  ) {
    return false;
  }

  return (
    packageRelativePath === "package.json" ||
    packageRelativePath === "styles.css" ||
    packageRelativePath === "tsconfig.json" ||
    /^tsup\.config\.[cm]?[jt]s$/.test(packageRelativePath) ||
    packageRelativePath.startsWith("src/")
  );
}

function isSharedBuildImpactFile(filePath) {
  const normalized = normalizeFilePath(filePath);
  return SHARED_BUILD_IMPACT_PATTERNS.some((pattern) => pattern.test(normalized));
}

export function hasSkipMarker(text = "") {
  return SKIP_MARKER_PATTERNS.some((pattern) => pattern.test(text));
}

export function getPublishImpactFiles(changedFiles) {
  return changedFiles
    .map(normalizeFilePath)
    .filter((filePath) => !isChangesetFile(filePath))
    .filter(
      (filePath) =>
        isPackagePublishImpactFile(filePath) || isSharedBuildImpactFile(filePath),
    );
}

export function assessChangelogDiscipline({
  changedFiles,
  pullRequestBody = "",
}) {
  const normalizedFiles = changedFiles.map(normalizeFilePath);
  const impactedFiles = getPublishImpactFiles(normalizedFiles);

  if (impactedFiles.length === 0) {
    return { ok: true, reason: "no-publish-impact", impactedFiles };
  }

  if (normalizedFiles.some(isChangesetFile)) {
    return { ok: true, reason: "changeset-present", impactedFiles };
  }

  if (hasSkipMarker(pullRequestBody)) {
    return { ok: true, reason: "skip-marker", impactedFiles };
  }

  return { ok: false, reason: "missing-changeset", impactedFiles };
}

function getTopChangelogVersion(changelog) {
  return changelog.match(/^##\s+([^\s]+)/m)?.[1] ?? null;
}

export function validateCurrentChangelogs(packages) {
  return packages.flatMap(({ name, version, changelog }) => {
    const topVersion = getTopChangelogVersion(changelog);

    if (topVersion === version) {
      return [];
    }

    return [
      `${name}: package.json is ${version} but CHANGELOG.md starts at ${
        topVersion ?? "no version"
      }`,
    ];
  });
}

function readWorkspacePackageChangelogs() {
  const packagesDir = path.join(process.cwd(), "packages");

  return readdirSync(packagesDir)
    .sort()
    .flatMap((dir) => {
      const packageJsonPath = path.join(packagesDir, dir, "package.json");
      const changelogPath = path.join(packagesDir, dir, "CHANGELOG.md");

      if (!existsSync(packageJsonPath) || !existsSync(changelogPath)) {
        return [];
      }

      const manifest = JSON.parse(readFileSync(packageJsonPath, "utf8"));
      return [
        {
          name: manifest.name ?? dir,
          version: manifest.version,
          changelog: readFileSync(changelogPath, "utf8"),
        },
      ];
    });
}

function readPullRequestBody() {
  if (process.env.CHANGELOG_PR_BODY) {
    return process.env.CHANGELOG_PR_BODY;
  }

  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath || !existsSync(eventPath)) {
    return "";
  }

  const event = JSON.parse(readFileSync(eventPath, "utf8"));
  return event.pull_request?.body ?? "";
}

export function mergeChangedFiles(...fileLists) {
  return [
    ...new Set(
      fileLists
        .flat()
        .map((filePath) => filePath.trim())
        .filter(Boolean)
        .map(normalizeFilePath),
    ),
  ];
}

function readGitChangedFiles(args) {
  const output = execFileSync("git", args, {
    encoding: "utf8",
  });

  return output.split("\n");
}

function getChangedFiles() {
  const baseRef =
    process.env.CHANGELOG_BASE_REF ||
    (process.env.GITHUB_BASE_REF ? `origin/${process.env.GITHUB_BASE_REF}` : "origin/main");
  const diffRange = `${baseRef}...HEAD`;
  const branchFiles = readGitChangedFiles(["diff", "--name-only", diffRange]);
  const stagedFiles = readGitChangedFiles([
    "diff",
    "--cached",
    "--name-only",
    "--diff-filter=ACMR",
  ]);

  return mergeChangedFiles(branchFiles, stagedFiles);
}

function printFailure(result) {
  console.error("Changelog discipline check failed.");
  console.error("");
  console.error(
    "Published package or shared build-output files changed without a changeset.",
  );
  console.error("");
  console.error("Add one of:");
  console.error("- A `.changeset/*.md` file from `yarn changeset`.");
  console.error(
    "- A PR-body exception such as `Changelog: skip - docs-only/internal-only change.`",
  );
  console.error("");
  console.error("Files that triggered the check:");
  for (const filePath of result.impactedFiles) {
    console.error(`- ${filePath}`);
  }
}

function printChangelogVersionFailures(failures) {
  console.error("Current changelog check failed.");
  console.error("");
  console.error("Each package CHANGELOG.md must start with its package.json version.");
  console.error("");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
}

function runCli() {
  const changelogVersionFailures = validateCurrentChangelogs(
    readWorkspacePackageChangelogs(),
  );

  if (changelogVersionFailures.length > 0) {
    printChangelogVersionFailures(changelogVersionFailures);
    process.exit(1);
  }

  const changedFiles = getChangedFiles();
  const result = assessChangelogDiscipline({
    changedFiles,
    pullRequestBody: readPullRequestBody(),
  });

  if (!result.ok) {
    printFailure(result);
    process.exit(1);
  }

  if (result.reason === "no-publish-impact") {
    console.log("No publish-impacting package changes detected.");
    return;
  }

  if (result.reason === "changeset-present") {
    console.log("Changeset present for publish-impacting package changes.");
    return;
  }

  console.log("Changelog skip marker present for publish-impacting package changes.");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runCli();
}
