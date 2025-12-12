"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "../../components/ui/button";

export interface ActionCard {
  /** Unique identifier */
  id?: string;
  /** Card icon */
  icon: LucideIcon;
  /** Card title */
  title: ReactNode;
  /** Card description */
  description: ReactNode;
  /** Optional CTA config */
  cta?: {
    label: string;
    href: string;
    disabled?: boolean;
  };
}

export interface LocationCard {
  /** City name */
  city: string;
  /** State/region */
  state: string;
  /** Program name */
  program: string;
  /** Status: accepting, coming-soon, closed */
  status: "accepting" | "coming-soon" | "closed";
  /** Description text */
  description: string;
  /** CTA label */
  cta: string;
  /** CTA href */
  href: string;
}

export interface NextStepsSectionProps {
  /** Section heading */
  heading?: ReactNode;
  /** Section announcement */
  announcement?: ReactNode;
  /** Section description */
  description?: ReactNode;
  /** Business section heading */
  businessHeading?: ReactNode;
  /** Array of location cards for businesses */
  locations?: LocationCard[];
  /** Additional action cards */
  actionCards?: ActionCard[];
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

export function NextStepsSection({
  heading = "What's Next?",
  announcement,
  description,
  businessHeading,
  locations = [],
  actionCards = [],
  background = "muted",
  padding = "lg",
  className = "",
  children,
}: NextStepsSectionProps) {
  return (
    <section
      className={`${paddingClasses[padding]} ${backgroundClasses[background]} ${className}`}
    >
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          {(heading || announcement) && (
            <div className="text-center mb-12">
              {heading && (
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  {heading}
                </h2>
              )}
              {announcement && (
                <div className="text-muted-foreground">{announcement}</div>
              )}
            </div>
          )}

          {description && (
            <p className="text-center text-muted-foreground max-w-3xl mx-auto mb-12">
              {description}
            </p>
          )}

          {/* For Businesses */}
          {locations.length > 0 && (
            <div className="mb-12">
              {businessHeading && (
                <div className="mb-6">
                  {typeof businessHeading === "string" ? (
                    <h3 className="text-xl font-semibold text-foreground">
                      {businessHeading}
                    </h3>
                  ) : (
                    businessHeading
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {locations.map((location) => (
                  <div
                    key={location.city}
                    className="bg-background border rounded-xl p-6 flex flex-col"
                  >
                    <div className="text-sm text-primary mb-2">
                      {location.city}, {location.state}
                    </div>
                    <h4 className="text-lg font-semibold text-foreground mb-3">
                      "{location.program}"
                    </h4>
                    <p className="text-muted-foreground text-sm flex-1 mb-4">
                      {location.description}
                    </p>
                    {location.status === "accepting" ? (
                      <Button asChild>
                        <a href={location.href}>{location.cta}</a>
                      </Button>
                    ) : (
                      <Button variant="outline" disabled>
                        {location.cta}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Cards */}
          {actionCards.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {actionCards.map((card, index) => {
                const Icon = card.icon;
                const key = card.id ?? `action-card-${index}`;
                return (
                  <div
                    key={key}
                    className="bg-background border rounded-xl p-6"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Icon className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-semibold text-foreground">
                        {card.title}
                      </h3>
                    </div>
                    <div className="text-muted-foreground text-sm mb-4">
                      {card.description}
                    </div>
                    {card.cta && (
                      <a
                        href={card.cta.href}
                        className="inline-flex items-center gap-2 text-primary hover:underline text-sm"
                      >
                        {card.cta.label}
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {children}
        </div>
      </div>
    </section>
  );
}
