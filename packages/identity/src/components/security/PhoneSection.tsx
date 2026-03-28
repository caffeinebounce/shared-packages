"use client";

import { useErrorLoggerSafe as useErrorLogger } from "@caffeinebounce/logger/client";
import { formatPhoneInput } from "@caffeinebounce/shared-utils";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  VerificationCodeInput,
} from "@caffeinebounce/ui";
import { AlertCircle, CheckCircle2, Loader2, Phone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import type { CreateClientFn } from "../../types";
import { useVerificationFlow } from "./useVerificationFlow";

export interface PhoneSectionProps {
  /** Function to create a Supabase client */
  createClient: CreateClientFn;
  /** User ID (reserved for future use) */
  userId: string;
  /** Current phone number */
  phone: string;
  /** Whether the phone is verified */
  isVerified: boolean;
  /** Callback when phone is changed */
  onPhoneChanged: (newPhone: string) => void;
  /** API endpoint for phone verification (default: /api/phone/verify) */
  verifyEndpoint?: string;
}

// Clean phone number for API
function cleanPhoneNumber(value: string): string {
  const numbers = value.replace(/\D/g, "");
  if (numbers.length === 10) {
    return `+1${numbers}`;
  }
  if (numbers.length === 11 && numbers.startsWith("1")) {
    return `+${numbers}`;
  }
  return `+${numbers}`;
}

export function PhoneSection({
  createClient,
  userId: _userId,
  phone,
  isVerified,
  onPhoneChanged,
  verifyEndpoint = "/api/phone/verify",
}: PhoneSectionProps) {
  const { logError } = useErrorLogger();
  const [newPhone, setNewPhone] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const {
    completeSuccess,
    dialogOpen,
    error,
    goToVerification,
    handleOpenChange,
    loading,
    openEntryStep,
    resendTimer,
    runAction,
    setError,
    setStep,
    startResendCooldown,
    step,
  } = useVerificationFlow({
    entryStep: "enter-phone",
    onReset: () => {
      setNewPhone("");
      setVerificationCode("");
    },
  });

  const handleStartChange = () => {
    openEntryStep();
  };

  const handleVerifyExisting = async () => {
    if (!phone) return;

    setNewPhone(formatPhoneInput(phone.replace("+1", "")));

    await runAction(async () => {
      const response = await fetch(verifyEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phone,
          action: "send",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to send verification code");
        return;
      }

      goToVerification({ openDialog: true, resendCooldownSeconds: 30 });
      toast.success("Verification code sent!");
    }).catch(() => {
      toast.error("Failed to send verification code");
    });
  };

  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneInput(e.target.value);
    setNewPhone(formatted);
  };

  const handleSendCode = async () => {
    const cleanedPhone = cleanPhoneNumber(newPhone);

    if (cleanedPhone.length < 12) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }

    const currentCleanedPhone = phone ? cleanPhoneNumber(phone) : "";
    if (cleanedPhone === currentCleanedPhone) {
      setError("This is already your current phone number");
      return;
    }

    await runAction(async () => {
      const response = await fetch(verifyEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: cleanedPhone,
          action: "send",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to send verification code");
        return;
      }

      goToVerification({ resendCooldownSeconds: 30 });
      toast.success("Verification code sent!");
    }).catch(() => {
      setError("Failed to send verification code");
    });
  };

  const handleVerifyCode = async (code: string) => {
    if (code.length !== 6) return;

    await runAction(async () => {
      const cleanedPhone = cleanPhoneNumber(newPhone);

      const response = await fetch(verifyEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: cleanedPhone,
          action: "verify",
          code,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Invalid verification code");
        setVerificationCode("");
        return;
      }

      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        phone: cleanedPhone,
      });

      if (updateError) {
        logError(updateError, {
          component: "PhoneSection",
          action: "updateUserPhone",
        });
      }

      onPhoneChanged(cleanedPhone);
      toast.success("Phone number verified successfully!");
      completeSuccess();
    }).catch(() => {
      setError("Verification failed. Please try again.");
      setVerificationCode("");
    });
  };

  const handleResendCode = async () => {
    setVerificationCode("");

    await runAction(async () => {
      const cleanedPhone = cleanPhoneNumber(newPhone);
      const response = await fetch(verifyEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: cleanedPhone,
          action: "send",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to resend code");
        return;
      }

      startResendCooldown(30);
      toast.success("Verification code resent!");
    }).catch(() => {
      toast.error("Failed to resend code");
    });
  };

  const displayPhone = phone
    ? formatPhoneInput(phone.replace("+1", ""))
    : "Not set";

  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
          <Phone className="w-4 h-4 text-muted-foreground" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Phone</span>
            {phone &&
              (isVerified ? (
                <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Unverified
                </span>
              ))}
          </div>
          <p className="text-sm text-muted-foreground">{displayPhone}</p>
        </div>
      </div>
      <div className="flex gap-2">
        {phone && !isVerified && (
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={handleVerifyExisting}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify"}
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleStartChange}
        >
          {phone ? "Change" : "Add"}
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          {step === "enter-phone" && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {phone ? "Change Phone Number" : "Add Phone Number"}
                </DialogTitle>
                <DialogDescription>
                  Enter your phone number. We&apos;ll send a verification code
                  via SMS.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="new-phone">Phone Number</Label>
                  <Input
                    id="new-phone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={newPhone}
                    onChange={handlePhoneInput}
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground">
                    US phone numbers only. Standard message rates may apply.
                  </p>
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSendCode}
                  disabled={loading || newPhone.replace(/\D/g, "").length < 10}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Code"
                  )}
                </Button>
              </DialogFooter>
            </>
          )}

          {step === "verify-code" && (
            <>
              <DialogHeader>
                <DialogTitle>Enter Verification Code</DialogTitle>
                <DialogDescription>
                  We sent a 6-digit code to {newPhone}. Enter it below.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-6">
                <VerificationCodeInput
                  length={6}
                  value={verificationCode}
                  onChange={setVerificationCode}
                  onComplete={handleVerifyCode}
                  disabled={loading}
                />
                {error && (
                  <p className="text-sm text-destructive text-center">
                    {error}
                  </p>
                )}
                {loading && (
                  <div className="flex justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                )}
              </div>
              <DialogFooter className="flex justify-between gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStep("enter-phone")}
                  disabled={loading}
                >
                  Back
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleResendCode}
                    disabled={loading || resendTimer > 0}
                  >
                    {resendTimer > 0
                      ? `Resend (${resendTimer}s)`
                      : "Resend Code"}
                  </Button>
                  <Button
                    onClick={() => handleVerifyCode(verificationCode)}
                    disabled={loading || verificationCode.length !== 6}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "Verify"
                    )}
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}

          {step === "success" && (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-lg">Phone Number Updated!</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Your phone number has been verified and saved.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
