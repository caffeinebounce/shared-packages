"use client";

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
import { useEffect, useState } from "react";
import { toast } from "sonner";

import type { CreateClientFn } from "../../types";

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

type ChangeStep = "idle" | "enter-phone" | "verify-code" | "success";

// Format phone number as user types
function formatPhoneNumber(value: string): string {
  const numbers = value.replace(/\D/g, "");
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 6)
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
  return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [step, setStep] = useState<ChangeStep>("idle");
  const [newPhone, setNewPhone] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    if (resendTimer <= 0) return;

    const interval = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setStep("idle");
      setNewPhone("");
      setVerificationCode("");
      setError("");
    }
  };

  const handleStartChange = () => {
    setStep("enter-phone");
    setDialogOpen(true);
  };

  const handleVerifyExisting = async () => {
    if (!phone) return;

    setLoading(true);
    setError("");
    setNewPhone(formatPhoneNumber(phone.replace("+1", "")));

    try {
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

      setStep("verify-code");
      setResendTimer(30);
      setDialogOpen(true);
      toast.success("Verification code sent!");
    } catch {
      toast.error("Failed to send verification code");
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
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

    setLoading(true);
    setError("");

    try {
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

      setStep("verify-code");
      setResendTimer(30);
      toast.success("Verification code sent!");
    } catch {
      setError("Failed to send verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (code: string) => {
    if (code.length !== 6) return;

    setLoading(true);
    setError("");

    try {
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
        console.error("Failed to update user phone:", updateError);
      }

      setStep("success");
      onPhoneChanged(cleanedPhone);
      toast.success("Phone number verified successfully!");
      setTimeout(() => {
        handleOpenChange(false);
      }, 1500);
    } catch {
      setError("Verification failed. Please try again.");
      setVerificationCode("");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    setVerificationCode("");
    setError("");

    try {
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

      setResendTimer(30);
      toast.success("Verification code resent!");
    } catch {
      toast.error("Failed to resend code");
    } finally {
      setLoading(false);
    }
  };

  const displayPhone = phone
    ? formatPhoneNumber(phone.replace("+1", ""))
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
