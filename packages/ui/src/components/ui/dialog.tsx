"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type * as React from "react";

import { cn } from "../../utils";

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className,
      )}
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  onInteractOutside,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content>) {
  // Handle password manager extensions (1Password, LastPass, etc.) that inject UI
  // These elements are outside the dialog but should not trigger close
  const handleInteractOutside: React.ComponentProps<
    typeof DialogPrimitive.Content
  >["onInteractOutside"] = (event) => {
    const target = event.target as HTMLElement;

    // Check if the click is on the AI assistant
    const isAiAssistant = target.closest("[data-ai-assistant]");
    if (isAiAssistant) {
      event.preventDefault();
      return;
    }

    // Check if the click is on a password manager element
    const isPasswordManager =
      // 1Password
      target.closest("[data-1p-hint]") ||
      target.closest('[class*="com-1password"]') ||
      target.tagName === "COM-1PASSWORD-BUTTON" ||
      target.closest("com-1password-button") ||
      target.closest('[class*="1password"]') ||
      // LastPass
      target.closest('[class*="lastpass"]') ||
      target.closest("[data-lpignore]") ||
      target.closest('[id*="lastpass"]') ||
      // Bitwarden
      target.closest('[class*="bit-"]') ||
      target.closest('[class*="bitwarden"]') ||
      // Dashlane
      target.closest('[class*="dashlane"]') ||
      target.closest("[data-dashlane]") ||
      // Keeper
      target.closest('[class*="keeper"]') ||
      // NordPass
      target.closest('[class*="nordpass"]') ||
      // RoboForm
      target.closest('[class*="roboform"]') ||
      // Chrome/Edge built-in password manager
      target.closest('[class*="credential"]') ||
      target.closest("[data-credentials-form]") ||
      // Safari password manager
      target.closest('[class*="password-assistant"]') ||
      // Firefox password manager
      target.closest('[class*="ac-popup"]') ||
      // Generic autofill detection
      target.closest('[class*="autofill"]') ||
      target.closest("[data-autofill]");

    if (isPasswordManager) {
      event.preventDefault();
      return;
    }

    // Call the original handler if provided
    onInteractOutside?.(event);
  };

  return (
    <DialogPortal>
      <DialogOverlay />
      {/* Flexbox centering wrapper - avoids transform conflicts with animate-in */}
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <DialogPrimitive.Content
          data-slot="dialog-content"
          className={cn(
            "pointer-events-auto grid w-full max-w-lg gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-top-[2%] data-[state=open]:slide-in-from-top-[2%] sm:rounded-lg",
            className,
          )}
          onInteractOutside={handleInteractOutside}
          {...props}
        >
          {children}
          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </div>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn(
        "flex flex-col space-y-1.5 text-center sm:text-left",
        className,
      )}
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
        className,
      )}
      {...props}
    />
  );
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(
        "text-lg font-semibold leading-none tracking-tight",
        className,
      )}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
