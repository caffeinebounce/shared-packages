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
  Input,
  Label,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@caffeinebounce/ui/primitives";
import { AlertTriangle, Info, Loader2, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import type { CreateClientFn } from "../../types";
import { ConfirmAccessDialog } from "./ConfirmAccessDialog";

export interface DeleteAccountSectionProps {
  /** Function to create a Supabase client */
  createClient: CreateClientFn;
  /** User's email address for confirmation */
  email: string;
  /** Optional retention days before permanent deletion (default: 30) */
  retentionDays?: number;
}

/**
 * DeleteAccountSection - Allow users to soft-delete their account
 *
 * This component provides a secure flow for account deletion with:
 * - MFA verification if user has MFA enabled
 * - Typed confirmation (user must type their email or "DELETE")
 * - Clear explanation of consequences
 *
 * @example
 * ```tsx
 * <DeleteAccountSection
 *   createClient={createClient}
 *   email={user.email}
 *   retentionDays={30}
 * />
 * ```
 */
export function DeleteAccountSection({
  createClient,
  email,
  retentionDays = 30,
}: DeleteAccountSectionProps) {
  const { logError } = useErrorLogger();
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [mfaDialogOpen, setMfaDialogOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mfaFactor, setMfaFactor] = useState<{
    id: string;
    type: "totp" | "phone";
  } | null>(null);

  // Check if user has MFA enabled
  const checkMFA = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data, error: mfaError } = await supabase.auth.mfa.listFactors();
      if (mfaError) {
        logError(mfaError, {
          component: "DeleteAccountSection",
          action: "checkMFAFactors",
        });
        toast.error("Unable to verify MFA status. Please try again.");
        return false;
      }

      const verifiedFactors = [
        ...(data.totp || []),
        ...(data.phone || []),
      ].filter((f) => f.status === "verified");

      if (verifiedFactors.length > 0) {
        const factor = verifiedFactors[0];
        setMfaFactor({
          id: factor.id,
          type: factor.factor_type as "totp" | "phone",
        });
        return true;
      }
      return false;
    } catch (err) {
      logError(err, {
        component: "DeleteAccountSection",
        action: "checkMFA",
      });
      toast.error("Unable to verify MFA status. Please try again.");
      return false;
    }
  }, [createClient, logError]);

  const handleDeleteClick = async () => {
    setError("");
    const hasMFA = await checkMFA();

    if (hasMFA) {
      // Show MFA dialog first
      setMfaDialogOpen(true);
    } else {
      // Show confirmation dialog directly
      setConfirmDialogOpen(true);
    }
  };

  const handleMfaConfirm = async () => {
    // MFA verified, now show confirmation dialog
    setMfaDialogOpen(false);
    setConfirmDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    // Validate confirmation text
    const normalizedConfirm = confirmText.trim();
    const normalizedEmail = email.trim();

    if (
      normalizedConfirm !== "DELETE" &&
      normalizedConfirm.toLowerCase() !== normalizedEmail.toLowerCase()
    ) {
      setError(
        `Please type "DELETE" or your email address (${email}) to confirm.`,
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Call the delete API
      const response = await fetch("/api/profile/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reason: "User requested account deletion",
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete account");
      }

      toast.success("Account deleted successfully");

      // Sign out and redirect
      const supabase = createClient();
      await supabase.auth.signOut({ scope: "global" });

      // Redirect to home page with a message
      window.location.href = "/?deleted=true";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete account");
      toast.error(
        err instanceof Error ? err.message : "Failed to delete account",
      );
    } finally {
      setLoading(false);
    }
  };

  // Reset state when dialogs close
  useEffect(() => {
    if (!confirmDialogOpen) {
      setConfirmText("");
      setError("");
    }
  }, [confirmDialogOpen]);

  return (
    <>
      {/* Main Delete Account Button */}
      <div className="rounded-lg border border-destructive/50 bg-destructive/5 px-4 py-4">
        <div className="flex items-start gap-4">
          <div className="rounded-md bg-destructive/10 p-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-foreground">Delete Account</h4>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <p>
                      Permanently deactivate your account. Your data will be
                      retained for {retentionDays} days before permanent
                      deletion.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteClick}
              className="gap-2 shrink-0 self-start sm:self-center hover:bg-destructive/90"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Confirm Access Dialog */}
      {mfaFactor && (
        <ConfirmAccessDialog
          createClient={createClient}
          open={mfaDialogOpen}
          onOpenChange={setMfaDialogOpen}
          onConfirm={handleMfaConfirm}
          verificationMethod="mfa"
          mfaFactor={mfaFactor}
          title="Verify Your Identity"
          description="For your security, please verify your identity before deleting your account."
          confirmText="Continue"
        />
      )}

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Account?
            </DialogTitle>
            <DialogDescription className="space-y-3 pt-2">
              <p>This action will have the following consequences:</p>
              <ul className="list-disc space-y-1 pl-5 text-sm">
                <li>Your account will be deactivated immediately</li>
                <li>You will be logged out of all sessions</li>
                <li>You will not be able to sign back in</li>
                <li>
                  Your data will be retained for {retentionDays} days before
                  permanent deletion
                </li>
                <li>
                  You can contact support within {retentionDays} days to restore
                  your account
                </li>
              </ul>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="confirm-delete">
                Type <strong>DELETE</strong> or your email address (
                <strong>{email}</strong>) to confirm
              </Label>
              <Input
                id="confirm-delete"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE"
                disabled={loading}
                autoComplete="off"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialogOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete My Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
