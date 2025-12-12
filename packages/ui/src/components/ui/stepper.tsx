"use client";

import { Check } from "lucide-react";
import type * as React from "react";

import { cn } from "../../utils";

export interface StepperStep {
  id: string;
  label: string;
  description?: string;
}

export interface StepperProps extends React.ComponentProps<"nav"> {
  steps: StepperStep[];
  currentStep: string;
  completedSteps: string[];
  onStepClick?: (stepId: string) => void;
}

function Stepper({
  steps,
  currentStep,
  completedSteps,
  onStepClick,
  className,
  ...props
}: StepperProps) {
  const currentIndex = steps.findIndex((s) => s.id === currentStep);

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
                  "flex items-center gap-2 group",
                  isClickable && "cursor-pointer",
                  !isClickable && "cursor-not-allowed opacity-50",
                )}
                aria-current={isCurrent ? "step" : undefined}
              >
                <span
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full border-2 shrink-0 transition-colors",
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
                    <Check className="w-4 h-4" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </span>
                <span
                  className={cn(
                    "text-sm font-medium hidden lg:block",
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
                    "flex-1 h-0.5 mx-4",
                    isCompleted ? "bg-primary" : "bg-muted",
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>

      {/* Mobile stepper */}
      <div className="md:hidden flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          Step {currentIndex + 1} of {steps.length}
        </span>
        <span className="text-sm font-medium">
          {steps[currentIndex]?.label}
        </span>
      </div>
    </nav>
  );
}

export { Stepper };
