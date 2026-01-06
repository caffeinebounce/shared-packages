"use client";

import { useCallback, useMemo, useState } from "react";
import type { StepStatus } from "../blocks/forms/FormWizard";

/**
 * Generic form interface for data restoration helper.
 * Compatible with TanStack Form's useForm return type.
 * Uses generic function signatures to accept TanStack Form's complex type structure.
 */
export interface FormWithSetFieldValue<_TValues> {
  // biome-ignore lint/suspicious/noExplicitAny: TanStack Form uses complex template literal types for field names
  setFieldValue: (field: any, value: any) => void;
  // biome-ignore lint/suspicious/noExplicitAny: TanStack Form uses complex template literal types for field names
  validateField: (field: any, trigger: "change" | "blur") => void;
}

/**
 * Creates a data restoration handler for multi-step wizard forms.
 *
 * This utility handles the complex pattern of restoring persisted data
 * to a TanStack Form, which requires special timing due to unmounted fields.
 *
 * @param form - The form instance with setFieldValue and validateField methods
 * @param onComplete - Optional callback after restoration is complete
 * @returns A handler function to pass to FormWizard's onDataRestored prop
 *
 * @example
 * ```tsx
 * const form = useForm({ ... });
 * const handleDataRestored = createDataRestorationHandler(form, () => {
 *   console.log("Data restored!");
 * });
 *
 * <FormWizard onDataRestored={handleDataRestored}>
 *   ...
 * </FormWizard>
 * ```
 */
export function createDataRestorationHandler<
  TValues extends Record<string, unknown>,
>(
  form: FormWithSetFieldValue<TValues>,
  defaultValues: TValues,
  onComplete?: () => void,
): (data: Partial<TValues>) => void {
  return (data: Partial<TValues>) => {
    // Clean up the data: remove 'values' property if it exists and use the top-level data
    // This fixes an issue where nested 'values' property (containing empty defaults)
    // was being prioritized over the actual data.
    // At runtime, restored data may include an extra `values` wrapper; we intentionally strip it.
    const dataWithPossibleValues = data as Partial<TValues> & {
      values?: unknown;
    };
    const { values: _ignoredValues, ...cleanData } = dataWithPossibleValues;

    // If the clean data is empty (e.g. only had values property), fallback to data
    // Cast to Partial<TValues> to satisfy TypeScript
    const actualData: Partial<TValues> =
      Object.keys(cleanData).length > 0
        ? (cleanData as Partial<TValues>)
        : data;

    // Merge with defaults, preferring actual data values
    const newValues = { ...defaultValues } as TValues;
    const keys = Object.keys(defaultValues) as (keyof TValues)[];

    for (const key of keys) {
      const restoredValue = actualData[key];
      // Only use restored value if it's not null/undefined
      // (empty strings like "" are valid for optional fields)
      if (restoredValue !== undefined && restoredValue !== null) {
        newValues[key] = restoredValue as TValues[keyof TValues];
      }
    }

    // Use requestAnimationFrame to ensure DOM is ready after React renders
    // This is necessary because some fields (like Select on different steps)
    // may not be mounted when setFieldValue is called
    requestAnimationFrame(() => {
      for (const key of keys) {
        form.setFieldValue(key, newValues[key]);
      }

      // Validate after a short delay to ensure form state has settled
      setTimeout(() => {
        for (const key of keys) {
          form.validateField(key, "change");
        }
        onComplete?.();
      }, 100);
    });
  };
}

/**
 * Extracts human-readable error messages from a Zod validation result.
 *
 * @param zodResult - The result from calling `zodSchema.safeParse(values)`
 * @param fieldFilter - Optional array of field names to filter errors by
 * @returns Array of formatted error messages
 *
 * @example
 * ```tsx
 * const result = stepSchema.safeParse(values);
 * const errors = extractZodErrors(result);
 * // ["Company Name is required", "Email must be valid"]
 *
 * // Or filter by specific fields:
 * const errors = extractZodErrors(result, ["name", "email"]);
 * ```
 */
export function extractZodErrors(
  zodResult: {
    success: boolean;
    error?: { issues: Array<{ path: (string | number)[]; message: string }> };
  },
  fieldFilter?: string[],
): string[] {
  if (zodResult.success || !zodResult.error) {
    return [];
  }

  const issues = zodResult.error.issues;

  // If no filter, return all error messages
  if (!fieldFilter) {
    return issues.map((issue) => issue.message);
  }

  // Filter to only include errors for specified fields
  return issues
    .filter((issue) => {
      const fieldName = issue.path[0];
      return typeof fieldName === "string" && fieldFilter.includes(fieldName);
    })
    .map((issue) => issue.message);
}

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
 * Generic interface for form field metadata (compatible with TanStack Form)
 */
export interface FieldMeta {
  errors?: string[];
}

/**
 * Generic form interface for wizard utilities.
 * Compatible with TanStack Form's useForm return type.
 * Uses generic function signatures to accept TanStack Form's complex type structure.
 */
export interface WizardFormInstance<_TValues extends Record<string, unknown>> {
  // biome-ignore lint/suspicious/noExplicitAny: TanStack Form uses complex template literal types for field names
  setFieldValue: (field: any, value: any) => void;
  // biome-ignore lint/suspicious/noExplicitAny: TanStack Form uses complex template literal types for field names
  validateField: (field: any, trigger: "change" | "blur") => void;
  validateAllFields: (trigger: "change" | "blur") => void;
  reset: () => void;
  handleSubmit: () => void | Promise<void>;
}

/**
 * Creates a stepHasFieldErrors checker function from form field metadata.
 *
 * This utility checks if any fields in a step have validation errors
 * based on the form's fieldMeta state.
 *
 * @param steps - Array of step configurations with field mappings
 * @param formFieldMeta - Form's field metadata (from useStore)
 * @returns A function that checks if a step has field errors
 *
 * @example
 * ```tsx
 * const formFieldMeta = useStore(form.store, (state) => state.fieldMeta);
 * const stepHasFieldErrors = createStepHasFieldErrors(steps, formFieldMeta);
 *
 * // Use in useWizardForm
 * const wizard = useWizardForm({ steps, stepHasFieldErrors, ... }, values);
 * ```
 */
export function createStepHasFieldErrors<
  TFieldMeta extends Record<string, FieldMeta | undefined>,
>(
  steps: WizardStep[],
  formFieldMeta: TFieldMeta,
): (stepIndex: number) => boolean {
  return (stepIndex: number): boolean => {
    const fields = steps[stepIndex]?.fields ?? [];
    for (const fieldName of fields) {
      const meta = formFieldMeta[fieldName];
      if (meta?.errors && meta.errors.length > 0) {
        return true;
      }
    }
    return false;
  };
}

/**
 * Creates a form reset handler that resets both form state and wizard state.
 *
 * This utility provides a consistent pattern for resetting multi-step forms:
 * 1. Resets TanStack Form state (clears errors and dirty state)
 * 2. Resets all fields to default values
 * 3. Resets wizard navigation state
 *
 * @param form - The form instance
 * @param defaultValues - Default values to reset fields to
 * @param resetWizardState - Function to reset wizard state
 * @param clearSubmitError - Optional function to clear submit error state
 * @returns A handler function to reset the entire form
 *
 * @example
 * ```tsx
 * const handleReset = createFormResetHandler(
 *   form,
 *   defaultValues,
 *   wizard.resetWizardState,
 *   () => setSubmitError(null)
 * );
 * ```
 */
export function createFormResetHandler<TValues extends Record<string, unknown>>(
  form: WizardFormInstance<TValues>,
  defaultValues: TValues,
  resetWizardState: () => void,
  clearSubmitError?: () => void,
): () => void {
  return () => {
    // Reset TanStack Form state (clears errors and dirty state)
    form.reset();

    // Reset all form fields to default values
    const keys = Object.keys(defaultValues) as (keyof TValues)[];
    for (const key of keys) {
      form.setFieldValue(key, defaultValues[key]);
    }

    // Reset wizard state (step, progress, errors)
    resetWizardState();

    // Clear any submit errors
    clearSubmitError?.();
  };
}

/**
 * Options for the form submit handler
 */
export interface FormSubmitHandlerOptions {
  /** Function to validate a specific step */
  validateStep: (stepIndex: number) => boolean;
  /** Total number of steps */
  totalSteps: number;
  /** Error logger instance (from @caffeinebounce/logger) */
  errorLogger?: {
    logError: (error: Error, context: Record<string, unknown>) => void;
  };
  /** Component name for error logging */
  componentName: string;
  /** Current step statuses for logging */
  getStepStatuses?: () => unknown[];
}

/**
 * Creates a form submission handler with validation and error handling.
 *
 * This utility provides a consistent pattern for form submission:
 * 1. Marks the wizard as submitted (triggers error display)
 * 2. Validates all form fields
 * 3. Checks if all steps are valid
 * 4. If invalid, shows error message and logs
 * 5. If valid, submits the form
 *
 * @param form - The form instance
 * @param markAsSubmitted - Function to mark wizard as submitted
 * @param setSubmitError - Function to set submit error state
 * @param options - Configuration options
 * @returns A handler function for form submission
 *
 * @example
 * ```tsx
 * const handleSubmit = createFormSubmitHandler(
 *   form,
 *   wizard.markAsSubmitted,
 *   setSubmitError,
 *   {
 *     validateStep,
 *     totalSteps: sections.length,
 *     errorLogger,
 *     componentName: "CompanyForm",
 *     getStepStatuses: () => wizard.stepStatuses,
 *   }
 * );
 * ```
 */
export function createFormSubmitHandler<
  TValues extends Record<string, unknown>,
>(
  form: WizardFormInstance<TValues>,
  markAsSubmitted: () => void,
  setSubmitError: (error: string | null) => void,
  options: FormSubmitHandlerOptions,
): () => void | Promise<void> {
  const {
    validateStep,
    totalSteps,
    errorLogger,
    componentName,
    getStepStatuses,
  } = options;

  return () => {
    markAsSubmitted();
    // Validate all fields
    form.validateAllFields("change");

    // Check if all steps are valid
    const allValid = Array.from({ length: totalSteps }, (_, i) => i).every(
      (index) => validateStep(index),
    );

    if (!allValid) {
      // Stay on current step and show error message - don't navigate away
      setSubmitError("Please fix the errors in the highlighted sections.");
      errorLogger?.logError(new Error(`${componentName} validation failed`), {
        component: componentName,
        action: "submit",
        metadata: { stepStatuses: getStepStatuses?.() },
      });
      // Note: Toast should be handled by the caller if needed
      return;
    }

    // All valid, submit the form
    return form.handleSubmit();
  };
}

/**
 * Options for the useWizardForm hook
 */
export interface UseWizardFormOptions<TValues> {
  /** Array of step definitions */
  steps: WizardStep[];
  /** Function to validate a step by index, returns true if valid */
  validateStep: (stepIndex: number, values: TValues) => boolean;
  /** Function to get validation errors with actual error messages for a step */
  getStepErrors?: (stepIndex: number, values: TValues) => string[];
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
  /** Whether the current step is valid (passes validation) */
  isCurrentStepValid: boolean;

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
  /** Get tooltip content for a step (error messages) */
  getStepTooltip: (stepIndex: number, status: StepStatus) => string | null;
  /** Get field names for a specific step */
  getStepFields: (stepIndex: number) => string[];
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
 *     if (stepIndex === 0) return !!values.name && !!values.email;
 *     return true;
 *   },
 *   getStepErrors: (stepIndex, values) => {
 *     const errors = [];
 *     if (stepIndex === 0) {
 *       if (!values.name) errors.push("Name is required");
 *       if (!values.email) errors.push("Email is required");
 *     }
 *     return errors;
 *   },
 * }, formValues);
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
    getStepErrors,
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
      // Note: isOptional is available if needed for future enhancements
      const _isOptional = step.optional ?? false;

      // Check if we should show errors for this step
      const shouldShowErrors =
        hasAttemptedFinalSubmit || stepsWithErrorsShown.has(index);

      // Only consider field-level errors when errors should be shown
      const hasFieldErrors = shouldShowErrors && stepHasFieldErrors?.(index);

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

  // Determine if current step is valid
  const isCurrentStepValid = useMemo(() => {
    return validateStep(currentStep, currentValues);
  }, [validateStep, currentStep, currentValues]);

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
    // Don't add to stepsWithErrorsShown when going back - only forward navigation
    // and final submit should trigger error display
    if (!isFirstStep) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      // Don't reset highestStepReached - preserve the furthest progress
    }
  }, [currentStep, isFirstStep]);

  const handleStepClick = useCallback(
    (stepIndex: number) => {
      // Mark current step as having errors shown (user is navigating away)
      if (stepIndex !== currentStep) {
        setStepsWithErrorsShown((prev) => new Set(prev).add(currentStep));
      }

      setCurrentStep(stepIndex);

      // Only update highest step reached when going forward
      // Don't reset when going backward - preserve the furthest progress
      if (stepIndex > highestStepReached) {
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

      if (getStepErrors) {
        const stepErrors = getStepErrors(stepIndex, currentValues);
        if (stepErrors.length > 0) {
          return `${stepErrors.length} issue${stepErrors.length > 1 ? "s" : ""}:\n• ${stepErrors.join("\n• ")}`;
        }
      }

      return null;
    },
    [getStepErrors, currentValues],
  );

  const getStepFields = useCallback(
    (stepIndex: number): string[] => {
      return steps[stepIndex]?.fields ?? [];
    },
    [steps],
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
    isCurrentStepValid,

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
    getStepFields,
  };
}
