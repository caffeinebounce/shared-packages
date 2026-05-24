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
  PasswordInput,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@caffeinebounce/ui/primitives";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { KeyRound, Loader2, Smartphone } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import type { CreateClientFn } from "../../types";
import { createMfaChallenge, verifyMfaChallenge } from "../mfa/supabase-mfa";

export type VerificationMethod = "mfa" | "password" | "both";

export interface MFAFactor {
  id: string;
  type: "totp" | "phone";
}

export interface ConfirmAccessDialogProps {
  /** Function to create a Supabase client */
  createClient: CreateClientFn;
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when dialog open state changes */
  onOpenChange: (open: boolean) => void;
  /** Callback when verification succeeds */
  onConfirm: () => void | Promise<void>;
  /** Verification method(s) allowed */
  verificationMethod?: VerificationMethod;
  /** MFA factor to verify against (required if verificationMethod includes 'mfa') */
  mfaFactor?: MFAFactor | null;
  /** Whether to require reauthentication (for password method) */
  requireReauth?: boolean;
  /** Optional title override */
  title?: string;
  /** Optional description override */
  description?: string;
  /** Optional confirm button text */
  confirmText?: string;
  /** Whether the confirm action is in progress */
  confirmLoading?: boolean;
  /** Use destructive styling for confirm button */
  destructive?: boolean;
  /** Optional DialogContent className override */
  dialogContentClassName?: string;
}

/**
 * ConfirmAccessDialog - Unified dialog for confirming sensitive actions
 *
 * Use this component anywhere you need to verify the user's identity before
 * performing a sensitive action. It supports:
 * - MFA verification (TOTP or SMS)
 * - Password verification
 * - Both options with tabs
 *
 * @example
 * ```tsx
 * <ConfirmAccessDialog
 *   createClient={createClient}
 *   open={showConfirm}
 *   onOpenChange={setShowConfirm}
 *   onConfirm={handleSensitiveAction}
 *   verificationMethod="both"
 *   mfaFactor={factor}
 *   title="Confirm Changes"
 *   confirmText="Continue"
 * />
 * ```
 */
export function ConfirmAccessDialog({
  createClient,
  open,
  onOpenChange,
  onConfirm,
  verificationMethod = "mfa",
  mfaFactor,
  requireReauth = true,
  title = "Confirm Access",
  description = "Verify your identity to continue.",
  confirmText = "Continue",
  confirmLoading = false,
  destructive = false,
  dialogContentClassName,
}: ConfirmAccessDialogProps) {
  const [activeTab, setActiveTab] = useState<"mfa" | "password">("mfa");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [challengeId, setChallengeId] = useState("");
  const [sendingCode, setSendingCode] = useState(false);
  const [codeSent, setCodeSent] = useState(false);

  // Determine available methods
  const canUseMFA =
    (verificationMethod === "mfa" || verificationMethod === "both") &&
    mfaFactor;
  const canUsePassword =
    verificationMethod === "password" || verificationMethod === "both";
  const showTabs = canUseMFA && canUsePassword;

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setCode("");
      setPassword("");
      setError("");
      setChallengeId("");
      setCodeSent(false);

      // Default to MFA if available, otherwise password
      if (canUseMFA) {
        setActiveTab("mfa");
        // For TOTP, we can verify immediately
        if (mfaFactor?.type === "totp") {
          setCodeSent(true);
        }
      } else {
        setActiveTab("password");
      }
    }
  }, [open, canUseMFA, mfaFactor?.type]);

  const sendCode = async () => {
    if (!mfaFactor) return;
    setSendingCode(true);
    setError("");
    try {
      const supabase = createClient();
      const nextChallengeId = await createMfaChallenge(supabase, mfaFactor.id);
      setChallengeId(nextChallengeId);
      setCodeSent(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to send verification code",
      );
    } finally {
      setSendingCode(false);
    }
  };

  const verifyMFA = useCallback(
    async (codeFromInput?: string) => {
      if (!mfaFactor) return;
      const verifyCode = codeFromInput || code;
      if (verifyCode.length !== 6) return;

      setVerifying(true);
      setError("");
      try {
        const supabase = createClient();
        const currentChallengeId = await verifyMfaChallenge(supabase, {
          factorId: mfaFactor.id,
          challengeId,
          code: verifyCode,
        });
        setChallengeId(currentChallengeId);

        // Success - call the confirm callback
        await onConfirm();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Invalid code. Please try again.",
        );
        setCode("");
      } finally {
        setVerifying(false);
      }
    },
    [mfaFactor, code, challengeId, createClient, onConfirm],
  );

  const verifyPassword = async () => {
    if (!password) {
      setError("Please enter your password");
      return;
    }

    setVerifying(true);
    setError("");
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.email) {
        setError("Unable to verify password. Please try again.");
        return;
      }

      if (requireReauth) {
        // Re-authenticate with password
        const { error } = await supabase.auth.signInWithPassword({
          email: user.email,
          password,
        });

        if (error) {
          setError("Incorrect password");
          return;
        }
      }

      // Success - call the confirm callback
      await onConfirm();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to verify password. Please try again.",
      );
    } finally {
      setVerifying(false);
    }
  };

  const handleConfirm = () => {
    if (activeTab === "mfa") {
      verifyMFA();
    } else {
      verifyPassword();
    }
  };

  const isLoading = verifying || confirmLoading;
  const showCodeInput =
    activeTab === "mfa" && (mfaFactor?.type === "totp" || codeSent);
  const canSubmit =
    activeTab === "mfa" ? code.length === 6 : password.length > 0;

  const renderMFAContent = () => {
    if (!mfaFactor) return null;

    return (
      <div className="space-y-4">
        {/* Phone factor - need to send code first */}
        {mfaFactor.type === "phone" && !codeSent && (
          <Button onClick={sendCode} className="w-full" disabled={sendingCode}>
            {sendingCode && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send Verification Code
          </Button>
        )}

        {/* Show code input */}
        {showCodeInput && (
          <div className="space-y-2">
            <Label>
              {mfaFactor.type === "totp"
                ? "Enter the code from your authenticator app"
                : "Enter the code sent to your phone"}
            </Label>
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                pattern={REGEXP_ONLY_DIGITS}
                value={code}
                onChange={setCode}
                onComplete={verifyMFA}
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
        )}

        {mfaFactor.type === "phone" && codeSent && (
          <button
            type="button"
            onClick={sendCode}
            disabled={sendingCode}
            className="text-sm text-primary hover:underline disabled:opacity-50"
          >
            Resend code
          </button>
        )}
      </div>
    );
  };

  const renderPasswordContent = () => (
    <div className="space-y-2">
      <Label htmlFor="confirm-password">Enter your password</Label>
      <PasswordInput
        id="confirm-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={isLoading}
        autoFocus={activeTab === "password"}
        onKeyDown={(e) => {
          if (e.key === "Enter" && canSubmit) {
            handleConfirm();
          }
        }}
      />
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={["sm:max-w-sm", dialogContentClassName]
          .filter(Boolean)
          .join(" ")}
      >
        <DialogHeader className="text-left">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {showTabs ? (
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as "mfa" | "password")}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="mfa" className="gap-2">
                  <Smartphone className="h-4 w-4" />
                  Authenticator
                </TabsTrigger>
                <TabsTrigger value="password" className="gap-2">
                  <KeyRound className="h-4 w-4" />
                  Password
                </TabsTrigger>
              </TabsList>
              <TabsContent value="mfa" className="mt-4">
                {renderMFAContent()}
              </TabsContent>
              <TabsContent value="password" className="mt-4">
                {renderPasswordContent()}
              </TabsContent>
            </Tabs>
          ) : canUseMFA ? (
            renderMFAContent()
          ) : (
            renderPasswordContent()
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              variant={destructive ? "destructive" : "default"}
              onClick={handleConfirm}
              disabled={isLoading || !canSubmit}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {confirmText}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
