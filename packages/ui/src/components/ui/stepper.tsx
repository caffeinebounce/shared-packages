"use client";

import { Check } from "lucide-react";
import type * as React from "react";

import { cn } from "../../utils";

export interface StepperStep {
  id: string;
  label: string;
  description?: string;
}

export type StepperMobileVariant = "summary" | "steps";
export type StepperSize = "default" | "compact";

export interface StepperProps extends React.ComponentProps<"nav"> {
  steps: StepperStep[];
  currentStep: string;
  completedSteps: string[];
  onStepClick?: (stepId: string) => void;
  mobileVariant?: StepperMobileVariant;
  size?: StepperSize;
}

const stepperSizes: Record<
  StepperSize,
  {
    circle: string;
    connector: string;
    gap: string;
    icon: string;
    label: string;
    mobileLabel: string;
    number: string;
  }
> = {
  default: {
    circle: "w-8 h-8",
    connector: "mx-4",
    gap: "gap-2",
    icon: "w-4 h-4",
    label: "text-sm",
    mobileLabel: "text-[11px]",
    number: "text-sm",
  },
  compact: {
    circle: "w-7 h-7",
    connector: "mx-2",
    gap: "gap-1.5",
    icon: "w-3.5 h-3.5",
    label: "text-xs",
    mobileLabel: "text-[11px]",
    number: "text-xs",
  },
};

function Stepper({
  steps,
  currentStep,
  completedSteps,
  onStepClick,
  mobileVariant = "summary",
  size = "default",
  className,
  ...props
}: StepperProps) {
  const currentIndex = steps.findIndex((s) => s.id === currentStep);
  const styles = stepperSizes[size];

  return (
    <nav
      aria-label="Application progress"
      className={cn("w-full", className)}
      {...props}
    >
      {/* Desktop stepper */}
      <ol className="hidden md:flex items-center w-full">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = step.id === currentStep;
          const isClickable = isCompleted || isCurrent;

          return (
            <li
              key={step.id}
              className={cn(
                "flex items-center",
                index < steps.length - 1 && "flex-1",
              )}
            >
              <button
                type="button"
                onClick={() => isClickable && onStepClick?.(step.id)}
                disabled={!isClickable}
                className={cn(
                  "flex items-center group",
                  styles.gap,
                  isClickable && "cursor-pointer",
                  !isClickable && "cursor-not-allowed opacity-50",
                )}
                aria-current={isCurrent ? "step" : undefined}
              >
                <span
                  className={cn(
                    "flex items-center justify-center rounded-full border-2 shrink-0 transition-colors",
                    styles.circle,
                    isCompleted &&
                      "bg-primary border-primary text-primary-foreground",
                    isCurrent &&
                      !isCompleted &&
                      "border-primary text-primary bg-background",
                    !isCompleted &&
                      !isCurrent &&
                      "border-muted-foreground/30 text-muted-foreground",
                  )}
                >
                  {isCompleted ? (
                    <Check className={styles.icon} />
                  ) : (
                    <span className={cn(styles.number, "font-medium")}>
                      {index + 1}
                    </span>
                  )}
                </span>
                <span
                  className={cn(
                    "font-medium hidden lg:block",
                    styles.label,
                    isCurrent && "text-primary",
                    !isCurrent && "text-muted-foreground",
                    isClickable && "group-hover:text-foreground",
                  )}
                >
                  {step.label}
                </span>
              </button>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5",
                    styles.connector,
                    isCompleted ? "bg-primary" : "bg-muted",
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>

      {/* Mobile stepper */}
      {mobileVariant === "steps" ? (
        <ol
          data-slot="stepper-mobile-steps"
          className="md:hidden flex items-start w-full"
        >
          {steps.map((step, index) => {
            const isCompleted = completedSteps.includes(step.id);
            const isCurrent = step.id === currentStep;
            const isClickable = isCompleted || isCurrent;

            return (
              <li
                key={step.id}
                className={cn(
                  "flex items-start min-w-0",
                  index < steps.length - 1 && "flex-1",
                )}
              >
                <button
                  type="button"
                  onClick={() => isClickable && onStepClick?.(step.id)}
                  disabled={!isClickable}
                  className={cn(
                    "group flex min-w-0 flex-col items-center gap-1 text-center",
                    isClickable && "cursor-pointer",
                    !isClickable && "cursor-not-allowed opacity-50",
                  )}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  <span
                    className={cn(
                      "flex items-center justify-center rounded-full border-2 shrink-0 transition-colors",
                      styles.circle,
                      isCompleted &&
                        "bg-primary border-primary text-primary-foreground",
                      isCurrent &&
                        !isCompleted &&
                        "border-primary text-primary bg-background",
                      !isCompleted &&
                        !isCurrent &&
                        "border-muted-foreground/30 text-muted-foreground",
                    )}
                  >
                    {isCompleted ? (
                      <Check className={styles.icon} />
                    ) : (
                      <span className={cn(styles.number, "font-medium")}>
                        {index + 1}
                      </span>
                    )}
                  </span>
                  <span
                    className={cn(
                      "max-w-16 truncate font-medium leading-tight",
                      styles.mobileLabel,
                      isCurrent && "text-primary",
                      !isCurrent && "text-muted-foreground",
                      isClickable && "group-hover:text-foreground",
                    )}
                  >
                    {step.label}
                  </span>
                </button>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "mt-3.5 h-0.5 min-w-3 flex-1 mx-1",
                      isCompleted ? "bg-primary" : "bg-muted",
                    )}
                  />
                )}
              </li>
            );
          })}
        </ol>
      ) : (
        <div className="md:hidden flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Step {currentIndex + 1} of {steps.length}
          </span>
          <span className="text-sm font-medium">
            {steps[currentIndex]?.label}
          </span>
        </div>
      )}
    </nav>
  );
}

export { Stepper };
