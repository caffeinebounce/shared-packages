"use client";

import { useErrorLogger } from "@caffeinebounce/logger";
import type { LucideIcon } from "lucide-react";
import { Check } from "lucide-react";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../components/ui/tooltip";
import { useDebounce, useLocalStorage } from "../../hooks";
import { cn } from "../../utils";

/**
 * Step validation status for progress indicator styling
 */
export type StepStatus =
  | "not-started"
  | "in-progress"
  | "incomplete"
  | "complete"
  | "error";

/**
 * A single step definition for the FormWizard
 */
export interface FormWizardStep {
  /** Unique identifier for the step */
  id: string;
  /** Display label for the step */
  label: string;
  /** Icon component from lucide-react */
  icon: LucideIcon;
}

/**
 * Style configuration returned for a step based on its status
 */
export interface StepStatusStyles {
  /** Border/background classes for the icon circle */
  border: string;
  /** Text color classes for the label */
  text: string;
  /** The icon element to render */
  icon: ReactNode;
  /** Optional tooltip message (for error/incomplete states) */
  tooltip: string | null;
}

/**
 * Function type for computing step status
 */
export type GetStepStatus = (stepIndex: number) => StepStatus;

/**
 * Function type for computing step tooltip content
 */
export type GetStepTooltip = (
  stepIndex: number,
  status: StepStatus,
) => string | null;

/**
 * Props for the FormWizard component
 */
export interface FormWizardProps<T = unknown> {
  /** Array of step definitions */
  steps: FormWizardStep[];
  /** Current active step index (0-based) */
  currentStep: number;
  /** Callback when step changes */
  onStepChange: (stepIndex: number) => void;
  /** Function to compute the status of each step */
  getStepStatus: GetStepStatus;
  /** Optional function to get tooltip content for a step */
  getStepTooltip?: GetStepTooltip;
  /** Enable keyboard navigation with Alt/Option+Arrow keys */
  enableKeyboardNavigation?: boolean;
  /** Scope keyboard navigation to elements with role="dialog" */
  scopeToDialog?: boolean;
  /** Callback when Escape is pressed (for cancel functionality) */
  onCancel?: () => void;
  /** Callback when Cmd/Ctrl+Enter is pressed (for submit functionality) */
  onSubmit?: () => void;
  /** Callback when Ctrl+Shift+R is pressed (for reset functionality) */
  onReset?: () => void;
  /**
   * CSS selector for the element to auto-focus when the wizard mounts.
   * Useful for focusing the first input field in a dialog.
   * @example 'input[name="name"]' or '[role="dialog"] input:first-of-type'
   */
  autoFocusSelector?: string;
  /**
   * Key to use for localStorage persistence.
   * If provided, form data will be automatically saved to localStorage.
   */
  persistKey?: string;
  /** The form data to persist (required if persistKey is provided) */
  formData?: T;
  /** Callback when data is restored from storage */
  onDataRestored?: (data: T) => void;
  /** The step content to render */
  children: ReactNode;
  /** Additional class name for the container */
  className?: string;
}

/**
 * FormWizard provides a multi-step form interface with:
 * - Step progress indicator with icons and animated connectors
 * - Step validation status styling (not-started, in-progress, incomplete, complete, error)
 * - Tooltips for steps with errors or incomplete status
 * - Optional keyboard navigation (Alt/Option+Arrow keys)
 *
 * This component handles the step navigation and progress display,
 * while the actual form fields and validation logic are provided by the parent.
 *
 * @example
 * ```tsx
 * <FormWizard
 *   steps={[
 *     { id: "basic", label: "Basic Info", icon: Building2 },
 *     { id: "details", label: "Details", icon: FileText },
 *   ]}
 *   currentStep={currentStep}
 *   onStepChange={setCurrentStep}
 *   getStepStatus={(index) => stepStatuses[index]}
 *   getStepTooltip={(index, status) =>
 *     status === "error" ? "Missing required fields" : null
 *   }
 *   enableKeyboardNavigation
 *   onCancel={() => setDialogOpen(false)}
 *   onSubmit={handleFormSubmit}
 * >
 *   {currentStep === 0 && <BasicInfoFields />}
 *   {currentStep === 1 && <DetailsFields />}
 * </FormWizard>
 * ```
 */
export function FormWizard<T = unknown>({
  steps,
  currentStep,
  onStepChange,
  getStepStatus,
  getStepTooltip,
  enableKeyboardNavigation = true,
  scopeToDialog = true,
  onCancel,
  onSubmit,
  onReset,
  autoFocusSelector,
  persistKey,
  formData,
  onDataRestored,
  children,
  className,
}: FormWizardProps<T>) {
  const totalSteps = steps.length;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;
  const { logError } = useErrorLogger();

  // Persistence logic
  const [storedValue, setStoredValue, , isLoaded] = useLocalStorage<T | null>(
    persistKey,
    null,
  );
  const debouncedData = useDebounce(formData, 500);
  const [hasRestored, setHasRestored] = useState(false);
  const isRestoring = useRef(false);
  const formDataRef = useRef(formData);
  const restoredDataRef = useRef<T | null>(null); // Track what we restored to validate save

  // Keep ref in sync with formData for unmount saving
  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  // Check if the data has actually received the restored values
  // This prevents saving stale empty data before the form has updated
  const hasRestoredDataPropagated = useCallback(() => {
    if (!restoredDataRef.current) return true; // No restore pending

    const restored = restoredDataRef.current as Record<string, unknown>;
    const current = debouncedData as Record<string, unknown>;

    // Check that ALL non-empty restored fields match the current data
    // This prevents saving incomplete data if only some fields have propagated
    for (const key of Object.keys(restored)) {
      const restoredVal = restored[key];
      const currentVal = current?.[key];

      // Skip empty restored values (nothing to check)
      if (!restoredVal || restoredVal === "") continue;

      // Skip arrays that are empty
      if (Array.isArray(restoredVal) && restoredVal.length === 0) continue;

      // Use deep equality for objects and arrays, shallow equality for primitives
      const isObjectLike =
        typeof restoredVal === "object" && restoredVal !== null;
      const valuesMatch = isObjectLike
        ? JSON.stringify(currentVal) === JSON.stringify(restoredVal)
        : currentVal === restoredVal;

      // If ANY non-empty field doesn't match, we're not ready yet
      if (!valuesMatch) {
        return false;
      }
    }

    // All non-empty fields match - we're done waiting
    restoredDataRef.current = null;
    return true;
  }, [debouncedData]);

  // Save to storage when data changes (debounced)
  useEffect(() => {
    if (hasRestored && persistKey && debouncedData) {
      // If we are in the "restoring" grace period, skip saving
      if (isRestoring.current) {
        return;
      }

      // Check if restored data has actually propagated to the form
      // This prevents saving empty data before the form has updated
      if (restoredDataRef.current && !hasRestoredDataPropagated()) {
        return;
      }

      setStoredValue(debouncedData);
    }
  }, [
    hasRestored,
    persistKey,
    debouncedData,
    setStoredValue,
    hasRestoredDataPropagated,
  ]);

  // Save on unmount to capture latest changes that haven't been debounced yet
  useEffect(() => {
    return () => {
      if (hasRestored && persistKey && formDataRef.current) {
        // If we are still in the restoring grace period, do not save on unmount.
        if (isRestoring.current) {
          return;
        }

        // If restored data hasn't propagated yet, don't save empty data
        if (restoredDataRef.current) {
          return;
        }

        try {
          window.localStorage.setItem(
            persistKey,
            JSON.stringify(formDataRef.current),
          );
        } catch (e) {
          logError(e, {
            component: "FormWizard",
            action: "saveOnUnmount",
            metadata: { persistKey },
          });
        }
      }
    };
  }, [hasRestored, persistKey, logError]);

  // Restore from storage on mount
  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (persistKey && storedValue && !hasRestored && onDataRestored) {
      // Store what we're restoring so we can validate it propagated
      restoredDataRef.current = storedValue;

      onDataRestored(storedValue);

      // Block saving for slightly longer than the debounce delay
      isRestoring.current = true;
      setTimeout(() => {
        isRestoring.current = false;
      }, 600);

      setHasRestored(true);
    } else if (persistKey && !storedValue && !hasRestored) {
      // Nothing to restore, but we are ready to save
      setHasRestored(true);
    }
  }, [isLoaded, persistKey, storedValue, hasRestored, onDataRestored]);

  // Auto-focus the specified element on mount
  useEffect(() => {
    if (!autoFocusSelector) return;

    // Use setTimeout to ensure the DOM is ready (especially in dialogs)
    const timeoutId = setTimeout(() => {
      const element = document.querySelector<HTMLElement>(autoFocusSelector);
      element?.focus();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [autoFocusSelector]);

  // Calculate step statuses for all steps
  const stepStatuses = useMemo((): StepStatus[] => {
    return steps.map((_, index) => getStepStatus(index));
  }, [steps, getStepStatus]);

  const handleStepClick = useCallback(
    (stepIndex: number) => {
      onStepChange(stepIndex);
    },
    [onStepChange],
  );

  const handleNext = useCallback(() => {
    if (!isLastStep) {
      onStepChange(currentStep + 1);
    }
  }, [currentStep, isLastStep, onStepChange]);

  const handleBack = useCallback(() => {
    if (!isFirstStep) {
      onStepChange(currentStep - 1);
    }
  }, [currentStep, isFirstStep, onStepChange]);

  // Keyboard navigation: Alt/Option+ArrowLeft/ArrowRight for Back/Next
  // Escape for cancel, Cmd/Ctrl+Enter for submit
  useEffect(() => {
    if (!enableKeyboardNavigation) return;

    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      // Optionally scope to dialog
      if (scopeToDialog) {
        const target = e.target as HTMLElement;
        const isInDialog = target.closest('[role="dialog"]');
        if (!isInDialog) return;
      }

      // Escape to cancel
      if (e.key === "Escape" && onCancel) {
        e.preventDefault();
        e.stopPropagation();
        onCancel();
        return;
      }

      // Cmd/Ctrl+Enter to submit
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && onSubmit) {
        e.preventDefault();
        e.stopPropagation();
        onSubmit();
        return;
      }

      // Alt+R to reset form (check both 'r' and '®' for Mac Option key behavior)
      if (
        (e.key === "r" || e.key === "®" || e.code === "KeyR") &&
        e.altKey &&
        !e.shiftKey &&
        !e.metaKey &&
        !e.ctrlKey &&
        onReset
      ) {
        e.preventDefault();
        e.stopPropagation();

        // Clear localStorage if we have a persistKey
        if (persistKey) {
          try {
            window.localStorage.removeItem(persistKey);
            setStoredValue(null);
          } catch (err) {
            logError(err, {
              component: "FormWizard",
              action: "clearStorageOnReset",
              metadata: { persistKey },
            });
          }
        }

        onReset();
        return;
      }

      // Alt+Arrow navigation
      if (!e.altKey) return;

      if (e.key === "ArrowLeft" && !isFirstStep) {
        e.preventDefault();
        e.stopPropagation();
        handleBack();
      } else if (e.key === "ArrowRight" && !isLastStep) {
        e.preventDefault();
        e.stopPropagation();
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [
    enableKeyboardNavigation,
    scopeToDialog,
    isFirstStep,
    isLastStep,
    handleBack,
    handleNext,
    onCancel,
    onSubmit,
    onReset,
    persistKey,
    setStoredValue,
    logError,
  ]);

  /**
   * Get styling for a step based on its status
   */
  const getStatusStyles = useCallback(
    (stepIndex: number): StepStatusStyles => {
      const status = stepStatuses[stepIndex];
      const isCurrent = stepIndex === currentStep;
      const step = steps[stepIndex];
      const Icon = step.icon;
      const tooltip = getStepTooltip?.(stepIndex, status) ?? null;

      switch (status) {
        case "error":
          return {
            border: "border-destructive bg-destructive",
            text: "text-destructive",
            icon: <Icon className="w-5 h-5 text-white" />,
            tooltip: tooltip || "This section has errors",
          };
        case "complete":
          return {
            border: "border-foreground bg-foreground text-background",
            text: "text-foreground",
            icon: <Check className="w-5 h-5" />,
            tooltip: null,
          };
        case "incomplete":
          return {
            border: "border-yellow-500 bg-yellow-500 text-white",
            text: "text-yellow-600 dark:text-yellow-500",
            icon: <Icon className="w-5 h-5" />,
            tooltip: tooltip || "This section is incomplete",
          };
        case "in-progress":
          return {
            border: "border-primary bg-primary text-primary-foreground",
            text: "text-primary",
            icon: <Icon className="w-5 h-5" />,
            tooltip: null,
          };
        default: // not-started
          return {
            border: isCurrent
              ? "border-muted-foreground bg-muted-foreground text-background dark:border-muted dark:bg-muted dark:text-foreground"
              : "border-transparent bg-background",
            text: isCurrent ? "text-foreground" : "text-muted-foreground",
            icon: <Icon className="w-5 h-5" />,
            tooltip: null,
          };
      }
    },
    [stepStatuses, currentStep, steps, getStepTooltip],
  );

  // Calculate progress percentage for the animated line
  // Line fills TO the current step (not past it)
  const progressPercentage = useMemo(() => {
    if (totalSteps <= 1) return 0;
    // Current step position as percentage (0% at first, 100% at last)
    return (currentStep / (totalSteps - 1)) * 100;
  }, [currentStep, totalSteps]);

  return (
    <TooltipProvider>
      <div className={cn("space-y-8", className)}>
        {/* Progress Section */}
        <div className="space-y-4">
          {/* Step indicators */}
          <div className="relative flex items-center justify-between">
            {/* Single continuous progress line */}
            <div className="absolute top-5 left-5 right-5 h-[2px]">
              {/* Background track */}
              <div className="absolute inset-0 bg-border/60 rounded-full" />
              {/* Animated fill */}
              <div
                className="absolute inset-y-0 left-0 bg-foreground rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            {/* Step icons */}
            {steps.map((step, index) => {
              const styles = getStatusStyles(index);

              const stepButton = (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => handleStepClick(index)}
                  aria-label={`Step ${index + 1}: ${step.label}`}
                  aria-current={index === currentStep ? "step" : undefined}
                  className={cn(
                    "relative z-10 flex flex-col items-center gap-2 transition-colors cursor-pointer",
                    styles.text,
                  )}
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors",
                      styles.border,
                    )}
                  >
                    {styles.icon}
                  </div>
                  <span className="text-xs font-medium hidden sm:block">
                    {step.label}
                  </span>
                </button>
              );

              // Wrap in tooltip if there's a message to show
              if (styles.tooltip) {
                return (
                  <Tooltip key={step.id}>
                    <TooltipTrigger asChild>{stepButton}</TooltipTrigger>
                    <TooltipContent className="whitespace-pre-line">
                      {styles.tooltip}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return stepButton;
            })}
          </div>
        </div>

        {/* Step content */}
        {children}
      </div>
    </TooltipProvider>
  );
}

/**
 * Context for navigation controls - allows children to trigger navigation
 */
export interface FormWizardNavigation {
  /** Go to the next step */
  goNext: () => void;
  /** Go to the previous step */
  goBack: () => void;
  /** Go to a specific step */
  goToStep: (index: number) => void;
  /** Whether currently on the first step */
  isFirstStep: boolean;
  /** Whether currently on the last step */
  isLastStep: boolean;
  /** Current step index */
  currentStep: number;
  /** Total number of steps */
  totalSteps: number;
}

/**
 * Hook-compatible helper to create navigation handlers
 */
export function useFormWizardNavigation(
  currentStep: number,
  totalSteps: number,
  onStepChange: (step: number) => void,
): FormWizardNavigation {
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  const goNext = useCallback(() => {
    if (!isLastStep) {
      onStepChange(currentStep + 1);
    }
  }, [currentStep, isLastStep, onStepChange]);

  const goBack = useCallback(() => {
    if (!isFirstStep) {
      onStepChange(currentStep - 1);
    }
  }, [currentStep, isFirstStep, onStepChange]);

  const goToStep = useCallback(
    (index: number) => {
      if (index >= 0 && index < totalSteps) {
        onStepChange(index);
      }
    },
    [totalSteps, onStepChange],
  );

  return {
    goNext,
    goBack,
    goToStep,
    isFirstStep,
    isLastStep,
    currentStep,
    totalSteps,
  };
}
