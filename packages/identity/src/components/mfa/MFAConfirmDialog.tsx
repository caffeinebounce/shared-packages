"use client";

import type { CreateClientFn } from "../../types";
import { ConfirmAccessDialog } from "../security/ConfirmAccessDialog";

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
  return (
    <ConfirmAccessDialog
      createClient={createClient}
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      verificationMethod="mfa"
      mfaFactor={{ id: factorId, type: factorType }}
      title={title}
      description={description}
      confirmText={confirmText}
      confirmLoading={confirmLoading}
      destructive={true}
      dialogContentClassName="sm:max-w-md"
    />
  );
}
