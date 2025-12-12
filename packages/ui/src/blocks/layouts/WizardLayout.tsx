"use client";

import { AlertCircle } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import {
  AutoSaveIndicator,
  type SaveStatus,
} from "../../components/ui/auto-save-indicator";
import { ProgressBar } from "../../components/ui/progress-bar";
import { Stepper, type StepperStep } from "../../components/ui/stepper";
import { TimeEstimate } from "../../components/ui/time-estimate";
import { cn } from "../../utils";

export interface WizardLayoutProps {
  children: ReactNode;
  steps: StepperStep[];
  currentStep: string;
  completedSteps: string[];
  onStepClick?: (stepId: string) => void;
  /** Progress percentage (0-100) */
  progress: number;
  /** Time remaining estimate */
  timeRemaining?: number;
  /** Save status for auto-save indicator */
  saveStatus?: SaveStatus;
  /** Optional deadline info */
  deadline?: {
    label: string;
    daysRemaining: number | null;
  };
  /** Whether the wizard has been submitted/completed */
  isSubmitted?: boolean;
  /** Custom submitted banner title */
  submittedTitle?: string;
  /** Custom submitted banner subtitle */
  submittedSubtitle?: string;
  /** Loading state */
  loading?: boolean;
  /** Custom loading message */
  loadingMessage?: string;
  /** Error state */
  error?: string;
  className?: string;
}

export function WizardLayout({
  children,
  steps,
  currentStep,
  completedSteps,
  onStepClick,
  progress,
  timeRemaining,
  saveStatus = "idle",
  deadline,
  isSubmitted = false,
  submittedTitle = "Your application has been submitted",
  submittedSubtitle = "You will receive an email confirmation shortly.",
  loading = false,
  loadingMessage = "Loading...",
  error,
  className,
}: WizardLayoutProps) {
  // Calculate days remaining client-side to avoid hydration mismatch
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);
  useEffect(() => {
    if (deadline?.daysRemaining !== undefined) {
      setDaysRemaining(deadline.daysRemaining);
    }
  }, [deadline?.daysRemaining]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">
          {loadingMessage}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className={cn("max-w-4xl mx-auto px-4 py-8", className)}>
      {/* Header with deadline info */}
      {deadline && (
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">{deadline.label}</h1>
          {daysRemaining !== null && daysRemaining <= 7 && !isSubmitted && (
            <div
              className={cn(
                "text-sm",
                daysRemaining <= 1
                  ? "text-destructive font-medium"
                  : "text-amber-600",
              )}
            >
              {daysRemaining <= 0
                ? "Applications close today!"
                : daysRemaining === 1
                  ? "1 day remaining to submit"
                  : `${daysRemaining} days remaining to submit`}
            </div>
          )}
        </div>
      )}

      {/* Progress section */}
      {!isSubmitted && (
        <div className="mb-8 space-y-4">
          <div className="flex items-center justify-between">
            <ProgressBar value={progress} size="md" />
            <AutoSaveIndicator status={saveStatus} className="ml-4" />
          </div>
          {timeRemaining !== undefined && (
            <TimeEstimate minutes={timeRemaining} />
          )}
        </div>
      )}

      {/* Stepper */}
      <Stepper
        steps={steps}
        currentStep={currentStep}
        completedSteps={isSubmitted ? steps.map((s) => s.id) : completedSteps}
        onStepClick={isSubmitted ? undefined : onStepClick}
        className="mb-8"
      />

      {/* Submitted banner */}
      {isSubmitted && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-green-800 dark:text-green-200 font-medium">
            ✓ {submittedTitle}
          </p>
          <p className="text-sm text-green-600 dark:text-green-400 mt-1">
            {submittedSubtitle}
          </p>
        </div>
      )}

      {/* Step content */}
      <div className="bg-card border rounded-lg p-6">{children}</div>
    </div>
  );
}
