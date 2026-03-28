import { describe, expect, it, vi } from "vitest";
import {
  createBackupCodesDownloadContent,
  downloadBackupCodesFile,
} from "./backup-code-download";

describe("createBackupCodesDownloadContent", () => {
  it("formats backup codes with the shared export content", () => {
    const generatedAt = new Date("2026-03-28T12:34:56Z");
    const codes = ["ABCD-EFGH", "IJKL-MNOP"];

    expect(createBackupCodesDownloadContent(codes, generatedAt)).toBe(
      `Compass Backup Codes\n${"-".repeat(30)}\n\nKeep these codes in a safe place.\nEach code can only be used once.\n\nABCD-EFGH\nIJKL-MNOP\n\nGenerated: ${generatedAt.toLocaleString()}`,
    );
  });
});

describe("downloadBackupCodesFile", () => {
  it("creates and downloads the shared backup code file", async () => {
    const generatedAt = new Date("2026-03-28T12:34:56Z");
    const codes = ["ABCD-EFGH", "IJKL-MNOP"];
    const anchor = {
      href: "",
      download: "",
      click: vi.fn(),
    } as unknown as HTMLAnchorElement;
    const appendChild = vi.fn();
    const removeChild = vi.fn();
    const createElement = vi.fn(() => anchor);
    const createObjectURL = vi.fn((_blob: Blob) => "blob:backup-codes");
    const revokeObjectURL = vi.fn();

    downloadBackupCodesFile(codes, {
      generatedAt,
      documentRef: {
        createElement: createElement as unknown as Document["createElement"],
        body: {
          appendChild,
          removeChild,
        },
      },
      urlRef: {
        createObjectURL,
        revokeObjectURL,
      },
    });

    expect(createElement).toHaveBeenCalledWith("a");
    expect(appendChild).toHaveBeenCalledWith(anchor);
    expect(anchor.href).toBe("blob:backup-codes");
    expect(anchor.download).toBe("compass-backup-codes.txt");
    expect(anchor.click).toHaveBeenCalledOnce();
    expect(removeChild).toHaveBeenCalledWith(anchor);
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:backup-codes");

    const [blob] = createObjectURL.mock.calls[0] ?? [];
    if (!(blob instanceof Blob)) {
      throw new Error("Expected a backup code blob to be created");
    }

    await expect(blob.text()).resolves.toBe(
      createBackupCodesDownloadContent(codes, generatedAt),
    );
  });
});
