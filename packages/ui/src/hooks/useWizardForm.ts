"use client";

import { useCallback, useMemo, useState } from "react";
import type { StepStatus } from "../blocks/forms/FormWizard";

/**
 * Configuration for a wizard form step
 */
export interface WizardStep {
  /** Unique identifier for the step */
  id: string;
  /** Display label for the step */
  label: string;
  /** Fields that belong to this step (for validation) */
  fields: string[];
  /** Whether this step is optional (affects validation display) */
  optional?: boolean;
}

/**
 * Options for the useWizardForm hook
 */
export interface UseWizardFormOptions<TValues> {
  /** Array of step definitions */
  steps: WizardStep[];
  /** Function to validate a step by index, returns true if valid */
  validateStep: (stepIndex: number, values: TValues) => boolean;
  /** Function to get missing required fields for a step */
  getMissingFields?: (
    stepIndex: number,
    values: TValues,
  ) => string[];
  /** Function to check if a step has field-level errors (from form library) */
  stepHasFieldErrors?: (stepIndex: number) => boolean;
  /** Initial step index (default: 0) */
  initialStep?: number;
}

/**
 * Return type for useWizardForm hook
 */
export interface UseWizardFormReturn {
  // Navigation state
  /** Current step index (0-based) */
  currentStep: number;
  /** Total number of steps */
  totalSteps: number;
  /** Whether the current step is the first */
  isFirstStep: boolean;
  /** Whether the current step is the last */
  isLastStep: boolean;
  /** The highest step index the user has navigated to */
  highestStepReached: number;

  // Validation state
  /** Set of step indices where errors should be shown */
  stepsWithErrorsShown: Set<number>;
  /** Whether the user has attempted final form submission */
  hasAttemptedFinalSubmit: boolean;
  /** Array of step statuses for progress indicator */
  stepStatuses: StepStatus[];
  /** Whether any steps have incomplete or error status */
  hasIncompleteOrErrorSteps: boolean;

  // Navigation handlers
  /** Go to the next step (marks current step as having errors shown) */
  handleNext: () => void;
  /** Go to the previous step */
  handleBack: () => void;
  /** Go to a specific step by index */
  handleStepClick: (stepIndex: number) => void;

  // Submit handlers
  /** Mark form as submitted (shows all errors, validates all steps) */
  markAsSubmitted: () => void;
  /** Reset all navigation and validation state */
  resetWizardState: () => void;

  // Utility functions
  /** Check if errors should be shown for a specific step */
  shouldShowErrorsForStep: (stepIndex: number) => boolean;
  /** Get step status for a specific step */
  getStepStatus: (stepIndex: number) => StepStatus;
  /** Get tooltip content for a step (missing fields list) */
  getStepTooltip: (stepIndex: number, status: StepStatus) => string | null;
}

/**
 * Hook for managing multi-step wizard form state and navigation.
 *
 * This hook provides:
 * - Step navigation with tracking of visited steps
 * - Step validation status calculation
 * - Error display management (only show errors for visited steps)
 * - Submit state tracking
 *
 * @example
 * ```tsx
 * const wizard = useWizardForm({
 *   steps: [
 *     { id: "basic", label: "Basic Info", fields: ["name", "email"] },
 *     { id: "details", label: "Details", fields: ["description"] },
 *   ],
 *   validateStep: (stepIndex, values) => {
 *     if (stepIndex === 0) {
 *       return !!values.name && !!values.email;
 *     }
 *     return true;
 *   },
 *   getMissingFields: (stepIndex, values) => {
 *     const missing = [];
 *     if (stepIndex === 0) {
 *       if (!values.name) missing.push("Name");
 *       if (!values.email) missing.push("Email");
 *     }
 *     return missing;
 *   },
 * });
 *
 * // Use in FormWizard
 * <FormWizard
 *   steps={steps}
 *   currentStep={wizard.currentStep}
 *   onStepChange={wizard.handleStepClick}
 *   getStepStatus={wizard.getStepStatus}
 *   getStepTooltip={wizard.getStepTooltip}
 * >
 *   {children}
 * </FormWizard>
 * ```
 */
export function useWizardForm<TValues>(
  options: UseWizardFormOptions<TValues>,
  /** Current form values - pass this to trigger re-renders on value changes */
  currentValues: TValues,
): UseWizardFormReturn {
  const {
    steps,
    validateStep,
    getMissingFields,
    stepHasFieldErrors,
    initialStep = 0,
  } = options;

  // Navigation state
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [highestStepReached, setHighestStepReached] = useState(initialStep);

  // Validation state
  const [stepsWithErrorsShown, setStepsWithErrorsShown] = useState<Set<number>>(
    new Set(),
  );
  const [hasAttemptedFinalSubmit, setHasAttemptedFinalSubmit] = useState(false);

  const totalSteps = steps.length;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  // Calculate step statuses for progress indicator
  const stepStatuses = useMemo((): StepStatus[] => {
    return steps.map((step, index) => {
      const isCurrentStepIndex = index === currentStep;
      const isValid = validateStep(index, currentValues);
      const isOptional = step.optional ?? false;

      // Check if we should show errors for this step
      const shouldShowErrors =
        hasAttemptedFinalSubmit || stepsWithErrorsShown.has(index);

      // Only consider field-level errors when errors should be shown
      const hasFieldErrors =
        shouldShowErrors && stepHasFieldErrors?.(index);

      // Track navigation state
      const hasMovedPastThisStep = index < highestStepReached;
      const isFutureStep = index > highestStepReached;

      // Show errors for invalid steps when user has navigated away or attempted submit
      if (shouldShowErrors && (!isValid || hasFieldErrors)) {
        return "error";
      }

      // If it's a future step and we haven't attempted submit, it's not started
      // Optional steps that are technically "valid" (empty) should still show as not-started
      if (isFutureStep && !hasAttemptedFinalSubmit) {
        return "not-started";
      }

      // Step is complete if valid
      if (isValid) {
        return "complete";
      }

      // Show incomplete (yellow) only for steps user has moved forward past
      // and they're not currently on it
      if (hasMovedPastThisStep && !isCurrentStepIndex) {
        return "incomplete";
      }

      return "not-started";
    });
  }, [
    steps,
    currentStep,
    highestStepReached,
    hasAttemptedFinalSubmit,
    stepsWithErrorsShown,
    validateStep,
    stepHasFieldErrors,
    currentValues,
  ]);

  const hasIncompleteOrErrorSteps = useMemo(() => {
    return stepStatuses.some(
      (status) => status === "incomplete" || status === "error",
    );
  }, [stepStatuses]);

  // Navigation handlers
  const handleNext = useCallback(() => {
    // Mark current step as having errors shown (user is navigating away)
    setStepsWithErrorsShown((prev) => new Set(prev).add(currentStep));

    const nextStep = currentStep + 1;
    if (nextStep < totalSteps) {
      setCurrentStep(nextStep);
      setHighestStepReached((prev) => Math.max(prev, nextStep));
    }
  }, [currentStep, totalSteps]);

  const handleBack = useCallback(() => {
    if (!isFirstStep) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      // Reset highest step reached to clear future validation states
      setHighestStepReached(prevStep);
    }
  }, [currentStep, isFirstStep]);

  const handleStepClick = useCallback(
    (stepIndex: number) => {
      // Mark current step as having errors shown (user is navigating away)
      if (stepIndex !== currentStep) {
        setStepsWithErrorsShown((prev) => new Set(prev).add(currentStep));
      }

      setCurrentStep(stepIndex);

      // Update highest step reached
      if (stepIndex > highestStepReached) {
        // Clicking forward - extend validation range
        setHighestStepReached(stepIndex);
      } else if (stepIndex < currentStep) {
        // Clicking backward - reset validation range to clear future states
        setHighestStepReached(stepIndex);
      }
    },
    [currentStep, highestStepReached],
  );

  // Submit handlers
  const markAsSubmitted = useCallback(() => {
    setHasAttemptedFinalSubmit(true);
  }, []);

  const resetWizardState = useCallback(() => {
    setCurrentStep(initialStep);
    setHighestStepReached(initialStep);
    setStepsWithErrorsShown(new Set());
    setHasAttemptedFinalSubmit(false);
  }, [initialStep]);

  // Utility functions
  const shouldShowErrorsForStep = useCallback(
    (stepIndex: number): boolean => {
      return hasAttemptedFinalSubmit || stepsWithErrorsShown.has(stepIndex);
    },
    [hasAttemptedFinalSubmit, stepsWithErrorsShown],
  );

  const getStepStatus = useCallback(
    (stepIndex: number): StepStatus => stepStatuses[stepIndex],
    [stepStatuses],
  );

  const getStepTooltip = useCallback(
    (stepIndex: number, status: StepStatus): string | null => {
      if (status !== "error" && status !== "incomplete") return null;

      if (!getMissingFields) return null;

      const missingFields = getMissingFields(stepIndex, currentValues);
      if (missingFields.length === 0) return null;

      return `${missingFields.length} required field${missingFields.length > 1 ? "s" : ""} missing:\n• ${missingFields.join("\n• ")}`;
    },
    [getMissingFields, currentValues],
  );

  return {
    // Navigation state
    currentStep,
    totalSteps,
    isFirstStep,
    isLastStep,
    highestStepReached,

    // Validation state
    stepsWithErrorsShown,
    hasAttemptedFinalSubmit,
    stepStatuses,
    hasIncompleteOrErrorSteps,

    // Navigation handlers
    handleNext,
    handleBack,
    handleStepClick,

    // Submit handlers
    markAsSubmitted,
    resetWizardState,

    // Utility functions
    shouldShowErrorsForStep,
    getStepStatus,
    getStepTooltip,
  };
}
