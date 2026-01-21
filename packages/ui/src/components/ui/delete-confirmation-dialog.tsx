"use client";

import { AlertTriangle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { cn } from "../../utils/cn";
import { Button } from "./button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { Input } from "./input";

export interface DeleteConfirmationDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void;
  /** Name of the item being deleted (used in default description) */
  itemName?: string;
  /** Type of item being deleted (used in default description) */
  itemType?: string;
  /** Custom dialog title (default: "Delete {itemType}") */
  title?: string;
  /** Custom description (overrides itemName/itemType) */
  description?: React.ReactNode;
  /** Callback when deletion is confirmed - can be async */
  onConfirm: () => void | Promise<void>;
  /** Label for confirm button (default: "Delete") */
  confirmLabel?: string;
  /** Label for cancel button (default: "Cancel") */
  cancelLabel?: string;
  /** External loading state (for controlled loading) */
  isLoading?: boolean;
  /** Variant affects styling (default: "danger") */
  variant?: "danger" | "warning";
  /** Additional details shown below description */
  details?: string;
  /** Additional className for the dialog content */
  className?: string;
  /** Text user must type to confirm deletion (enables type-to-confirm mode) */
  confirmationText?: string;
}

/**
 * DeleteConfirmationDialog - A reusable dialog for confirming destructive actions
 *
 * @example
 * // Basic usage
 * <DeleteConfirmationDialog
 *   open={showDialog}
 *   onOpenChange={setShowDialog}
 *   itemName="Acme Inc"
 *   itemType="company"
 *   onConfirm={handleDelete}
 * />
 *
 * @example
 * // With async confirmation
 * <DeleteConfirmationDialog
 *   open={showDialog}
 *   onOpenChange={setShowDialog}
 *   itemName={user.email}
 *   itemType="user"
 *   onConfirm={async () => {
 *     await deleteUser(user.id);
 *     // Dialog closes automatically on success
 *   }}
 * />
 *
 * @example
 * // With custom description
 * <DeleteConfirmationDialog
 *   open={showDialog}
 *   onOpenChange={setShowDialog}
 *   title="Remove Team Member"
 *   description="This will remove John from the team and revoke their access."
 *   onConfirm={handleRemove}
 *   confirmLabel="Remove"
 * />
 *
 * @example
 * // With type-to-confirm for critical deletions
 * <DeleteConfirmationDialog
 *   open={showDialog}
 *   onOpenChange={setShowDialog}
 *   itemName="Production Database"
 *   itemType="database"
 *   confirmationText="DELETE"
 *   onConfirm={handleDelete}
 * />
 */
export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  itemName,
  itemType = "item",
  title,
  description,
  onConfirm,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  isLoading: externalLoading,
  variant = "danger",
  details,
  className,
  confirmationText,
}: DeleteConfirmationDialogProps) {
  const [internalLoading, setInternalLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const isLoading = externalLoading ?? internalLoading;

  const requiresConfirmation = !!confirmationText;
  const isConfirmed = !requiresConfirmation || inputValue === confirmationText;

  // Reset input when dialog closes
  useEffect(() => {
    if (!open) {
      setInputValue("");
    }
  }, [open]);

  const defaultTitle = title ?? `Delete ${itemType}`;

  const defaultDescription = itemName ? (
    <>
      Are you sure you want to delete{" "}
      <span className="font-semibold text-foreground">"{itemName}"</span>? This
      action cannot be undone.
    </>
  ) : (
    `Are you sure you want to delete this ${itemType}? This action cannot be undone.`
  );

  const handleConfirm = useCallback(async () => {
    if (!isConfirmed) return;
    try {
      setInternalLoading(true);
      await onConfirm();
      onOpenChange(false);
    } catch (_error) {
      // Let the caller handle errors via toast or other means
      // We don't close the dialog on error so user can retry
    } finally {
      setInternalLoading(false);
    }
  }, [onConfirm, onOpenChange, isConfirmed]);

  const handleCancel = useCallback(() => {
    if (!isLoading) {
      onOpenChange(false);
    }
  }, [isLoading, onOpenChange]);

  const handleDialogOpenChange = useCallback(
    (nextOpen: boolean) => {
      // Prevent closing the dialog via ESC key or overlay while loading
      if (isLoading && !nextOpen) {
        return;
      }
      onOpenChange(nextOpen);
    },
    [isLoading, onOpenChange],
  );

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className={cn("sm:max-w-[425px]", className)}>
        <DialogHeader>
          <DialogTitle
            className={cn(
              "flex items-center gap-2",
              variant === "danger" && "text-destructive",
              variant === "warning" && "text-amber-600 dark:text-amber-500",
            )}
          >
            <AlertTriangle
              className={cn(
                "size-5",
                variant === "danger" && "text-destructive",
                variant === "warning" && "text-amber-600 dark:text-amber-500",
              )}
            />
            {defaultTitle}
          </DialogTitle>
          <DialogDescription>
            {description ?? defaultDescription}
            {details && (
              <span className="mt-2 block text-sm text-muted-foreground/80">
                {details}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {requiresConfirmation && (
          <div className="space-y-2">
            <label
              htmlFor="delete-confirmation-input"
              className="text-sm text-muted-foreground"
            >
              Type{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-foreground">
                {confirmationText}
              </code>{" "}
              to confirm:
            </label>
            <Input
              id="delete-confirmation-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={confirmationText}
              autoComplete="off"
              onKeyDown={(e) => {
                if (e.key === "Enter" && isConfirmed && !isLoading) {
                  handleConfirm();
                }
              }}
            />
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={variant === "warning" ? "default" : "destructive"}
            onClick={handleConfirm}
            disabled={isLoading || !isConfirmed}
            className={cn(
              variant === "warning" &&
                "bg-amber-500 text-white hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700",
            )}
          >
            {isLoading ? `${confirmLabel}...` : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
