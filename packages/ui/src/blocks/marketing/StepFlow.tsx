"use client";

import { cn } from "../../utils";

export interface StepFlowProps {
  steps: string[];
  /** Arrow color class */
  arrowClassName?: string;
  className?: string;
}

export function StepFlow({
  steps,
  arrowClassName = "text-white/40",
  className,
}: StepFlowProps) {
  return (
    <div className={cn("grid gap-3 md:grid-cols-12", className)}>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;

        return (
          <div key={`${step}-${index}`} className="md:col-span-3">
            <div className="flex items-center gap-3">
              <div className="flex-1 rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-medium text-white">{step}</p>
              </div>

              {!isLast ? (
                <span className={cn("hidden text-lg md:inline", arrowClassName)}>
                  →
                </span>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
