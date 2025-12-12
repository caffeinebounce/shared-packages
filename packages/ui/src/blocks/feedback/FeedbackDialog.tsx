"use client";

import { MessageSquare, Send } from "lucide-react";
import { useState } from "react";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Textarea } from "../../components/ui/textarea";

export interface FeedbackDialogProps {
  /** Callback when feedback is submitted */
  onSubmit?: (feedback: string) => Promise<void> | void;
  /** Custom trigger element */
  trigger?: React.ReactNode;
  /** Whether to show the trigger icon */
  showIcon?: boolean;
  /** Trigger variant */
  variant?: "default" | "outline" | "ghost";
  /** Size of the trigger button */
  size?: "sm" | "default" | "lg";
}

/**
 * FeedbackDialog - A reusable feedback dialog component
 *
 * Provides a simple way for users to submit feedback with a text area.
 *
 * @example
 * ```tsx
 * <FeedbackDialog onSubmit={async (feedback) => {
 *   await fetch('/api/feedback', { method: 'POST', body: JSON.stringify({ feedback }) });
 * }} />
 * ```
 */
export function FeedbackDialog({
  onSubmit,
  trigger,
  showIcon = true,
  variant = "outline",
  size = "sm",
}: FeedbackDialogProps) {
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!feedback.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit?.(feedback);
      setFeedback("");
      setOpen(false);
    } catch (error) {
      console.error("Failed to submit feedback:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant={variant} size={size}>
            {showIcon && <MessageSquare className="h-4 w-4" />}
            <span className={showIcon ? "ml-2" : ""}>Feedback</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Feedback</DialogTitle>
          <DialogDescription>
            Help us improve by sharing your thoughts, suggestions, or reporting
            issues.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Textarea
            placeholder="Share your feedback here..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={5}
            className="resize-none"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!feedback.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <>Submitting...</>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Submit
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
