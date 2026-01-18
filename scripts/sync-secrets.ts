#!/usr/bin/env npx tsx
/**
 * Sync Secrets - Centralized secrets sync to GitHub Actions and Render
 *
 * Configuration: Add to your project's package.json:
 * {
 *   "syncSecrets": {
 *     "repo": "caffeinebounce/your-repo",
 *     "prodUrls": {
 *       "NEXT_PUBLIC_SITE_URL": "https://yoursite.com",
 *       "NEXT_PUBLIC_APP_URL": "https://app.yoursite.com"
 *     }
 *   }
 * }
 *
 * Usage:
 *   npx tsx path/to/sync-secrets.ts [options]
 *
 * Options:
 *   --github    Sync only to GitHub
 *   --render    Sync only to Render
 *   --check     Check if secrets are in sync (no changes made)
 *   --verbose   Show detailed output
 *   --help      Show help
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

// ─── Types ───────────────────────────────────────────────────────────────────

interface EnvConfig {
  [key: string]: string;
}

interface SyncSecretsConfig {
  repo: string;
  prodUrls?: Record<string, string>;
}

interface SyncResult {
  provider: string;
  added: string[];
  updated: string[];
  deleted: string[];
  errors: string[];
}

interface Options {
  github: boolean;
  render: boolean;
  checkOnly: boolean;
  verbose: boolean;
}

// ─── Configuration Loading ──────────────────────────────────────────────────

function loadConfig(rootDir: string): SyncSecretsConfig {
  // Try package.json first
  const packageJsonPath = path.join(rootDir, "package.json");
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
    if (packageJson.syncSecrets) {
      return packageJson.syncSecrets;
    }
  }

  // Try .sync-secrets.json
  const configPath = path.join(rootDir, ".sync-secrets.json");
  if (fs.existsSync(configPath)) {
    return JSON.parse(fs.readFileSync(configPath, "utf-8"));
  }

  // Fallback to environment variables
  const repo = process.env.GITHUB_REPOSITORY || process.env.GITHUB_REPO;
  if (repo) {
    return { repo };
  }

  throw new Error(
    'No sync-secrets config found. Add "syncSecrets" to package.json or create .sync-secrets.json'
  );
}

// ─── Environment Parsing ─────────────────────────────────────────────────────

function parseEnvFile(filePath: string): EnvConfig {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const content = fs.readFileSync(filePath, "utf-8");
  const config: EnvConfig = {};

  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;

    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!value || value.includes("your_") || value.includes("example")) {
      continue;
    }

    config[key] = value;
  }

  return config;
}

function findEnvFiles(rootDir: string): { path: string; prefix: string }[] {
  const envFiles: { path: string; prefix: string }[] = [];

  // Check for .env.local in apps/web (monorepo pattern)
  const webEnvLocal = path.join(rootDir, "apps/web/.env.local");
  if (fs.existsSync(webEnvLocal)) {
    envFiles.push({ path: webEnvLocal, prefix: "" });
  }

  // Fallback to apps/web/.env
  const webEnv = path.join(rootDir, "apps/web/.env");
  if (fs.existsSync(webEnv) && !fs.existsSync(webEnvLocal)) {
    envFiles.push({ path: webEnv, prefix: "" });
  }

  // Check root .env
  const rootEnv = path.join(rootDir, ".env");
  if (fs.existsSync(rootEnv)) {
    envFiles.push({ path: rootEnv, prefix: "" });
  }

  return envFiles;
}

function mergeEnvConfigs(
  envFiles: { path: string; prefix: string }[]
): EnvConfig {
  const merged: EnvConfig = {};

  for (const { path: filePath, prefix } of envFiles) {
    const config = parseEnvFile(filePath);
    for (const [key, value] of Object.entries(config)) {
      const isSkipped = key.startsWith("RENDER_") || key === "GH_TOKEN";
      if (isSkipped) continue;
      merged[`${prefix}${key}`] = value;
    }
  }

  return merged;
}

function getProductionSecrets(
  envFiles: { path: string; prefix: string }[],
  prodUrls: Record<string, string> = {}
): EnvConfig {
  const allVars: EnvConfig = {};
  const prodVars: EnvConfig = {};

  for (const { path: filePath } of envFiles) {
    const config = parseEnvFile(filePath);
    for (const [key, value] of Object.entries(config)) {
      if (key.startsWith("PROD_")) {
        const actualKey = key.replace(/^PROD_/, "");
        prodVars[actualKey] = value;
      } else if (key.startsWith("DEV_")) {
        continue;
      } else if (
        !key.startsWith("RENDER_") &&
        !key.startsWith("TARGET_ENV") &&
        key !== "GH_TOKEN"
      ) {
        allVars[key] = value;
      }
    }
  }

  const merged: EnvConfig = { ...allVars, ...prodVars };

  // Apply production URLs from config
  for (const [key, value] of Object.entries(prodUrls)) {
    merged[key] = value;
  }

  return merged;
}

// ─── GitHub Secrets Provider ─────────────────────────────────────────────────

let sodiumInstance: any = null;

async function initSodium() {
  if (sodiumInstance) return sodiumInstance;

  try {
    const sodium = require("libsodium-wrappers");
    await sodium.ready;
    sodiumInstance = sodium;
    return sodiumInstance;
  } catch (error) {
    console.error("Failed to initialize libsodium:", error);
    throw new Error(
      "Failed to load libsodium-wrappers. Run: yarn add -D libsodium-wrappers"
    );
  }
}

async function encryptSecretForGitHub(
  publicKey: string,
  secretValue: string
): Promise<string> {
  const sodium = await initSodium();
  const keyBytes = sodium.from_base64(publicKey, sodium.base64_variants.ORIGINAL);
  const messageBytes = sodium.from_string(secretValue);
  const encryptedBytes = sodium.crypto_box_seal(messageBytes, keyBytes);
  return sodium.to_base64(encryptedBytes, sodium.base64_variants.ORIGINAL);
}

async function syncToGitHub(
  secrets: EnvConfig,
  repo: string,
  options: Options
): Promise<SyncResult> {
  const result: SyncResult = {
    provider: "GitHub",
    added: [],
    updated: [],
    deleted: [],
    errors: [],
  };

  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (!token) {
    result.errors.push("GITHUB_TOKEN not set");
    return result;
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  try {
    const [keyResponse, secretsResponse] = await Promise.all([
      fetch(`https://api.github.com/repos/${repo}/actions/secrets/public-key`, {
        headers,
      }),
      fetch(`https://api.github.com/repos/${repo}/actions/secrets`, {
        headers,
      }),
    ]);

    if (!keyResponse.ok) {
      result.errors.push(`Failed to fetch public key: ${keyResponse.status}`);
      return result;
    }

    if (!secretsResponse.ok) {
      result.errors.push(
        `Failed to fetch existing secrets: ${secretsResponse.status}`
      );
      return result;
    }

    const { key: publicKey, key_id: keyId } = (await keyResponse.json()) as {
      key: string;
      key_id: string;
    };
    const existingSecrets = (
      (await secretsResponse.json()) as { secrets: { name: string }[] }
    ).secrets.map((s) => s.name);

    const existingSet = new Set(existingSecrets);
    const desiredSet = new Set(Object.keys(secrets));

    if (options.checkOnly) {
      for (const key of Object.keys(secrets)) {
        if (!existingSet.has(key)) {
          result.added.push(key);
        } else {
          result.updated.push(key);
        }
      }
      for (const key of existingSecrets) {
        if (!desiredSet.has(key)) {
          result.deleted.push(key);
        }
      }
      return result;
    }

    const encryptionPromises = Object.entries(secrets).map(
      async ([name, value]) => ({
        name,
        encrypted: await encryptSecretForGitHub(publicKey, value),
      })
    );
    const encryptedSecrets = await Promise.all(encryptionPromises);

    const updatePromises = encryptedSecrets.map(async ({ name, encrypted }) => {
      const response = await fetch(
        `https://api.github.com/repos/${repo}/actions/secrets/${name}`,
        {
          method: "PUT",
          headers: { ...headers, "Content-Type": "application/json" },
          body: JSON.stringify({ encrypted_value: encrypted, key_id: keyId }),
        }
      );

      if (response.ok) {
        if (existingSet.has(name)) {
          result.updated.push(name);
        } else {
          result.added.push(name);
        }
      } else {
        result.errors.push(`Failed to update ${name}: ${response.status}`);
      }
    });

    const deletePromises = existingSecrets
      .filter((name) => !desiredSet.has(name))
      .map(async (name) => {
        const response = await fetch(
          `https://api.github.com/repos/${repo}/actions/secrets/${name}`,
          { method: "DELETE", headers }
        );

        if (response.ok) {
          result.deleted.push(name);
        } else {
          result.errors.push(`Failed to delete ${name}: ${response.status}`);
        }
      });

    await Promise.all([...updatePromises, ...deletePromises]);
  } catch (error) {
    result.errors.push(error instanceof Error ? error.message : String(error));
  }

  return result;
}

// ─── Render Secrets Provider ─────────────────────────────────────────────────

async function syncToRender(
  secrets: EnvConfig,
  options: Options
): Promise<SyncResult> {
  const result: SyncResult = {
    provider: "Render",
    added: [],
    updated: [],
    deleted: [],
    errors: [],
  };

  const apiKey = process.env.RENDER_API_KEY;
  const serviceId = process.env.RENDER_SERVICE_ID;

  if (!apiKey) {
    result.errors.push("RENDER_API_KEY not set");
    return result;
  }

  if (!serviceId) {
    result.errors.push("RENDER_SERVICE_ID not set");
    return result;
  }

  const headers = {
    Authorization: `Bearer ${apiKey}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  try {
    const existingResponse = await fetch(
      `https://api.render.com/v1/services/${serviceId}/env-vars`,
      { headers }
    );

    if (!existingResponse.ok) {
      result.errors.push(
        `Failed to fetch existing env vars: ${existingResponse.status}`
      );
      return result;
    }

    const existingVars = (await existingResponse.json()) as {
      envVar: { key: string; value: string };
    }[];
    const existingMap = new Map(
      existingVars.map((v) => [v.envVar.key, v.envVar.value])
    );

    for (const [key, value] of Object.entries(secrets)) {
      const existing = existingMap.get(key);
      if (existing === undefined) {
        result.added.push(key);
      } else if (existing !== value) {
        result.updated.push(key);
      }
      existingMap.delete(key);
    }

    for (const key of Array.from(existingMap.keys())) {
      if (key && key.trim()) {
        result.deleted.push(key);
      }
    }

    if (options.checkOnly) {
      return result;
    }

    const allVars = Object.entries(secrets).map(([key, value]) => ({
      key,
      value,
    }));

    const updateResponse = await fetch(
      `https://api.render.com/v1/services/${serviceId}/env-vars`,
      {
        method: "PUT",
        headers,
        body: JSON.stringify(allVars),
      }
    );

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      result.errors.push(`Failed to update env vars: ${errorText}`);
    }
  } catch (error) {
    result.errors.push(error instanceof Error ? error.message : String(error));
  }

  return result;
}

// ─── Main ────────────────────────────────────────────────────────────────────

function parseArgs(): Options {
  const args = new Set(process.argv.slice(2));

  if (args.has("--help") || args.has("-h")) {
    console.log(`
Sync Secrets - Centralized secrets synchronization

Usage: npx tsx sync-secrets.ts [options]

Options:
  --github    Sync only to GitHub Actions secrets
  --render    Sync only to Render environment variables
  --check     Check what would change (dry run)
  --verbose   Show detailed output
  --help      Show this help message

Configuration (in package.json):
  {
    "syncSecrets": {
      "repo": "owner/repo",
      "prodUrls": {
        "NEXT_PUBLIC_SITE_URL": "https://yoursite.com"
      }
    }
  }

Environment Variables Required:
  GITHUB_TOKEN or GH_TOKEN    GitHub personal access token
  RENDER_API_KEY              Render API key
  RENDER_SERVICE_ID           Render service ID
`);
    process.exit(0);
  }

  return {
    github: args.has("--github") || (!args.has("--render") && !args.has("--github")),
    render: args.has("--render") || (!args.has("--render") && !args.has("--github")),
    checkOnly: args.has("--check") || args.has("--dry-run"),
    verbose: args.has("--verbose") || args.has("-v"),
  };
}

function printResult(result: SyncResult, verbose: boolean): void {
  const total = result.added.length + result.updated.length + result.deleted.length;
  const providerPad = result.provider.padEnd(8);

  if (result.errors.length > 0) {
    console.log(`  ❌ ${providerPad} Failed`);
    for (const error of result.errors.slice(0, 3)) {
      console.log(`               └─ ${error}`);
    }
    if (result.errors.length > 3) {
      console.log(`               └─ ... and ${result.errors.length - 3} more errors`);
    }
    return;
  }

  if (total === 0) {
    console.log(`  ✅ ${providerPad} Already in sync`);
    return;
  }

  const parts: string[] = [];
  if (result.added.length > 0) parts.push(`${result.added.length} added`);
  if (result.updated.length > 0) parts.push(`${result.updated.length} updated`);
  if (result.deleted.length > 0) parts.push(`${result.deleted.length} deleted`);

  console.log(`  ✅ ${providerPad} ${parts.join(", ")}`);

  if (verbose) {
    const formatKeys = (keys: string[], maxShow = 5): string => {
      if (keys.length <= maxShow) return keys.join(", ");
      return `${keys.slice(0, maxShow).join(", ")} +${keys.length - maxShow} more`;
    };

    if (result.added.length > 0) {
      console.log(`               ➕ ${formatKeys(result.added)}`);
    }
    if (result.updated.length > 0) {
      console.log(`               🔄 ${formatKeys(result.updated)}`);
    }
    if (result.deleted.length > 0) {
      console.log(`               🗑️  ${formatKeys(result.deleted)}`);
    }
  }
}

async function main(): Promise<void> {
  const startTime = Date.now();
  const options = parseArgs();

  // Find project root (where package.json with workspaces or turbo.json is)
  let rootDir = process.cwd();
  while (
    !fs.existsSync(path.join(rootDir, "turbo.json")) &&
    !fs.existsSync(path.join(rootDir, "package.json"))
  ) {
    const parent = path.dirname(rootDir);
    if (parent === rootDir) {
      console.error("Could not find project root");
      process.exit(1);
    }
    rootDir = parent;
  }

  // Prefer turbo.json location for monorepos
  let searchDir = rootDir;
  while (!fs.existsSync(path.join(searchDir, "turbo.json"))) {
    const parent = path.dirname(searchDir);
    if (parent === searchDir) break;
    searchDir = parent;
  }
  if (fs.existsSync(path.join(searchDir, "turbo.json"))) {
    rootDir = searchDir;
  }

  // Load configuration
  const config = loadConfig(rootDir);

  // Load env files for credentials
  const rootEnvPath = path.join(rootDir, ".env");
  if (fs.existsSync(rootEnvPath)) {
    const rootEnv = parseEnvFile(rootEnvPath);
    for (const [key, value] of Object.entries(rootEnv)) {
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  }

  const webEnvLocalPath = path.join(rootDir, "apps/web/.env.local");
  if (fs.existsSync(webEnvLocalPath)) {
    const webEnv = parseEnvFile(webEnvLocalPath);
    for (const [key, value] of Object.entries(webEnv)) {
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  }

  const envFiles = findEnvFiles(rootDir);

  if (envFiles.length === 0) {
    console.log("No .env files found to sync");
    process.exit(0);
  }

  const devSecrets = mergeEnvConfigs(envFiles);
  const prodSecrets = getProductionSecrets(envFiles, config.prodUrls);

  const secretCount = Object.keys(devSecrets).length;
  const prodSecretCount = Object.keys(prodSecrets).length;

  if (secretCount === 0 && prodSecretCount === 0) {
    console.log("No secrets to sync (all values are empty or placeholders)");
    process.exit(0);
  }

  if (options.verbose) {
    console.log(`  📁 Source: ${envFiles.map((f) => path.relative(rootDir, f.path)).join(", ")}`);
    console.log(`  🔧 Repo: ${config.repo}`);
    console.log(`  🔑 Dev secrets (GitHub): ${secretCount} variables`);
    console.log(`  🔑 Prod secrets (Render): ${prodSecretCount} variables\n`);
  }

  const mode = options.checkOnly ? "Checking" : "Syncing";
  const providers: string[] = [];
  if (options.github) providers.push("GitHub");
  if (options.render) providers.push("Render");

  console.log(`${options.checkOnly ? "🔍" : "🚀"} ${mode} secrets → ${providers.join(", ")}\n`);

  const syncPromises: Promise<SyncResult>[] = [];

  if (options.github) {
    syncPromises.push(syncToGitHub(devSecrets, config.repo, options));
  }

  if (options.render) {
    syncPromises.push(syncToRender(prodSecrets, options));
  }

  const results = await Promise.all(syncPromises);

  for (const result of results) {
    printResult(result, options.verbose);
  }

  const duration = Date.now() - startTime;
  const hasErrors = results.some((r) => r.errors.length > 0);
  const totalSynced = results.reduce(
    (acc, r) => acc + r.added.length + r.updated.length,
    0
  );

  console.log("");
  if (hasErrors) {
    console.log(`⚠️  Completed with errors in ${duration}ms`);
  } else if (options.checkOnly) {
    console.log(`✨ Check complete in ${duration}ms`);
  } else {
    console.log(`✨ Synced ${totalSynced} secrets in ${duration}ms`);
  }

  process.exit(hasErrors ? 1 : 0);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
