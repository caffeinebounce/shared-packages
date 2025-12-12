"use client";

import { Link2 } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "../../utils";

/**
 * Props for the LegalSection component
 */
export interface LegalSectionProps {
  /** Section ID for anchor links */
  id: string;
  /** Section title */
  title: string;
  /** Section content */
  children: ReactNode;
  /** Additional className */
  className?: string;
}

/**
 * A styled section component for legal documents with anchor support.
 *
 * @example
 * ```tsx
 * <LegalSection id="privacy-policy" title="Privacy Policy">
 *   <p>Your privacy is important to us...</p>
 * </LegalSection>
 * ```
 */
export function LegalSection({
  id,
  title,
  children,
  className,
}: LegalSectionProps) {
  return (
    <section id={id} className={cn("mb-8 scroll-mt-20 print:mb-6", className)}>
      <a
        href={`#${id}`}
        className="group inline-flex items-center gap-2 no-underline text-foreground print:no-underline mb-4"
      >
        <h2 className="text-2xl font-semibold underline underline-offset-4 decoration-muted-foreground/50 group-hover:decoration-foreground print:text-xl print:no-underline my-0!">
          {title}
        </h2>
        <Link2 className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity print:hidden shrink-0" />
      </a>
      {/* Prose styling is applied by parent LegalLayout - don't add conflicting styles here */}
      {children}
    </section>
  );
}
