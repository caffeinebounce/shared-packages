"use client";

import { REGEXP_ONLY_DIGITS } from "input-otp";
import { ArrowLeft, Mail, Phone, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "../../components/ui/input-otp";
import { Spinner } from "../../components/ui/spinner";

/**
 * MFA factor type definition
 */
export interface MFAFactor {
  /** Unique identifier for the factor */
  id: string;
  /** Type of MFA factor */
  type: "totp" | "phone" | "email";
  /** User-friendly name for the factor */
  friendlyName?: string;
  /** Phone number (for phone type) */
  phone?: string;
  /** Email address (for email type) */
  email?: string;
}

/**
 * Props for the MFAChallenge component
 */
export interface MFAChallengeProps {
  /** Available MFA factors */
  factors: MFAFactor[];
  /** Callback when verification is submitted */
  onVerify: (factorId: string, code: string) => Promise<void>;
  /** Optional callback when cancel is clicked */
  onCancel?: () => void;
  /** Optional callback to resend verification code */
  onResend?: (factorId: string) => Promise<void>;
  /** Optional callback when user needs recovery (lost access to 2FA device) */
  onRecovery?: () => void;
  /** Loading state */
  loading?: boolean;
  /** Error message to display */
  error?: string;
  /** Optional className for styling */
  className?: string;
}

/**
 * MFAChallenge - A reusable multi-factor authentication challenge component
 *
 * Supports multiple factor types (TOTP, phone, email) with factor selection,
 * verification code input, and resend functionality. Works with any MFA provider
 * through callback-based API.
 *
 * @example
 * ```tsx
 * <MFAChallenge
 *   factors={[
 *     { id: '1', type: 'totp', friendlyName: 'Authenticator App' },
 *     { id: '2', type: 'phone', phone: '+1234567890' }
 *   ]}
 *   onVerify={async (factorId, code) => {
 *     await verifyMFA(factorId, code);
 *   }}
 *   onResend={async (factorId) => {
 *     await sendNewCode(factorId);
 *   }}
 *   onCancel={() => router.push('/login')}
 * />
 * ```
 */
export function MFAChallenge({
  factors,
  onVerify,
  onCancel,
  onResend,
  onRecovery,
  loading = false,
  error,
  className,
}: MFAChallengeProps) {
  const [selectedFactor, setSelectedFactor] = useState<MFAFactor | null>(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [codeSent, setCodeSent] = useState(false);

  // Auto-select factor when there's only one
  useEffect(() => {
    if (factors.length === 1 && !selectedFactor) {
      setSelectedFactor(factors[0]);
    }
  }, [factors, selectedFactor]);

  const selectFactor = (factor: MFAFactor) => {
    setSelectedFactor(factor);
    setVerifyCode("");
    setCodeSent(false);
  };

  const sendCode = async () => {
    if (!selectedFactor || !onResend) return;

    setIsResending(true);
    try {
      await onResend(selectedFactor.id);
      setCodeSent(true);
    } finally {
      setIsResending(false);
    }
  };

  const verifyMFA = async () => {
    if (!selectedFactor || verifyCode.length !== 6 || isVerifying) return;

    setIsVerifying(true);
    try {
      await onVerify(selectedFactor.id, verifyCode);
      // Don't reset isVerifying on success - let the parent handle navigation
    } catch {
      setIsVerifying(false);
    }
  };

  const handleBack = () => {
    setSelectedFactor(null);
    setVerifyCode("");
    setCodeSent(false);
  };

  // Show loading spinner
  if (loading) {
    return (
      <div className="relative z-20 flex min-h-svh flex-col items-center justify-center px-6 py-12 pointer-events-none">
        <div className="pointer-events-auto">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  // Auto-redirect if no factors (shouldn't happen in normal flow)
  if (factors.length === 0) {
    return null;
  }

  const getFactorIcon = (type: string) => {
    switch (type) {
      case "totp":
        return <Smartphone className="h-5 w-5 text-primary" />;
      case "phone":
        return <Phone className="h-5 w-5 text-primary" />;
      case "email":
        return <Mail className="h-5 w-5 text-primary" />;
      default:
        return <Smartphone className="h-5 w-5 text-primary" />;
    }
  };

  const getFactorLabel = (factor: MFAFactor) => {
    if (factor.friendlyName) return factor.friendlyName;
    switch (factor.type) {
      case "totp":
        return "Authenticator App";
      case "phone":
        return "SMS";
      case "email":
        return "Email";
      default:
        return "Authentication";
    }
  };

  const getFactorDescription = (factor: MFAFactor) => {
    switch (factor.type) {
      case "totp":
        return "Use your authenticator app";
      case "phone":
        return `Send code to ${factor.phone || "registered phone number"}`;
      case "email":
        return `Send code to ${factor.email || "registered email address"}`;
      default:
        return "Verify your identity";
    }
  };

  const getHeaderDescription = () => {
    if (!selectedFactor) return "Choose a verification method";

    switch (selectedFactor.type) {
      case "totp":
        return "Enter the code from your authenticator app";
      case "phone":
        return codeSent
          ? `Enter the code sent to ${selectedFactor.phone || "your registered phone number"}`
          : "We'll send a verification code to your phone";
      case "email":
        return codeSent
          ? `Enter the code sent to ${selectedFactor.email || "your registered email address"}`
          : "We'll send a verification code to your email";
      default:
        return "Verify your identity";
    }
  };

  const needsCodeSending = selectedFactor?.type !== "totp" && !codeSent;
  const canShowCodeInput = selectedFactor?.type === "totp" || codeSent;

  return (
    <div
      className={`relative z-20 flex min-h-svh flex-col items-center justify-center px-6 py-12 pointer-events-none ${className || ""}`}
    >
      <div className="w-full max-w-sm pointer-events-auto">
        <div className="relative z-30 rounded-2xl border border-border bg-card/95 dark:bg-zinc-900/95 backdrop-blur-xl p-8 shadow-2xl">
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold">Two-Factor Authentication</h1>
              <p className="mt-2 text-muted-foreground">
                {getHeaderDescription()}
              </p>
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-center text-sm text-destructive">
                {error}
              </div>
            )}

            {!selectedFactor && factors.length > 1 && (
              <div className="space-y-3">
                {factors.map((factor) => (
                  <button
                    key={factor.id}
                    type="button"
                    onClick={() => selectFactor(factor)}
                    className="flex w-full items-center gap-3 rounded-lg border p-4 text-left transition-colors hover:bg-muted"
                  >
                    <div className="rounded-full bg-primary/10 p-2">
                      {getFactorIcon(factor.type)}
                    </div>
                    <div>
                      <p className="font-medium">{getFactorLabel(factor)}</p>
                      <p className="text-sm text-muted-foreground">
                        {getFactorDescription(factor)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {selectedFactor && (
              <div className="space-y-4">
                {/* Phone/Email factor - need to send code first */}
                {needsCodeSending && onResend && (
                  <Button
                    onClick={sendCode}
                    className="w-full"
                    loading={isResending}
                  >
                    Send Code
                  </Button>
                )}

                {/* Show code input for TOTP or after code is sent */}
                {canShowCodeInput && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      verifyMFA();
                    }}
                  >
                    <div className="flex justify-center">
                      <InputOTP
                        maxLength={6}
                        pattern={REGEXP_ONLY_DIGITS}
                        value={verifyCode}
                        onChange={setVerifyCode}
                        onComplete={verifyMFA}
                        disabled={isVerifying}
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

                    <Button
                      type="submit"
                      className="w-full mt-4"
                      loading={isVerifying}
                      disabled={verifyCode.length !== 6}
                    >
                      Verify
                    </Button>

                    {selectedFactor.type !== "totp" && onResend && (
                      <button
                        type="button"
                        onClick={sendCode}
                        disabled={isResending}
                        className="block w-full text-center text-sm text-primary hover:underline disabled:opacity-50 mt-2"
                      >
                        Resend code
                      </button>
                    )}
                  </form>
                )}

                {/* Back button if multiple factors */}
                {factors.length > 1 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex items-center justify-center gap-1 w-full text-sm text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Use a different method
                  </button>
                )}
              </div>
            )}

            {/* Recovery and cancel options */}
            <div className="space-y-2 pt-4 border-t">
              {onRecovery && (
                <button
                  type="button"
                  onClick={onRecovery}
                  className="w-full text-center text-sm text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Lost access to your 2FA device?
                </button>
              )}
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="w-full text-center text-sm text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Cancel and sign out
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
