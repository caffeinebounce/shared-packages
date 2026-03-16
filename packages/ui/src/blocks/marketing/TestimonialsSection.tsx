"use client";

import { Quote } from "lucide-react";
import type { ReactNode } from "react";

export interface Testimonial {
  /** Unique identifier */
  id: string;
  /** Testimonial quote */
  quote: string;
  /** Author name/attribution */
  author: string;
  /** Optional author role/title */
  role?: string;
  /** Optional author image */
  image?: string;
}

export interface TestimonialsSectionProps {
  /** Section heading */
  heading?: ReactNode;
  /** Section subheading */
  subheading?: ReactNode;
  /** Array of testimonials */
  testimonials: Testimonial[];
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

export function TestimonialsSection({
  heading = "Real Results. Real Voices.",
  subheading,
  testimonials,
  background = "muted",
  padding = "lg",
  className = "",
}: TestimonialsSectionProps) {
  return (
    <section
      className={`${paddingClasses[padding]} ${backgroundClasses[background]} ${className}`}
    >
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {heading && (
            <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-4">
              {heading}
            </h2>
          )}
          {subheading && (
            <p className="text-center text-muted-foreground mb-12">
              {subheading}
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-background border rounded-box p-6 flex flex-col"
              >
                <Quote className="w-8 h-8 text-primary/30 mb-4" />
                <blockquote className="text-foreground flex-1 mb-4">
                  "{testimonial.quote}"
                </blockquote>
                <cite className="text-sm text-muted-foreground not-italic">
                  — {testimonial.author}
                  {testimonial.role && (
                    <span className="block text-xs mt-1">
                      {testimonial.role}
                    </span>
                  )}
                </cite>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
