"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export interface ImpactSectionProps {
  /** Section heading */
  heading?: ReactNode;
  /** Main content/message */
  content?: ReactNode;
  /** Footer/additional text */
  footer?: ReactNode;
  /** Optional icon */
  icon?: LucideIcon;
  /** Background variant */
  background?: "default" | "muted" | "accent";
  /** Padding size */
  padding?: "sm" | "md" | "lg";
  /** Custom class name */
  className?: string;
  children?: ReactNode;
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

export function ImpactSection({
  heading = "High Impact. Big Results.",
  content,
  footer,
  icon: Icon,
  background = "default",
  padding = "lg",
  className = "",
  children,
}: ImpactSectionProps) {
  return (
    <section
      className={`${paddingClasses[padding]} ${backgroundClasses[background]} ${className}`}
    >
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {heading && (
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {heading}
              </h2>
            </div>
          )}

          <div className="bg-linear-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-box p-8 md:p-12 text-center">
            {Icon && <Icon className="w-12 h-12 text-primary mx-auto mb-6" />}
            {content && (
              <div className="text-lg md:text-xl text-foreground leading-relaxed mb-6">
                {content}
              </div>
            )}
            {footer && <div className="text-muted-foreground">{footer}</div>}
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
