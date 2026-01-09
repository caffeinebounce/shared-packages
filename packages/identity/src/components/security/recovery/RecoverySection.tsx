"use client";

import { formatDate } from "@caffeinebounce/shared-utils";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@caffeinebounce/ui";
import {
  AlertTriangle,
  Check,
  Copy,
  Download,
  Info,
  Loader2,
  Mail,
  Shield,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { CreateClientFn } from "../../../types";
import { generateRecoveryCodes } from "../../../utils";
import { ConfirmAccessDialog, type MFAFactor } from "../ConfirmAccessDialog";

export interface RecoverySectionProps {
  /** Function to create a Supabase client */
  createClient: CreateClientFn;
}

/**
 * Check if a date is more than 1 year old
 */
function isOlderThanOneYear(date: Date): boolean {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  return date < oneYearAgo;
}

/**
 * RecoverySection - Manage account recovery options
 *
 * Displays recovery methods like backup codes. Only shows backup codes
 * if the user has MFA enabled.
 */
export function RecoverySection({ createClient }: RecoverySectionProps) {
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [showMfaConfirm, setShowMfaConfirm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasMFAEnabled, setHasMFAEnabled] = useState(false);
  const [mfaFactor, setMfaFactor] = useState<MFAFactor | null>(null);
  const [backupCodesGeneratedAt, setBackupCodesGeneratedAt] =
    useState<Date | null>(null);
  const [recoveryEmail, setRecoveryEmail] = useState<string | null>(null);
  const [showRecoveryEmailDialog, setShowRecoveryEmailDialog] = useState(false);
  const [showMfaForEmail, setShowMfaForEmail] = useState(false);

  const loadMFAStatus = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;

      const verifiedFactors = [
        ...(data.totp || []),
        ...(data.phone || []),
      ].filter((f) => f.status === "verified");

      setHasMFAEnabled(verifiedFactors.length > 0);

      // Store first verified factor for MFA confirmation
      if (verifiedFactors.length > 0) {
        const factor = verifiedFactors[0];
        setMfaFactor({
          id: factor.id,
          type: factor.factor_type as "totp" | "phone",
        });
      }

      // Fetch security timestamps
      const response = await fetch("/api/profile/security-timestamps");
      if (response.ok) {
        const timestamps = await response.json();
        if (timestamps.backupCodesGeneratedAt) {
          setBackupCodesGeneratedAt(
            new Date(timestamps.backupCodesGeneratedAt),
          );
        }
      }

      // Fetch recovery email
      const emailResponse = await fetch("/api/profile/recovery-email");
      if (emailResponse.ok) {
        const emailData = await emailResponse.json();
        setRecoveryEmail(emailData.recoveryEmail);
      }
    } catch (error) {
      console.error("Error loading MFA status:", error);
    } finally {
      setLoading(false);
    }
  }, [createClient]);

  const handleCodesGenerated = useCallback(() => {
    setBackupCodesGeneratedAt(new Date());
  }, []);

  const handleBackupCodesClick = useCallback(() => {
    // Always require MFA confirmation before generating/refreshing backup codes
    if (mfaFactor) {
      setShowMfaConfirm(true);
    } else {
      // Fallback if somehow no MFA factor (shouldn't happen since we check hasMFAEnabled)
      setShowBackupCodes(true);
    }
  }, [mfaFactor]);

  const handleMfaConfirm = useCallback(() => {
    setShowMfaConfirm(false);
    setShowBackupCodes(true);
  }, []);

  const handleRecoveryEmailClick = useCallback(() => {
    // Require MFA confirmation before changing recovery email
    if (mfaFactor) {
      setShowMfaForEmail(true);
    } else {
      setShowRecoveryEmailDialog(true);
    }
  }, [mfaFactor]);

  const handleMfaConfirmForEmail = useCallback(() => {
    setShowMfaForEmail(false);
    setShowRecoveryEmailDialog(true);
  }, []);

  const handleRecoveryEmailSaved = useCallback((email: string | null) => {
    setRecoveryEmail(email);
    setShowRecoveryEmailDialog(false);
  }, []);

  useEffect(() => {
    loadMFAStatus();
  }, [loadMFAStatus]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!hasMFAEnabled) {
    return (
      <div className="rounded-lg border border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
            <Shield className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <span className="font-medium">Recovery Options</span>
            <p className="text-sm text-muted-foreground">
              Enable 2FA to access backup codes
            </p>
          </div>
        </div>
      </div>
    );
  }

  const codesAreOld =
    backupCodesGeneratedAt && isOlderThanOneYear(backupCodesGeneratedAt);

  return (
    <>
      <div className="rounded-lg border border-border divide-y divide-border">
        {/* Recovery Email */}
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                <Mail className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-medium">Recovery Email</span>
                  {!recoveryEmail && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        Add a recovery email to regain access if you lose your
                        authenticator.
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {recoveryEmail || "Not set"}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRecoveryEmailClick}
            >
              {recoveryEmail ? "Change" : "Add"}
            </Button>
          </div>
        </div>

        {/* Backup Codes */}
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${codesAreOld ? "bg-amber-100 dark:bg-amber-950" : "bg-muted"}`}
              >
                {codesAreOld ? (
                  <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                ) : (
                  <Shield className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <div>
                <span className="font-medium">Backup Codes</span>
                {backupCodesGeneratedAt && (
                  <p
                    className={`text-sm ${codesAreOld ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"}`}
                  >
                    Last generated: {formatDate(backupCodesGeneratedAt)}
                  </p>
                )}
              </div>
            </div>
            <Button
              variant={codesAreOld ? "default" : "outline"}
              size="sm"
              onClick={handleBackupCodesClick}
            >
              {codesAreOld
                ? "Regenerate"
                : backupCodesGeneratedAt
                  ? "Refresh"
                  : "Generate"}
            </Button>
          </div>
          {codesAreOld && (
            <div className="mt-3 rounded-md bg-amber-50 dark:bg-amber-950/50 p-3 text-sm text-amber-800 dark:text-amber-200">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>
                  Your backup codes are over a year old. We recommend generating
                  new ones for better security.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MFA Confirmation Dialog */}
      <ConfirmAccessDialog
        createClient={createClient}
        open={showMfaConfirm}
        onOpenChange={(open) => {
          if (!open) {
            setShowMfaConfirm(false);
          }
        }}
        onConfirm={handleMfaConfirm}
        verificationMethod="mfa"
        mfaFactor={mfaFactor}
        title="Confirm Access"
        description="Verify your identity to manage backup codes."
        confirmText="Continue"
      />

      {/* MFA Confirmation Dialog for Recovery Email */}
      <ConfirmAccessDialog
        createClient={createClient}
        open={showMfaForEmail}
        onOpenChange={(open) => {
          if (!open) {
            setShowMfaForEmail(false);
          }
        }}
        onConfirm={handleMfaConfirmForEmail}
        verificationMethod="mfa"
        mfaFactor={mfaFactor}
        title="Confirm Access"
        description="Verify your identity to manage your recovery email."
        confirmText="Continue"
      />

      {/* Recovery Email Dialog */}
      <RecoveryEmailDialog
        open={showRecoveryEmailDialog}
        onOpenChange={setShowRecoveryEmailDialog}
        currentEmail={recoveryEmail}
        onSaved={handleRecoveryEmailSaved}
      />

      {/* Backup Codes Dialog */}
      <BackupCodesDialog
        open={showBackupCodes}
        onOpenChange={setShowBackupCodes}
        onCodesGenerated={handleCodesGenerated}
      />
    </>
  );
}

// Backup Codes Dialog
function BackupCodesDialog({
  open,
  onOpenChange,
  onCodesGenerated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCodesGenerated?: () => void;
}) {
  const [codes, setCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [error, setError] = useState("");

  // User can close dialog only after copying or downloading
  const canClose = copied || downloaded;

  const generateCodes = async () => {
    setLoading(true);
    setError("");
    setCopied(false);
    setDownloaded(false);
    try {
      const newCodes = generateRecoveryCodes(10);

      // Store recovery codes in database
      const response = await fetch("/api/mfa/recovery/generate-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codes: newCodes }),
      });

      if (!response.ok) {
        throw new Error("Failed to store recovery codes");
      }

      setCodes(newCodes);
      onCodesGenerated?.();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to generate codes";
      console.error("Error generating codes:", errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const copyAllCodes = () => {
    navigator.clipboard.writeText(codes.join("\n"));
    setCopied(true);
  };

  const downloadCodes = () => {
    const content = `Compass Backup Codes\n${"-".repeat(30)}\n\nKeep these codes in a safe place.\nEach code can only be used once.\n\n${codes.join("\n")}\n\nGenerated: ${new Date().toLocaleString()}`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "compass-backup-codes.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloaded(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-[340px] sm:max-w-md">
        <DialogHeader className="text-left">
          <DialogTitle>Backup Codes</DialogTitle>
          <DialogDescription className="text-left">
            Save these codes in a secure place. Each code can only be used once.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {codes.length === 0 ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-200">
                    Important
                  </p>
                  <p className="text-sm text-amber-600 dark:text-amber-400">
                    Generating new codes will invalidate any previously
                    generated codes.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={generateCodes} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate New Codes
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative rounded-lg border bg-muted p-4">
              {/* Icon buttons in top right */}
              <div className="absolute top-2 right-2 flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={copyAllCodes}
                  title="Copy codes"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={downloadCodes}
                  title="Download codes"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2 pr-20">
                {codes.map((code, index) => (
                  <code
                    key={`backup-code-${index}`}
                    className="text-sm font-mono"
                  >
                    {code}
                  </code>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => onOpenChange(false)} disabled={!canClose}>
                {canClose ? "Done" : "Copy or download to continue"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Recovery Email Dialog
function RecoveryEmailDialog({
  open,
  onOpenChange,
  currentEmail,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentEmail: string | null;
  onSaved: (email: string | null) => void;
}) {
  const [email, setEmail] = useState(currentEmail || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setEmail(currentEmail || "");
      setError("");
    }
  }, [open, currentEmail]);

  const handleSave = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/profile/recovery-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recoveryEmail: email || null }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save recovery email");
      }

      toast.success(email ? "Recovery email saved" : "Recovery email removed");
      onSaved(email || null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to save recovery email";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/profile/recovery-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recoveryEmail: null }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to remove recovery email");
      }

      toast.success("Recovery email removed");
      onSaved(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to remove recovery email";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-left">
          <DialogTitle>Recovery Email</DialogTitle>
          <DialogDescription className="text-left">
            Add a backup email address to recover your account if you lose
            access to your authenticator app.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="recovery-email">Email Address</Label>
            <Input
              id="recovery-email"
              type="email"
              placeholder="backup@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              This must be different from your primary email address.
            </p>
          </div>

          <div className="flex justify-between">
            {currentEmail && (
              <Button
                variant="destructive"
                onClick={handleRemove}
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Remove
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={loading || !email || !isValidEmail}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
