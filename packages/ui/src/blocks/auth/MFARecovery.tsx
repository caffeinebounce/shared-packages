"use client";

import { REGEXP_ONLY_DIGITS } from "input-otp";
import { AlertTriangle, ArrowLeft, Check, Mail, Monitor } from "lucide-react";
import { useState } from "react";
import { Button } from "../../components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "../../components/ui/input-otp";
import { LocationMap } from "../../components/ui/location-map";
import { Spinner } from "../../components/ui/spinner";

/**
 * Recovery method type
 */
export type RecoveryMethod = "backup_code" | "magic_link";

/**
 * Device info for verification
 */
export interface DeviceInfo {
  browser?: string;
  os?: string;
  city?: string;
  region?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

/**
 * Props for the MFARecovery component
 */
export interface MFARecoveryProps {
  /** Callback when backup code verification is submitted */
  onVerifyBackupCode?: (code: string) => Promise<void>;
  /** Callback to request magic link */
  onRequestMagicLink?: () => Promise<void>;
  /** Callback when user wants to go back to MFA challenge */
  onBack?: () => void;
  /** Callback when cancel is clicked */
  onCancel?: () => void;
  /** Device info for verification display */
  deviceInfo?: DeviceInfo;
  /** Loading state */
  loading?: boolean;
  /** Error message to display */
  error?: string;
  /** Optional className for styling */
  className?: string;
}

/**
 * MFARecovery - Multi-factor authentication recovery component
 *
 * Handles account recovery when users lose access to their 2FA device.
 * Supports backup codes and magic link fallback.
 *
 * @example
 * ```tsx
 * <MFARecovery
 *   onVerifyBackupCode={async (code) => {
 *     await verifyRecoveryCode(code);
 *   }}
 *   onRequestMagicLink={async () => {
 *     await sendRecoveryLink();
 *   }}
 *   onBack={() => router.push('/mfa-challenge')}
 *   deviceInfo={{
 *     browser: 'Chrome',
 *     os: 'Windows',
 *     city: 'Lisbon',
 *     country: 'Portugal'
 *   }}
 * />
 * ```
 */
export function MFARecovery({
  onVerifyBackupCode,
  onRequestMagicLink,
  onBack,
  onCancel,
  deviceInfo,
  loading = false,
  error,
  className,
}: MFARecoveryProps) {
  const [selectedMethod, setSelectedMethod] = useState<RecoveryMethod | null>(
    null,
  );
  const [backupCode, setBackupCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isRequestingLink, setIsRequestingLink] = useState(false);
  const [linkSent, setLinkSent] = useState(false);

  const verifyBackupCode = async () => {
    if (!onVerifyBackupCode || backupCode.length < 8 || isVerifying) return;

    setIsVerifying(true);
    try {
      await onVerifyBackupCode(backupCode);
      // Don't reset isVerifying on success - let the parent handle navigation
    } catch {
      setIsVerifying(false);
    }
  };

  const requestMagicLink = async () => {
    if (!onRequestMagicLink || isRequestingLink) return;

    setIsRequestingLink(true);
    try {
      await onRequestMagicLink();
      setLinkSent(true);
    } finally {
      setIsRequestingLink(false);
    }
  };

  const handleBackToMethods = () => {
    setSelectedMethod(null);
    setBackupCode("");
    setLinkSent(false);
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

  return (
    <div
      className={`relative z-20 flex min-h-svh flex-col items-center justify-center px-6 py-12 pointer-events-none ${className || ""}`}
    >
      <div className="w-full max-w-sm pointer-events-auto">
        <div className="relative z-30 rounded-2xl border border-border bg-card/95 dark:bg-zinc-900/95 backdrop-blur-xl p-8 shadow-2xl">
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold">Account Recovery</h1>
              <p className="mt-2 text-muted-foreground">
                {!selectedMethod
                  ? "Choose a recovery method"
                  : selectedMethod === "backup_code"
                    ? "Enter one of your backup codes"
                    : linkSent
                      ? "Check your email"
                      : "We'll send you a recovery link"}
              </p>
            </div>

            {/* Device verification info with location map */}
            {deviceInfo && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-center">
                  Verify this is you
                </p>

                {/* Location map */}
                <LocationMap
                  city={deviceInfo.city}
                  region={deviceInfo.region}
                  country={deviceInfo.country}
                  latitude={deviceInfo.latitude}
                  longitude={deviceInfo.longitude}
                />

                {/* Device info */}
                {deviceInfo.browser && deviceInfo.os && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center">
                    <Monitor className="h-4 w-4" />
                    <span>
                      {deviceInfo.browser} on {deviceInfo.os}
                    </span>
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-center text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Method selection */}
            {!selectedMethod && (
              <div className="space-y-3">
                {onVerifyBackupCode && (
                  <button
                    type="button"
                    onClick={() => setSelectedMethod("backup_code")}
                    className="flex w-full items-center gap-3 rounded-lg border p-4 text-left transition-colors hover:bg-muted"
                  >
                    <div className="rounded-full bg-primary/10 p-2">
                      <Check className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Use a backup code</p>
                      <p className="text-sm text-muted-foreground">
                        Enter one of your recovery codes
                      </p>
                    </div>
                  </button>
                )}

                {onRequestMagicLink && (
                  <button
                    type="button"
                    onClick={() => setSelectedMethod("magic_link")}
                    className="flex w-full items-center gap-3 rounded-lg border p-4 text-left transition-colors hover:bg-muted"
                  >
                    <div className="rounded-full bg-primary/10 p-2">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Email recovery link</p>
                      <p className="text-sm text-muted-foreground">
                        Get a secure link via email
                      </p>
                    </div>
                  </button>
                )}
              </div>
            )}

            {/* Backup code verification */}
            {selectedMethod === "backup_code" && (
              <div className="space-y-4">
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-amber-800 dark:text-amber-200">
                        One-time use
                      </p>
                      <p className="text-sm text-amber-600 dark:text-amber-400">
                        Each backup code can only be used once. After recovery,
                        you'll need to set up 2FA again.
                      </p>
                    </div>
                  </div>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    verifyBackupCode();
                  }}
                >
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={9}
                      pattern={REGEXP_ONLY_DIGITS}
                      value={backupCode}
                      onChange={setBackupCode}
                      onComplete={verifyBackupCode}
                      disabled={isVerifying}
                      autoFocus
                    >
                      <InputOTPGroup>
                        <InputOTPSlot
                          index={0}
                          className="h-10 w-8 text-base"
                        />
                        <InputOTPSlot
                          index={1}
                          className="h-10 w-8 text-base"
                        />
                        <InputOTPSlot
                          index={2}
                          className="h-10 w-8 text-base"
                        />
                        <InputOTPSlot
                          index={3}
                          className="h-10 w-8 text-base"
                        />
                      </InputOTPGroup>
                      <InputOTPSeparator />
                      <InputOTPGroup>
                        <InputOTPSlot
                          index={4}
                          className="h-10 w-8 text-base"
                        />
                        <InputOTPSlot
                          index={5}
                          className="h-10 w-8 text-base"
                        />
                        <InputOTPSlot
                          index={6}
                          className="h-10 w-8 text-base"
                        />
                        <InputOTPSlot
                          index={7}
                          className="h-10 w-8 text-base"
                        />
                        <InputOTPSlot
                          index={8}
                          className="h-10 w-8 text-base"
                        />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>

                  <Button
                    type="submit"
                    className="w-full mt-4"
                    loading={isVerifying}
                    disabled={backupCode.length < 8}
                  >
                    Verify Code
                  </Button>
                </form>

                <button
                  type="button"
                  onClick={handleBackToMethods}
                  className="flex items-center justify-center gap-1 w-full text-sm text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Use a different method
                </button>
              </div>
            )}

            {/* Magic link request */}
            {selectedMethod === "magic_link" && !linkSent && (
              <div className="space-y-4">
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
                  <div className="flex items-start gap-2">
                    <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-blue-800 dark:text-blue-200">
                        Recovery via email
                      </p>
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        We'll send a secure, time-limited link to your
                        registered email address.
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={requestMagicLink}
                  className="w-full"
                  loading={isRequestingLink}
                >
                  Send Recovery Link
                </Button>

                <button
                  type="button"
                  onClick={handleBackToMethods}
                  className="flex items-center justify-center gap-1 w-full text-sm text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Use a different method
                </button>
              </div>
            )}

            {/* Magic link sent confirmation */}
            {selectedMethod === "magic_link" && linkSent && (
              <div className="space-y-4">
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950">
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <span className="font-medium text-green-800 dark:text-green-200">
                      Recovery link sent!
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                    Check your email for a recovery link. It will expire in 15
                    minutes.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={requestMagicLink}
                  disabled={isRequestingLink}
                  className="w-full text-center text-sm text-primary hover:underline disabled:opacity-50"
                >
                  Resend recovery link
                </button>
              </div>
            )}

            {/* Back to MFA and cancel options */}
            <div className="space-y-2 pt-4 border-t">
              {onBack && !selectedMethod && (
                <button
                  type="button"
                  onClick={onBack}
                  className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
                >
                  Back to verification
                </button>
              )}
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
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
