"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export interface Benefit {
  /** Icon component */
  icon: LucideIcon;
  /** Benefit text */
  text: string;
}

export interface Outcome {
  /** Outcome text */
  text: string;
  /** Optional icon (defaults to checkmark) */
  icon?: LucideIcon;
}

export interface BenefitsSectionProps {
  /** Section heading */
  heading?: ReactNode;
  /** Section subheading */
  subheading?: ReactNode;
  /** Array of benefits */
  benefits: Benefit[];
  /** Outcomes heading */
  outcomesHeading?: ReactNode;
  /** Array of outcomes */
  outcomes?: Outcome[];
  /** Background variant */
  background?: "default" | "muted" | "accent";
  /** Padding size */
  padding?: "sm" | "md" | "lg";
  /** Custom class name */
  className?: string;
}

const paddingClasses = {
  sm: "py-12 md:py-16",
  md: "py-16 md:py-24",
  lg: "py-20 md:py-28",
};

const backgroundClasses = {
  default: "",
  muted: "bg-muted/30",
  accent: "bg-accent/10",
};

export function BenefitsSection({
  heading = "What You'll Gain",
  subheading,
  benefits,
  outcomesHeading = "Outcomes You Can Expect",
  outcomes = [],
  background = "default",
  padding = "lg",
  className = "",
}: BenefitsSectionProps) {
  return (
    <section
      className={`${paddingClasses[padding]} ${backgroundClasses[background]} ${className}`}
    >
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          {(heading || subheading) && (
            <div className="text-center mb-12">
              {heading && (
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  {heading}
                </h2>
              )}
              {subheading && (
                <div className="text-xl text-muted-foreground">
                  {subheading}
                </div>
              )}
            </div>
          )}

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
            {benefits.map((benefit) => (
              <div
                key={benefit.text}
                className="flex items-start gap-4 rounded-box bg-muted/30 p-4 transition-colors hover:bg-muted/50"
              >
                <div className="shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <benefit.icon className="w-5 h-5 text-primary" />
                </div>
                <p className="text-foreground pt-2">{benefit.text}</p>
              </div>
            ))}
          </div>

          {/* Outcomes */}
          {outcomes.length > 0 && (
            <div className="bg-background border rounded-box p-8 md:p-10">
              <h3 className="text-2xl font-bold text-foreground mb-6 text-center">
                {outcomesHeading}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {outcomes.map((outcome) => {
                  const Icon = outcome.icon;
                  return (
                    <div key={outcome.text} className="flex items-start gap-3">
                      <div className="shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center mt-0.5">
                        {Icon ? (
                          <Icon className="w-3.5 h-3.5 text-primary-foreground" />
                        ) : (
                          <svg
                            className="w-3.5 h-3.5 text-primary-foreground"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                      <p className="text-muted-foreground">{outcome.text}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
