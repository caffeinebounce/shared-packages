const BACKUP_CODES_FILE_NAME = "compass-backup-codes.txt";

interface BackupCodesDownloadOptions {
  generatedAt?: Date;
  documentRef?: Pick<Document, "createElement"> & {
    body: Pick<Node, "appendChild" | "removeChild">;
  };
  urlRef?: Pick<typeof URL, "createObjectURL" | "revokeObjectURL">;
}

export function createBackupCodesDownloadContent(
  codes: string[],
  generatedAt = new Date(),
): string {
  return [
    "Compass Backup Codes",
    "-".repeat(30),
    "",
    "Keep these codes in a safe place.",
    "Each code can only be used once.",
    "",
    ...codes,
    "",
    `Generated: ${generatedAt.toLocaleString()}`,
  ].join("\n");
}

export function downloadBackupCodesFile(
  codes: string[],
  {
    generatedAt = new Date(),
    documentRef = document,
    urlRef = URL,
  }: BackupCodesDownloadOptions = {},
): void {
  const content = createBackupCodesDownloadContent(codes, generatedAt);
  const blob = new Blob([content], { type: "text/plain" });
  const url = urlRef.createObjectURL(blob);
  const anchor = documentRef.createElement("a");
  anchor.href = url;
  anchor.download = BACKUP_CODES_FILE_NAME;
  documentRef.body.appendChild(anchor);
  anchor.click();
  documentRef.body.removeChild(anchor);
  urlRef.revokeObjectURL(url);
}
