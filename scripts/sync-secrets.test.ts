import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it, vi } from "vitest";
import { parseArgs, syncToGitHub, syncToRender } from "./sync-secrets";

const __dirname = dirname(fileURLToPath(import.meta.url));
const scriptPath = resolve(__dirname, "sync-secrets.ts");

describe("sync-secrets CLI safety", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("guards CLI execution so importing the module is safe", () => {
    const source = readFileSync(scriptPath, "utf8");

    expect(source).toContain("pathToFileURL");
    expect(source).toContain("export function parseArgs");
    expect(source).toContain("isDirectExecution");
  });

  it("parses provider, dry-run, and prune options", () => {
    expect(parseArgs([])).toMatchObject({
      github: true,
      render: true,
      checkOnly: false,
      prune: false,
    });

    expect(parseArgs(["--dry-run", "--prune", "--github"])).toMatchObject({
      github: true,
      render: false,
      checkOnly: true,
      prune: true,
    });
  });

  it("updates GitHub secrets without deleting remote-only secrets by default", async () => {
    vi.stubEnv("GITHUB_TOKEN", "token-for-test");
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ key: "public-key", key_id: "key-id" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          secrets: [{ name: "DESIRED_ONE" }, { name: "EXISTING_ONLY" }],
        }),
      })
      .mockResolvedValueOnce({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    const result = await syncToGitHub(
      { DESIRED_ONE: "redacted-value" },
      "caffeinebounce/shared-packages",
      {
        github: true,
        render: false,
        checkOnly: false,
        verbose: false,
        prune: false,
        encryptSecret: async () => "encrypted-value",
      }
    );

    expect(result.deleted).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalledWith(
      expect.stringContaining("/EXISTING_ONLY"),
      expect.objectContaining({ method: "DELETE" })
    );
  });

  it("deletes remote-only GitHub secrets when prune is enabled", async () => {
    vi.stubEnv("GITHUB_TOKEN", "token-for-test");
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ key: "public-key", key_id: "key-id" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          secrets: [{ name: "DESIRED_ONE" }, { name: "EXISTING_ONLY" }],
        }),
      })
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    const result = await syncToGitHub(
      { DESIRED_ONE: "redacted-value" },
      "caffeinebounce/shared-packages",
      {
        github: true,
        render: false,
        checkOnly: false,
        verbose: false,
        prune: true,
        encryptSecret: async () => "encrypted-value",
      }
    );

    expect(result.deleted).toEqual(["EXISTING_ONLY"]);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/EXISTING_ONLY"),
      expect.objectContaining({ method: "DELETE" })
    );
  });

  it("preserves remote-only Render env vars by default", async () => {
    vi.stubEnv("RENDER_API_KEY", "render-token");
    vi.stubEnv("RENDER_SERVICE_ID", "service-id");
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { envVar: { key: "DESIRED_ONE", value: "old-value" } },
          { envVar: { key: "EXISTING_ONLY", value: "keep-value" } },
        ],
      })
      .mockResolvedValueOnce({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    const result = await syncToRender(
      { DESIRED_ONE: "redacted-value" },
      {
        github: false,
        render: true,
        checkOnly: false,
        verbose: false,
        prune: false,
      }
    );

    const putBody = JSON.parse(fetchMock.mock.calls[1][1].body as string);

    expect(result.deleted).toEqual([]);
    expect(putBody).toEqual(
      expect.arrayContaining([
        { key: "DESIRED_ONE", value: "redacted-value" },
        { key: "EXISTING_ONLY", value: "keep-value" },
      ])
    );
  });

  it("omits remote-only Render env vars when prune is enabled", async () => {
    vi.stubEnv("RENDER_API_KEY", "render-token");
    vi.stubEnv("RENDER_SERVICE_ID", "service-id");
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { envVar: { key: "DESIRED_ONE", value: "old-value" } },
          { envVar: { key: "EXISTING_ONLY", value: "remove-value" } },
        ],
      })
      .mockResolvedValueOnce({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    const result = await syncToRender(
      { DESIRED_ONE: "redacted-value" },
      {
        github: false,
        render: true,
        checkOnly: false,
        verbose: false,
        prune: true,
      }
    );

    const putBody = JSON.parse(fetchMock.mock.calls[1][1].body as string);

    expect(result.deleted).toEqual(["EXISTING_ONLY"]);
    expect(putBody).toEqual([{ key: "DESIRED_ONE", value: "redacted-value" }]);
  });
});
