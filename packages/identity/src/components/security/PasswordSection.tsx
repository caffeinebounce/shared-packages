"use client";

import { useErrorLoggerSafe as useErrorLogger } from "@caffeinebounce/logger/client";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  extendedPasswordRules,
  Label,
  PasswordInput,
  PasswordRequirements,
} from "@caffeinebounce/ui";
import { CheckCircle2, KeyRound, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import type { CreateClientFn } from "../../types";
import { ConfirmAccessDialog, type MFAFactor } from "./ConfirmAccessDialog";

type ChangeStep =
  | "idle"
  | "verify-current"
  | "verify-mfa"
  | "enter-password"
  | "success";

export interface PasswordSectionProps {
  /** Function to create a Supabase client */
  createClient: CreateClientFn;
  /** External control of dialog open state */
  externalOpen?: boolean;
  /** Callback when external open state changes */
  onExternalOpenChange?: (open: boolean) => void;
}

export function PasswordSection({
  createClient,
  externalOpen,
  onExternalOpenChange,
}: PasswordSectionProps) {
  const { logError } = useErrorLogger();
  const [internalDialogOpen, setInternalDialogOpen] = useState(false);
  const [step, setStep] = useState<ChangeStep>("idle");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [error, setError] = useState("");
  const [hasPassword, setHasPassword] = useState(true);
  const [mfaFactor, setMfaFactor] = useState<MFAFactor | null>(null);

  const dialogOpen =
    externalOpen !== undefined ? externalOpen : internalDialogOpen;
  const setDialogOpen = onExternalOpenChange || setInternalDialogOpen;

  useEffect(() => {
    async function checkPasswordStatus() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const identities = user.identities || [];
        const emailIdentity = identities.find((i) => i.provider === "email");
        const hasOAuthOnly = identities.length > 0 && !emailIdentity;
        setHasPassword(!hasOAuthOnly);

        // Check for MFA factors
        const { data: mfaData } = await supabase.auth.mfa.listFactors();
        if (mfaData) {
          const verifiedFactors = [
            ...(mfaData.totp || []),
            ...(mfaData.phone || []),
          ].filter((f) => f.status === "verified");

          if (verifiedFactors.length > 0) {
            const factor = verifiedFactors[0];
            setMfaFactor({
              id: factor.id,
              type: factor.factor_type as "totp" | "phone",
            });
          }
        }
      }
      setCheckingStatus(false);
    }
    checkPasswordStatus();
  }, [createClient]);

  // Only set step to enter-password when externally opened AND step is idle
  // This prevents overriding the step when opened from handleStartChange
  useEffect(() => {
    if (externalOpen && step === "idle") {
      setStep("enter-password");
    }
  }, [externalOpen, step]);

  const handleOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setStep("idle");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setError("");
    }
  };

  const handleStartChange = () => {
    if (hasPassword) {
      setStep("verify-current");
    } else if (mfaFactor) {
      setStep("verify-mfa");
    } else {
      setStep("enter-password");
    }
    setDialogOpen(true);
  };

  const handleVerifyCurrentPassword = async () => {
    setError("");

    if (!currentPassword) {
      setError("Please enter your current password");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.email) {
        setError("Unable to verify password. Please try again.");
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (error) {
        setError("Current password is incorrect");
        return;
      }

      // If MFA is enabled, require MFA verification
      if (mfaFactor) {
        setStep("verify-mfa");
      } else {
        setStep("enter-password");
      }
    } catch {
      setError("Failed to verify password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleMfaConfirm = useCallback(() => {
    setStep("enter-password");
  }, []);

  const passwordValid = extendedPasswordRules.every((rule) =>
    rule.validator(newPassword),
  );

  const handleChangePassword = async () => {
    setError("");

    if (!newPassword) {
      setError("Please enter a new password");
      return;
    }

    if (!passwordValid) {
      setError("Password does not meet all requirements");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        if (error.message.includes("same as")) {
          setError("New password must be different from your current password");
        } else if (
          error.message.includes("AAL2") ||
          error.message.includes("MFA")
        ) {
          setError("Please sign out and sign back in to change your password.");
        } else if (
          error.message.includes("weak") ||
          error.message.includes("strength")
        ) {
          setError("Please choose a stronger password.");
        } else if (
          error.message.includes("session") ||
          error.message.includes("expired")
        ) {
          setError("Your session has expired. Please sign in again.");
        } else {
          logError(error, {
            component: "PasswordSection",
            action: "updatePassword",
          });
          setError(
            "Unable to update your password. Please try again or contact support.",
          );
        }
        return;
      }

      // Update password changed timestamp
      try {
        await fetch("/api/profile/security-timestamps", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ event: "password_changed" }),
        });
      } catch (timestampError) {
        logError(timestampError, {
          component: "PasswordSection",
          action: "updatePasswordTimestamp",
        });
      }

      setHasPassword(true);
      setStep("success");
      toast.success(
        hasPassword
          ? "Password updated successfully!"
          : "Password set successfully!",
      );
      setTimeout(() => {
        handleOpenChange(false);
      }, 1500);
    } catch {
      setError("Failed to update password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
          <KeyRound className="w-4 h-4 text-muted-foreground" />
        </div>
        <div>
          <span className="font-medium">Password</span>
          <p className="text-sm text-muted-foreground">
            {checkingStatus
              ? "Checking..."
              : hasPassword
                ? "••••••••••••"
                : "No password set"}
          </p>
        </div>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleStartChange}
        disabled={checkingStatus}
      >
        {checkingStatus ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : hasPassword ? (
          "Change"
        ) : (
          "Set"
        )}
      </Button>

      <Dialog
        open={dialogOpen && step !== "verify-mfa"}
        onOpenChange={handleOpenChange}
      >
        <DialogContent className="sm:max-w-md">
          {step === "verify-current" && (
            <>
              <DialogHeader>
                <DialogTitle>Verify Current Password</DialogTitle>
                <DialogDescription>
                  Please enter your current password to continue.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <PasswordInput
                    id="current-password"
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    disabled={loading}
                  />
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
                  onClick={handleVerifyCurrentPassword}
                  disabled={loading || !currentPassword}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Continue"
                  )}
                </Button>
              </DialogFooter>
            </>
          )}

          {step === "enter-password" && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {hasPassword ? "Change Password" : "Set Password"}
                </DialogTitle>
                <DialogDescription>
                  {hasPassword
                    ? "Enter your new password below. Make sure it meets all the security requirements."
                    : "Create a password for your account. This will allow you to sign in with email and password."}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <PasswordInput
                    id="new-password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <PasswordRequirements
                  password={newPassword}
                  rules={extendedPasswordRules}
                />

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <PasswordInput
                    id="confirm-password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                  />
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-sm text-destructive">
                      Passwords do not match
                    </p>
                  )}
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
                  onClick={handleChangePassword}
                  disabled={
                    loading || !passwordValid || newPassword !== confirmPassword
                  }
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </Button>
              </DialogFooter>
            </>
          )}

          {step === "success" && (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-lg">
                  {hasPassword ? "Password Updated!" : "Password Set!"}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {hasPassword
                    ? "Your password has been changed successfully."
                    : "Your password has been set. You can now sign in with your email and password."}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* MFA Confirmation Dialog */}
      <ConfirmAccessDialog
        createClient={createClient}
        open={step === "verify-mfa"}
        onOpenChange={(open) => {
          if (!open) {
            // User cancelled - reset everything and close the dialog
            setStep("idle");
            setCurrentPassword("");
            setError("");
            setDialogOpen(false);
          }
        }}
        onConfirm={handleMfaConfirm}
        verificationMethod="mfa"
        mfaFactor={mfaFactor}
        title="Confirm Access"
        description="Verify your identity to change your password."
        confirmText="Continue"
      />
    </div>
  );
}
