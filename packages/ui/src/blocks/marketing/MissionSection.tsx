"use client";

import type { ReactNode } from "react";
import { Separator } from "../../components/ui/separator";

export interface Stat {
  /** Stat value (e.g., "5%", "$2M") */
  value: string;
  /** Stat label/description */
  label: string;
}

export interface Program {
  /** Program name */
  name: string;
  /** Location */
  location: string;
  /** Launch date/period */
  launched: string;
}

export interface MissionSectionProps {
  /** Introduction text */
  intro?: ReactNode;
  /** Challenge section heading */
  challengeHeading?: ReactNode;
  /** Array of statistics */
  stats?: Stat[];
  /** Challenge footer text */
  challengeFooter?: ReactNode;
  /** Solution section heading */
  solutionHeading?: ReactNode;
  /** Solution subheading */
  solutionSubheading?: ReactNode;
  /** Array of programs */
  programs?: Program[];
  /** Solution footer text */
  solutionFooter?: ReactNode;
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

export function MissionSection({
  intro,
  challengeHeading,
  stats = [],
  challengeFooter,
  solutionHeading,
  solutionSubheading,
  programs = [],
  solutionFooter,
  background = "muted",
  padding = "lg",
  className = "",
  children,
}: MissionSectionProps) {
  return (
    <section
      className={`${paddingClasses[padding]} ${backgroundClasses[background]} ${className}`}
    >
      <div className="container mx-auto px-4">
        {/* Intro */}
        {intro && (
          <>
            <div className="max-w-3xl mx-auto text-center mb-16">
              {typeof intro === "string" ? (
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                  {intro}
                </p>
              ) : (
                intro
              )}
            </div>
            <Separator className="max-w-md mx-auto mb-16" />
          </>
        )}

        {/* The Challenge */}
        {(challengeHeading || stats.length > 0 || challengeFooter) && (
          <>
            <div className="max-w-4xl mx-auto mb-20">
              {challengeHeading && (
                <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
                  {challengeHeading}
                </h2>
              )}

              {stats.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  {stats.map((stat) => (
                    <div
                      key={stat.value}
                      className="bg-background border rounded-xl p-8 text-center"
                    >
                      <div className="text-5xl md:text-6xl font-black text-primary mb-3">
                        {stat.value}
                      </div>
                      <p className="text-muted-foreground">{stat.label}</p>
                    </div>
                  ))}
                </div>
              )}

              {challengeFooter && (
                <div className="text-center text-lg text-muted-foreground">
                  {challengeFooter}
                </div>
              )}
            </div>
            <Separator className="max-w-md mx-auto mb-16" />
          </>
        )}

        {/* The Solution */}
        {(solutionHeading || programs.length > 0 || solutionFooter) && (
          <div className="max-w-4xl mx-auto">
            {solutionHeading && (
              <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-4">
                {solutionHeading}
              </h2>
            )}
            {solutionSubheading && (
              <p className="text-center text-muted-foreground mb-12">
                {solutionSubheading}
              </p>
            )}

            {programs.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {programs.map((program) => (
                  <div
                    key={program.name}
                    className="group bg-background border rounded-xl p-8 transition-all hover:border-primary/50 hover:shadow-lg"
                  >
                    <div className="text-sm font-medium text-primary mb-2">
                      {program.location}
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-foreground mb-3">
                      "{program.name}"
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Launched {program.launched}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {solutionFooter && (
              <p className="text-center text-muted-foreground mt-12 max-w-2xl mx-auto">
                {solutionFooter}
              </p>
            )}
          </div>
        )}

        {children}
      </div>
    </section>
  );
}
