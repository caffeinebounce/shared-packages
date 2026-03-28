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
} from "@caffeinebounce/ui";
import { AlertCircle, CheckCircle2, Loader2, Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import type { CreateClientFn } from "../../types";
import { useVerificationFlow } from "./useVerificationFlow";

export interface EmailSectionProps {
  /** Function to create a Supabase client */
  createClient: CreateClientFn;
  /** User ID (reserved for future use) */
  userId: string;
  /** Current email address */
  email: string;
  /** Whether the email is verified */
  isVerified: boolean;
  /** Callback when email is changed */
  onEmailChanged: (newEmail: string) => void;
}

export function EmailSection({
  createClient,
  userId: _userId,
  email,
  isVerified,
  onEmailChanged,
}: EmailSectionProps) {
  const [newEmail, setNewEmail] = useState("");
  const {
    completeSuccess,
    dialogOpen,
    error,
    goToVerification,
    handleOpenChange,
    loading,
    openEntryStep,
    runAction,
    setError,
    step,
  } = useVerificationFlow({
    entryStep: "enter-email",
    onReset: () => {
      setNewEmail("");
    },
  });

  const handleStartChange = () => {
    openEntryStep();
  };

  const handleSendCode = async () => {
    if (!newEmail || !newEmail.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    if (newEmail.toLowerCase() === email.toLowerCase()) {
      setError("This is already your current email address");
      return;
    }

    await runAction(async () => {
      const supabase = createClient();

      const { error } = await supabase.auth.updateUser({
        email: newEmail,
      });

      if (error) {
        if (error.message.includes("already registered")) {
          setError("This email is already in use");
        } else {
          setError(error.message);
        }
        return;
      }

      goToVerification();
      toast.success("Verification email sent! Check your inbox.");
    }).catch(() => {
      setError("Failed to send verification email");
    });
  };

  const handleVerifyCode = async () => {
    await runAction(async () => {
      const supabase = createClient();

      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        setError("Verification failed. Please try again.");
        return;
      }

      if (data.user?.email === newEmail) {
        onEmailChanged(newEmail);
        toast.success("Email updated successfully!");
        completeSuccess();
      } else {
        setError(
          "Please click the verification link sent to your new email address",
        );
      }
    }).catch(() => {
      setError("Verification failed. Please try again.");
    });
  };

  const handleResendCode = async () => {
    await runAction(async () => {
      const supabase = createClient();

      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) {
        toast.error("Failed to resend verification email");
        return;
      }

      toast.success("Verification email resent!");
    }).catch(() => {
      toast.error("Failed to resend verification email");
    });
  };

  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
          <Mail className="w-4 h-4 text-muted-foreground" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Email</span>
            {isVerified ? (
              <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                <AlertCircle className="w-3.5 h-3.5" />
                Unverified
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{email}</p>
        </div>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleStartChange}
      >
        Change
      </Button>

      <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          {step === "enter-email" && (
            <>
              <DialogHeader>
                <DialogTitle>Change Email Address</DialogTitle>
                <DialogDescription>
                  Enter your new email address. We&apos;ll send a verification
                  link to confirm.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="new-email">New Email Address</Label>
                  <Input
                    id="new-email"
                    type="email"
                    placeholder="new@example.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
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
                  onClick={handleSendCode}
                  disabled={loading || !newEmail}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Verification"
                  )}
                </Button>
              </DialogFooter>
            </>
          )}

          {step === "verify-code" && (
            <>
              <DialogHeader>
                <DialogTitle>Check Your Email</DialogTitle>
                <DialogDescription>
                  We&apos;ve sent a verification link to{" "}
                  <strong>{newEmail}</strong>. Click the link in the email to
                  confirm your new address.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Mail className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-sm text-center text-muted-foreground">
                    After clicking the link, come back here and click
                    &quot;I&apos;ve Verified&quot; below.
                  </p>
                </div>
                {error && (
                  <p className="text-sm text-destructive text-center">
                    {error}
                  </p>
                )}
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={handleResendCode}
                  disabled={loading}
                >
                  Resend Email
                </Button>
                <Button onClick={handleVerifyCode} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    "I've Verified"
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
                <h3 className="font-semibold text-lg">Email Updated!</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Your email has been changed to {newEmail}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
