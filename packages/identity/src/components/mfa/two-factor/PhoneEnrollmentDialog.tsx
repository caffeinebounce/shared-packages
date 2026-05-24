"use client";

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
} from "@caffeinebounce/ui/primitives";
import type { Factor } from "@supabase/supabase-js";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Check, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { CreateClientFn } from "../../../types";
import { ConfirmAccessDialog } from "../../security/ConfirmAccessDialog";

interface MFAFactor extends Factor {
  phone?: string;
}

export interface PhoneEnrollmentDialogProps {
  createClient: CreateClientFn;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  existingFactor?: MFAFactor;
}

/**
 * Dialog for enrolling or managing phone-based MFA (SMS authentication)
 */
export function PhoneEnrollmentDialog({
  createClient,
  open,
  onOpenChange,
  onSuccess,
  existingFactor,
}: PhoneEnrollmentDialogProps) {
  const [step, setStep] = useState<"setup" | "verify" | "manage">(
    existingFactor ? "manage" : "setup",
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [factorId, setFactorId] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [unenrolling, setUnenrolling] = useState(false);
  const [showConfirmRemove, setShowConfirmRemove] = useState(false);

  useEffect(() => {
    if (open) {
      setStep(existingFactor ? "manage" : "setup");
      setError("");
      setPhoneNumber("");
      setVerifyCode("");
    }
  }, [open, existingFactor]);

  const enrollPhone = async () => {
    if (!phoneNumber.trim()) {
      setError("Please enter a phone number");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "phone",
        phone: phoneNumber,
        friendlyName: "SMS",
      });

      if (error) throw error;

      setFactorId(data.id);

      const { data: challengeData, error: challengeError } =
        await supabase.auth.mfa.challenge({
          factorId: data.id,
        });

      if (challengeError) throw challengeError;

      setChallengeId(challengeData.id);
      setStep("verify");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to set up SMS authentication",
      );
    } finally {
      setLoading(false);
    }
  };

  const resendCode = async () => {
    setLoading(true);
    setError("");
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.mfa.challenge({
        factorId,
      });

      if (error) throw error;

      setChallengeId(data.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend code");
    } finally {
      setLoading(false);
    }
  };

  const verifyPhone = async () => {
    if (verifyCode.length !== 6) return;

    setLoading(true);
    setError("");
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.mfa.verify({
        factorId,
        challengeId,
        code: verifyCode,
      });

      if (error) throw error;

      onSuccess();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Invalid code. Please try again.",
      );
      setVerifyCode("");
    } finally {
      setLoading(false);
    }
  };

  const unenrollPhone = async () => {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === "manage"
              ? "Manage SMS Authentication"
              : "Set up SMS Authentication"}
          </DialogTitle>
          <DialogDescription>
            {step === "setup" &&
              "Enter your phone number to receive verification codes via SMS."}
            {step === "verify" &&
              `Enter the 6-digit code sent to ${phoneNumber}`}
            {step === "manage" &&
              "SMS authentication is configured and active."}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {step === "setup" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Include your country code (e.g., +1 for US)
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={enrollPhone}
                disabled={loading || !phoneNumber.trim()}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Code
              </Button>
            </div>
          </div>
        )}

        {step === "verify" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Enter the 6-digit code</Label>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  pattern={REGEXP_ONLY_DIGITS}
                  value={verifyCode}
                  onChange={setVerifyCode}
                  onComplete={verifyPhone}
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

            <button
              type="button"
              onClick={resendCode}
              disabled={loading}
              className="text-sm text-primary hover:underline disabled:opacity-50"
            >
              Resend code
            </button>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setStep("setup")}>
                Back
              </Button>
              <Button
                onClick={verifyPhone}
                disabled={loading || verifyCode.length !== 6}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify & Enable
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
                  SMS authentication is active
                </span>
              </div>
              {existingFactor?.phone && (
                <p className="mt-1 text-sm text-green-600 dark:text-green-400">
                  Phone: {existingFactor.phone}
                </p>
              )}
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
          onConfirm={unenrollPhone}
          verificationMethod="mfa"
          mfaFactor={{ id: existingFactor.id, type: "phone" }}
          title="Confirm Access"
          description="Enter your verification code to remove phone authentication."
          confirmText="Remove"
          confirmLoading={unenrolling}
          destructive
        />
      )}
    </Dialog>
  );
}
