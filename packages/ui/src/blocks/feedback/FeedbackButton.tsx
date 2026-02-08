"use client";

import { MessageSquare } from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";

import { Button, type ButtonProps } from "../../components/ui/button";
import { cn } from "../../utils";
import { FeedbackDialog, type FeedbackSubmission } from "./FeedbackDialog";

export interface FeedbackButtonProps {
  /** Callback when feedback is submitted */
  onSubmit: (data: FeedbackSubmission) => Promise<void>;
  /** Keyboard shortcut key to open dialog (default: "f") */
  keyboardShortcut?: string;
  /** Whether to show the keyboard shortcut hint (default: true) */
  showKeyboardHint?: boolean;
  /** Button text (default: "Feedback") */
  buttonText?: string;
  /** Button variant (default: "ghost") */
  buttonVariant?: ButtonProps["variant"];
  /** Button size (default: "sm") */
  buttonSize?: ButtonProps["size"];
  /** Additional className for the button */
  buttonClassName?: string;
  /** User information to include with feedback */
  user?: { email: string };
  /** Current page path */
  currentPath?: string;
  /** Whether to capture screenshots (default: true) */
  captureScreenshot?: boolean;
  /** Whether to include session errors (default: true) */
  includeSessionErrors?: boolean;
  /** Session storage key for errors */
  sessionErrorsStorageKey?: string;
  /** Callback on successful submission */
  onSuccess?: () => void;
  /** Callback on submission error */
  onError?: (error: Error) => void;
  /** Optional component for displaying keyboard shortcut (e.g., Kbd) */
  ShortcutComponent?: ComponentType<{
    className?: string;
    children: ReactNode;
  }>;
  /** Whether keyboard shortcuts are visible based on user preference */
  shortcutsVisible?: boolean;
  /** Custom icon (default: MessageSquare) */
  icon?: ReactNode;
  /** Use pill/rounded-full styling (default: false) */
  pillStyle?: boolean;
}

/**
 * FeedbackButton - A button that opens the FeedbackDialog with keyboard shortcut support
 *
 * Features:
 * - Configurable keyboard shortcut (default: F key)
 * - Optional keyboard hint display
 * - Customizable styling including pill variant
 * - All FeedbackDialog features (screenshot capture, session errors, etc.)
 *
 * @example
 * ```tsx
 * // Basic usage
 * <FeedbackButton
 *   onSubmit={async (data) => {
 *     await fetch('/api/feedback', { method: 'POST', body: JSON.stringify(data) });
 *   }}
 *   user={{ email: user?.email }}
 *   currentPath={pathname}
 * />
 *
 * // With keyboard shortcut display
 * import { Kbd } from "@caffeinebounce/ui";
 *
 * <FeedbackButton
 *   onSubmit={handleSubmit}
 *   ShortcutComponent={Kbd}
 *   shortcutsVisible={showShortcuts}
 *   onSuccess={() => toast.success('Feedback submitted')}
 *   onError={(err) => toast.error(err.message)}
 * />
 *
 * // Pill style variant
 * <FeedbackButton
 *   onSubmit={handleSubmit}
 *   pillStyle
 *   buttonClassName="border border-border hover:bg-transparent hover:text-foreground text-muted-foreground"
 * />
 * ```
 */
export function FeedbackButton({
  onSubmit,
  keyboardShortcut = "f",
  showKeyboardHint = true,
  buttonText = "Feedback",
  buttonVariant = "ghost",
  buttonSize = "sm",
  buttonClassName,
  user,
  currentPath,
  captureScreenshot = true,
  includeSessionErrors = true,
  sessionErrorsStorageKey,
  onSuccess,
  onError,
  ShortcutComponent,
  shortcutsVisible = true,
  icon,
  pillStyle = false,
}: FeedbackButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  // Prevent rapid keyboard toggles that can cause flash/reopen (#834)
  const toggleInProgressRef = useRef(false);

  // Handle keyboard shortcut
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't trigger if any modifier keys are pressed (avoid conflicts with Ctrl+F, etc.)
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) {
        return;
      }

      // Don't trigger if user is typing in an input
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      // Check if the key matches (case-insensitive)
      if (e.key.toLowerCase() === keyboardShortcut.toLowerCase()) {
        e.preventDefault();
        
        // Guard against rapid toggles (debounce with ref)
        if (toggleInProgressRef.current) {
          return;
        }
        
        toggleInProgressRef.current = true;
        // Toggle dialog open/closed
        setDialogOpen((prev) => !prev);
        
        // Reset guard after a short delay to allow intentional re-toggles
        setTimeout(() => {
          toggleInProgressRef.current = false;
        }, 200);
      }
    },
    [keyboardShortcut],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const showShortcut =
    showKeyboardHint && shortcutsVisible && ShortcutComponent;
  const buttonIcon = icon ?? <MessageSquare className="h-4 w-4" />;

  return (
    <>
      <Button
        variant={buttonVariant}
        size={buttonSize}
        onClick={() => setDialogOpen(true)}
        className={cn(
          "gap-2",
          pillStyle && "rounded-full transition-colors group",
          buttonClassName,
        )}
      >
        <span
          className={cn(
            pillStyle && "transition-transform group-hover:scale-110",
          )}
        >
          {buttonIcon}
        </span>
        <span>{buttonText}</span>
        {showShortcut && (
          <ShortcutComponent className="ml-1">
            {keyboardShortcut.toUpperCase()}
          </ShortcutComponent>
        )}
      </Button>

      <FeedbackDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={onSubmit}
        user={user}
        currentPath={currentPath}
        captureScreenshot={captureScreenshot}
        includeSessionErrors={includeSessionErrors}
        sessionErrorsStorageKey={sessionErrorsStorageKey}
        onSuccess={onSuccess}
        onError={onError}
      />
    </>
  );
}
