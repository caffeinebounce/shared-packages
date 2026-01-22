"use client";

import { Camera, Send, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { Spinner } from "../../components/ui/spinner";
import { Textarea } from "../../components/ui/textarea";
import {
  type SessionError,
  useSessionErrors,
} from "../../hooks/useSessionErrors";

/**
 * Data structure for feedback submission
 */
export interface FeedbackSubmission {
  /** The user's feedback text */
  feedback: string;
  /** Current page path */
  page: string;
  /** Base64 encoded screenshot (JPEG) or null if capture failed/disabled */
  screenshot: string | null;
  /** Viewport dimensions at time of submission */
  viewport: { width: number; height: number };
  /** Browser user agent string */
  userAgent: string;
  /** Session errors captured during the session, or null if none/disabled */
  sessionErrors: SessionError[] | null;
  /** User information if provided */
  user?: { email: string };
  /** ISO timestamp of submission */
  timestamp: string;
}

export interface FeedbackDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when dialog open state changes */
  onOpenChange: (open: boolean) => void;
  /** Callback when feedback is submitted with full submission data */
  onSubmit: (data: FeedbackSubmission) => Promise<void>;
  /** Optional user information to include with feedback */
  user?: { email: string };
  /** Current page path (optional, will be passed to onSubmit) */
  currentPath?: string;
  /** Whether to capture a screenshot when dialog opens (default: true) */
  captureScreenshot?: boolean;
  /** Whether to include session errors in submission (default: true) */
  includeSessionErrors?: boolean;
  /** Callback on successful submission (after onSubmit resolves) */
  onSuccess?: () => void;
  /** Callback on submission error */
  onError?: (error: Error) => void;
  /** Session storage key for errors (default: "session_errors") */
  sessionErrorsStorageKey?: string;
}

/**
 * FeedbackDialog - A full-featured feedback dialog with screenshot capture
 *
 * Features:
 * - Automatic screenshot capture when dialog opens (using html2canvas-pro)
 * - Session error tracking (captures window errors and unhandled rejections)
 * - Viewport and user agent information
 * - Configurable callbacks for submission, success, and error handling
 *
 * @example
 * ```tsx
 * const [open, setOpen] = useState(false);
 *
 * <FeedbackDialog
 *   open={open}
 *   onOpenChange={setOpen}
 *   onSubmit={async (data) => {
 *     await fetch('/api/feedback', {
 *       method: 'POST',
 *       headers: { 'Content-Type': 'application/json' },
 *       body: JSON.stringify(data),
 *     });
 *   }}
 *   user={{ email: user?.email }}
 *   currentPath={pathname}
 *   onSuccess={() => toast.success('Feedback submitted')}
 *   onError={(err) => toast.error(err.message)}
 * />
 * ```
 */
export function FeedbackDialog({
  open,
  onOpenChange,
  onSubmit,
  user,
  currentPath = "",
  captureScreenshot = true,
  includeSessionErrors = true,
  onSuccess,
  onError,
  sessionErrorsStorageKey,
}: FeedbackDialogProps) {
  const { getErrors, clearErrors } = useSessionErrors({
    storageKey: sessionErrorsStorageKey,
  });

  const [feedbackText, setFeedbackText] = useState("");
  const [screenshotDataUrl, setScreenshotDataUrl] = useState<string | null>(
    null,
  );
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [screenshotError, setScreenshotError] = useState(false);

  // Capture screenshot when dialog opens
  const captureScreenshotFn = useCallback(async () => {
    if (typeof window === "undefined" || !captureScreenshot) return;

    setIsCapturing(true);
    try {
      // Dynamic import to reduce bundle size
      // Use html2canvas-pro which supports modern CSS colors (oklch, etc.)
      const html2canvas = (await import("html2canvas-pro")).default;

      // Hide the entire dialog portal for screenshot
      // Radix portals are appended to document.body with specific attributes
      const elementsToHide: HTMLElement[] = [];

      // Find all portal, dialog, and overlay elements
      document
        .querySelectorAll(
          "[data-radix-portal], [data-radix-dialog-overlay], [data-radix-dialog-content], [role='dialog'], [data-state='open'], .fixed.inset-0, [data-radix-dialog-backdrop]",
        )
        .forEach((el) => {
          const htmlEl = el as HTMLElement;
          elementsToHide.push(htmlEl);
          // Store original styles to restore later
          htmlEl.dataset.originalDisplay = htmlEl.style.display;
          htmlEl.dataset.originalVisibility = htmlEl.style.visibility;
          htmlEl.dataset.originalOpacity = htmlEl.style.opacity;
          // Aggressively hide
          htmlEl.style.display = "none";
          htmlEl.style.visibility = "hidden";
          htmlEl.style.opacity = "0";
        });

      // Small delay to ensure dialog is fully hidden and repaint occurs
      await new Promise((resolve) => setTimeout(resolve, 100));

      const canvas = await html2canvas(document.body, {
        useCORS: true,
        allowTaint: true,
        logging: false,
        scale: window.devicePixelRatio || 1,
        backgroundColor: "#ffffff",
        foreignObjectRendering: false,
        ignoreElements: (el) => {
          // Completely ignore the dialog portal, overlays, and all their children
          if (el.hasAttribute("data-radix-portal")) return true;
          if (el.hasAttribute("data-radix-dialog-overlay")) return true;
          if (el.hasAttribute("data-radix-dialog-content")) return true;
          if (el.hasAttribute("data-radix-dialog-backdrop")) return true;
          if (el.getAttribute("data-state") === "open") return true;
          if (el.getAttribute("role") === "dialog") return true;
          if (el.closest("[data-radix-portal]")) return true;
          // Also ignore fixed overlay elements (common backdrop pattern)
          if (
            el instanceof HTMLElement &&
            el.classList.contains("fixed") &&
            el.classList.contains("inset-0")
          ) {
            return true;
          }
          return false;
        },
      });

      // Restore dialog visibility
      elementsToHide.forEach((el) => {
        el.style.display = el.dataset.originalDisplay || "";
        el.style.visibility = el.dataset.originalVisibility || "";
        el.style.opacity = el.dataset.originalOpacity || "";
        // Clean up data attributes
        delete el.dataset.originalDisplay;
        delete el.dataset.originalVisibility;
        delete el.dataset.originalOpacity;
      });

      const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
      setScreenshotDataUrl(dataUrl);
    } catch (error) {
      console.error("[FeedbackDialog] Screenshot capture failed:", error);
      setScreenshotError(true);
    } finally {
      setIsCapturing(false);
    }
  }, [captureScreenshot]);

  // Capture screenshot when dialog opens
  useEffect(() => {
    if (open && captureScreenshot && !screenshotDataUrl && !screenshotError) {
      captureScreenshotFn();
    }
  }, [
    open,
    captureScreenshot,
    screenshotDataUrl,
    screenshotError,
    captureScreenshotFn,
  ]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setFeedbackText("");
      setScreenshotDataUrl(null);
      setScreenshotError(false);
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!feedbackText.trim()) return;

    setIsSubmitting(true);
    try {
      const sessionErrors = includeSessionErrors ? getErrors() : [];

      const submission: FeedbackSubmission = {
        feedback: feedbackText.trim(),
        page: currentPath,
        screenshot: screenshotDataUrl,
        viewport: {
          width: typeof window !== "undefined" ? window.innerWidth : 0,
          height: typeof window !== "undefined" ? window.innerHeight : 0,
        },
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
        sessionErrors: sessionErrors.length > 0 ? sessionErrors : null,
        user,
        timestamp: new Date().toISOString(),
      };

      await onSubmit(submission);

      // Clear session errors after successful submission
      if (includeSessionErrors) {
        clearErrors();
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      onError?.(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSubmitDisabled =
    !feedbackText.trim() ||
    isCapturing ||
    (captureScreenshot && !screenshotDataUrl && !screenshotError) ||
    isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="relative sm:max-w-[500px]">
        <DialogClose className="absolute right-4 top-4 z-50 rounded-sm opacity-100 ring-offset-background transition-opacity hover:opacity-70 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogClose>
        <DialogHeader>
          <DialogTitle>Send Feedback</DialogTitle>
          <DialogDescription>
            Help us improve by sharing your feedback, bug reports, or
            suggestions.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Feedback text */}
          <div className="space-y-2">
            <Label htmlFor="feedback">What&apos;s on your mind?</Label>
            <Textarea
              id="feedback"
              placeholder="Describe your feedback, issue, or suggestion..."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Screenshot preview - hidden if capture failed or disabled */}
          {captureScreenshot && !screenshotError && (
            <div className="space-y-2">
              <Label>Screenshot</Label>
              <div className="rounded-lg border bg-muted/50 p-2">
                {isCapturing ? (
                  <div className="flex items-center justify-center h-24 text-muted-foreground">
                    <Camera className="h-4 w-4 mr-2 animate-pulse" />
                    <span className="text-sm">Capturing screenshot...</span>
                  </div>
                ) : screenshotDataUrl ? (
                  <img
                    src={screenshotDataUrl}
                    alt="Screenshot preview"
                    className="w-full h-auto rounded max-h-32 object-contain"
                  />
                ) : (
                  <div className="flex items-center justify-center h-24 text-muted-foreground">
                    <span className="text-sm">Preparing screenshot...</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* User info */}
          {user && (
            <p className="text-xs text-muted-foreground">
              Submitting as {user.email}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitDisabled}>
            {isSubmitting ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Feedback
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
