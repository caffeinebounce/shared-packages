"use client";

import { useErrorLoggerSafe as useErrorLogger } from "@caffeinebounce/logger/client";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Input,
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
  Label,
} from "@caffeinebounce/ui";
import type { Factor } from "@supabase/supabase-js";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { AlertTriangle, Check, Copy, Download, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { CreateClientFn } from "../../../types";
import { downloadBackupCodesFile, generateRecoveryCodes } from "../../../utils";
import { ConfirmAccessDialog } from "../../security/ConfirmAccessDialog";

export interface TOTPEnrollmentDialogProps {
  createClient: CreateClientFn;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  existingFactor?: Factor;
}

/**
 * Dialog for enrolling or managing TOTP-based MFA (authenticator app)
 */
export function TOTPEnrollmentDialog({
  createClient,
  open,
  onOpenChange,
  onSuccess,
  existingFactor,
}: TOTPEnrollmentDialogProps) {
  const { logError } = useErrorLogger();
  const [step, setStep] = useState<"name" | "verify" | "backup" | "manage">(
    existingFactor ? "manage" : "name",
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [factorName, setFactorName] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [factorId, setFactorId] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [unenrolling, setUnenrolling] = useState(false);
  const [showManualCode, setShowManualCode] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [backupCodesCopied, setBackupCodesCopied] = useState(false);
  const [showConfirmRemove, setShowConfirmRemove] = useState(false);

  const cleanupUnverifiedFactor = async () => {
    if (factorId && step === "verify") {
      try {
        const supabase = createClient();
        await supabase.auth.mfa.unenroll({ factorId });
        setFactorId("");
      } catch (_e) {
        // Ignore errors
      }
    }
  };

  // Cleanup any unverified TOTP factors (from previous abandoned attempts)
  const cleanupAllUnverifiedFactors = async () => {
    try {
      const supabase = createClient();
      const { data } = await supabase.auth.mfa.listFactors();
      const unverifiedTOTP =
        data?.totp?.filter((f) => (f.status as string) !== "verified") || [];

      for (const factor of unverifiedTOTP) {
        await supabase.auth.mfa.unenroll({ factorId: factor.id });
      }
    } catch (_e) {
      // Ignore errors
    }
  };

  useEffect(() => {
    if (open) {
      setStep(existingFactor ? "manage" : "name");
      setError("");
      setFactorName("");
      setVerifyCode("");
      setQrCode("");
      setSecret("");
      setFactorId("");
      setShowManualCode(false);
      setBackupCodes([]);
      setBackupCodesCopied(false);
    }
  }, [open, existingFactor]);

  const handleClose = async (isOpen: boolean) => {
    if (!isOpen) {
      await cleanupUnverifiedFactor();
    }
    onOpenChange(isOpen);
  };

  const enrollTOTP = async (name: string) => {
    if (!name.trim()) {
      setError("Please enter a name for your authenticator");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const supabase = createClient();

      // Clean up any unverified factors from previous attempts
      await cleanupAllUnverifiedFactors();

      const { data: existingFactors, error: listError } =
        await supabase.auth.mfa.listFactors();

      if (listError) {
        logError(listError, {
          component: "TOTPEnrollmentDialog",
          action: "listFactors",
        });
      }

      const allTOTP = existingFactors?.totp || [];

      const verifiedFactor = allTOTP.find(
        (f) => (f.status as string) === "verified",
      );
      if (verifiedFactor) {
        setError(
          "You already have an authenticator app set up. Please remove it first before adding a new one.",
        );
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: name.trim(),
      });

      if (error) throw error;

      setFactorId(data.id);
      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
      setStep("verify");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to set up authenticator";
      logError(err, {
        component: "TOTPEnrollmentDialog",
        action: "enrollTOTP",
      });
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const verifyTOTP = async (codeFromInput?: string) => {
    const code = codeFromInput || verifyCode;
    if (code.length !== 6) return;

    setLoading(true);
    setError("");
    try {
      const supabase = createClient();

      const { data: challengeData, error: challengeError } =
        await supabase.auth.mfa.challenge({
          factorId,
        });

      if (challengeError) throw challengeError;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code,
      });

      if (verifyError) throw verifyError;

      // Update MFA enabled timestamp
      try {
        await fetch("/api/profile/security-timestamps", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ event: "mfa_enabled" }),
        });
      } catch (timestampError) {
        logError(timestampError, {
          component: "TOTPEnrollmentDialog",
          action: "updateMFATimestamp",
        });
      }

      // Generate recovery codes
      const newCodes = generateRecoveryCodes(10);
      setBackupCodes(newCodes);

      // Store recovery codes in database
      try {
        await fetch("/api/mfa/recovery/generate-codes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ codes: newCodes }),
        });
      } catch (storeError) {
        logError(storeError, {
          component: "TOTPEnrollmentDialog",
          action: "storeRecoveryCodes",
        });
        // Don't fail the whole flow if storage fails
      }

      setStep("backup");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Invalid code. Please try again.",
      );
      setVerifyCode("");
    } finally {
      setLoading(false);
    }
  };

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join("\n"));
    setBackupCodesCopied(true);
  };

  const downloadBackupCodes = () => {
    downloadBackupCodesFile(backupCodes);
    setBackupCodesCopied(true);
  };

  const unenrollTOTP = async () => {
    if (!existingFactor) return;

    setUnenrolling(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.mfa.unenroll({
        factorId: existingFactor.id,
      });

      if (error) throw error;

      setShowConfirmRemove(false);
      onSuccess();
    } finally {
      setUnenrolling(false);
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === "manage"
              ? "Manage Authenticator App"
              : step === "backup"
                ? "Save Backup Codes"
                : "Set up Authenticator App"}
          </DialogTitle>
          <DialogDescription>
            {step === "name" &&
              "Give your authenticator a name to help you identify it later."}
            {step === "verify" &&
              "Scan the QR code with your authenticator app, then enter the 6-digit code."}
            {step === "backup" &&
              "Copy these codes before continuing. Each code can only be used once."}
            {step === "manage" &&
              "Your authenticator app is configured and active."}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {step === "name" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="factor-name">Authenticator Name</Label>
              <Input
                id="factor-name"
                placeholder="e.g., 1Password, Google Authenticator, Work Phone"
                value={factorName}
                onChange={(e) => setFactorName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && factorName.trim()) {
                    enrollTOTP(factorName);
                  }
                }}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => handleClose(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => enrollTOTP(factorName)}
                disabled={loading || !factorName.trim()}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === "verify" && (
          <div className="space-y-4">
            {qrCode && (
              <div className="flex justify-center">
                <div className="rounded-lg border bg-white p-4">
                  <img
                    src={qrCode}
                    alt="QR Code for authenticator app"
                    className="w-[200px] h-[200px]"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              {!showManualCode ? (
                <button
                  type="button"
                  onClick={() => setShowManualCode(true)}
                  className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
                >
                  Can't scan the code? Enter it manually
                </button>
              ) : (
                <>
                  <Label className="text-sm text-muted-foreground">
                    Enter this code manually:
                  </Label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 min-w-0 rounded-md bg-muted px-3 py-2 text-xs font-mono break-all">
                      {secret}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0"
                      onClick={copySecret}
                    >
                      {copied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </>
              )}
            </div>

            <div className="space-y-2">
              <Label>Enter the 6-digit code from your app</Label>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  pattern={REGEXP_ONLY_DIGITS}
                  value={verifyCode}
                  onChange={setVerifyCode}
                  onComplete={verifyTOTP}
                  disabled={loading}
                  autoFocus
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => handleClose(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => verifyTOTP()}
                disabled={loading || verifyCode.length !== 6}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify & Enable
              </Button>
            </div>
          </div>
        )}

        {step === "backup" && (
          <div className="space-y-4">
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950">
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="font-medium text-green-800 dark:text-green-200">
                  Authenticator app enabled!
                </span>
              </div>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-200">
                    Save your backup codes
                  </p>
                  <p className="text-sm text-amber-600 dark:text-amber-400">
                    Store these codes in a safe place. You'll need them if you
                    lose access to your authenticator app.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative rounded-lg border bg-muted p-4">
              {/* Icon buttons in top right */}
              <div className="absolute top-2 right-2 flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={copyBackupCodes}
                  title="Copy codes"
                >
                  {backupCodesCopied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={downloadBackupCodes}
                  title="Download codes"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2 pr-20">
                {backupCodes.map((code, index) => (
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
              <Button onClick={onSuccess} disabled={!backupCodesCopied}>
                {backupCodesCopied ? "Done" : "Copy codes to continue"}
              </Button>
            </div>
          </div>
        )}

        {step === "manage" && (
          <div className="space-y-4">
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950">
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="font-medium text-green-800 dark:text-green-200">
                  Authenticator app is active
                </span>
              </div>
              <p className="mt-1 text-sm text-green-600 dark:text-green-400">
                Added on{" "}
                {existingFactor?.created_at
                  ? new Date(existingFactor.created_at).toLocaleDateString()
                  : "Unknown"}
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button
                variant="destructive"
                onClick={() => setShowConfirmRemove(true)}
              >
                Remove
              </Button>
            </div>
          </div>
        )}
      </DialogContent>

      {/* Confirm Access Dialog for removal */}
      {existingFactor && (
        <ConfirmAccessDialog
          createClient={createClient}
          open={showConfirmRemove}
          onOpenChange={setShowConfirmRemove}
          onConfirm={unenrollTOTP}
          verificationMethod="mfa"
          mfaFactor={{ id: existingFactor.id, type: "totp" }}
          title="Confirm Access"
          description="Enter your verification code to remove your authenticator app."
          confirmText="Remove"
          confirmLoading={unenrolling}
          destructive
        />
      )}
    </Dialog>
  );
}
