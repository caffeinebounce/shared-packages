"use client";

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
  Label,
} from "@caffeinebounce/ui";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import type { CreateClientFn } from "../../types";

export interface MFAConfirmDialogProps {
  /** Function to create a Supabase client */
  createClient: CreateClientFn;
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when dialog open state changes */
  onOpenChange: (open: boolean) => void;
  /** Callback when MFA verification succeeds */
  onConfirm: () => void | Promise<void>;
  /** The factor ID to verify against */
  factorId: string;
  /** Factor type - determines if we need to send a code first */
  factorType: "totp" | "phone";
  /** Optional title override */
  title?: string;
  /** Optional description override */
  description?: string;
  /** Optional confirm button text */
  confirmText?: string;
  /** Whether the confirm action is in progress */
  confirmLoading?: boolean;
}

/**
 * MFAConfirmDialog - Reusable dialog for confirming sensitive actions with MFA
 *
 * Use this component anywhere you need to verify the user's identity before
 * performing a sensitive action (e.g., removing MFA, changing email, etc.)
 *
 * @example
 * ```tsx
 * <MFAConfirmDialog
 *   createClient={createClient}
 *   open={showConfirm}
 *   onOpenChange={setShowConfirm}
 *   onConfirm={handleDelete}
 *   factorId={factor.id}
 *   factorType="totp"
 *   confirmText="Remove"
 * />
 * ```
 */
export function MFAConfirmDialog({
  createClient,
  open,
  onOpenChange,
  onConfirm,
  factorId,
  factorType,
  title = "Confirm Access",
  description = "Enter your verification code to continue.",
  confirmText = "Confirm",
  confirmLoading = false,
}: MFAConfirmDialogProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [challengeId, setChallengeId] = useState("");
  const [sendingCode, setSendingCode] = useState(false);
  const [codeSent, setCodeSent] = useState(false);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setCode("");
      setError("");
      setChallengeId("");
      setCodeSent(false);

      // For phone, we need to send a code first
      // For TOTP, we can verify immediately
      if (factorType === "totp") {
        setCodeSent(true);
      }
    }
  }, [open, factorType]);

  const sendCode = async () => {
    setSendingCode(true);
    setError("");
    try {
      const supabase = createClient();
      const { data, error: challengeError } = await supabase.auth.mfa.challenge(
        {
          factorId,
        },
      );

      if (challengeError) throw challengeError;

      setChallengeId(data.id);
      setCodeSent(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to send verification code",
      );
    } finally {
      setSendingCode(false);
    }
  };

  const verify = async (codeFromInput?: string) => {
    const verifyCode = codeFromInput || code;
    if (verifyCode.length !== 6) return;

    setVerifying(true);
    setError("");
    try {
      const supabase = createClient();

      // Create challenge if not already created (for TOTP)
      let currentChallengeId = challengeId;
      if (!currentChallengeId) {
        const { data, error: challengeError } =
          await supabase.auth.mfa.challenge({
            factorId,
          });
        if (challengeError) throw challengeError;
        currentChallengeId = data.id;
      }

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: currentChallengeId,
        code: verifyCode,
      });

      if (verifyError) throw verifyError;

      // Success - call the confirm callback
      await onConfirm();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Invalid code. Please try again.",
      );
      setCode("");
    } finally {
      setVerifying(false);
    }
  };

  const isLoading = verifying || confirmLoading;
  const showCodeInput = factorType === "totp" || codeSent;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Phone factor - need to send code first */}
          {factorType === "phone" && !codeSent && (
            <Button
              onClick={sendCode}
              className="w-full"
              disabled={sendingCode}
            >
              {sendingCode && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Verification Code
            </Button>
          )}

          {/* Show code input */}
          {showCodeInput && (
            <>
              <div className="space-y-2">
                <Label>
                  {factorType === "totp"
                    ? "Enter the code from your authenticator app"
                    : "Enter the code sent to your phone"}
                </Label>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    pattern={REGEXP_ONLY_DIGITS}
                    value={code}
                    onChange={setCode}
                    onComplete={verify}
                    disabled={isLoading}
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

              {factorType === "phone" && (
                <button
                  type="button"
                  onClick={sendCode}
                  disabled={sendingCode}
                  className="text-sm text-primary hover:underline disabled:opacity-50"
                >
                  Resend code
                </button>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => verify()}
                  disabled={isLoading || code.length !== 6}
                >
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {confirmText}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
