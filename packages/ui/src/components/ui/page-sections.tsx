"use client";

import * as React from "react";
import { cn } from "../../utils";
import { Separator } from "./separator";

interface PageSectionProps {
  children: React.ReactNode;
  /** Show separator after this section. Default: true */
  separator?: boolean;
  className?: string;
}

interface PageSectionsProps {
  children: React.ReactNode;
  /** Default separator behavior for all sections. Default: true */
  separator?: boolean;
  /** Class for the separator element */
  separatorClassName?: string;
  className?: string;
}

/**
 * PageSection - A single section within PageSections
 *
 * @example
 * <PageSection separator={false}>
 *   <MySection />
 * </PageSection>
 */
function PageSection({ children, className }: PageSectionProps) {
  // The separator prop is read by PageSections parent, not used here directly
  return <div className={cn(className)}>{children}</div>;
}

/**
 * PageSections - Container for page sections with optional separators
 *
 * Automatically adds separators between sections. Each section can override
 * the default separator behavior.
 *
 * @example
 * // All sections with separators (default)
 * <PageSections>
 *   <PageSection><Hero /></PageSection>
 *   <PageSection><Features /></PageSection>
 *   <PageSection><CTA /></PageSection>
 * </PageSections>
 *
 * @example
 * // No separators by default, opt-in per section
 * <PageSections separator={false}>
 *   <PageSection separator><Hero /></PageSection>
 *   <PageSection><Features /></PageSection>
 * </PageSections>
 *
 * @example
 * // Custom separator styling
 * <PageSections separatorClassName="opacity-50 max-w-4xl mx-auto">
 *   ...
 * </PageSections>
 */
function PageSections({
  children,
  separator: defaultSeparator = true,
  separatorClassName,
  className,
}: PageSectionsProps) {
  const sections = React.Children.toArray(children).filter(
    React.isValidElement,
  );

  return (
    <div className={cn(className)}>
      {sections.map((child, index) => {
        const isLast = index === sections.length - 1;

        // Get separator prop from child, fall back to default
        const showSeparator =
          (child as React.ReactElement<PageSectionProps>).props.separator ??
          defaultSeparator;

        return (
          <React.Fragment key={index}>
            {child}
            {!isLast && showSeparator && (
              <Separator className={cn("w-full", separatorClassName)} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export { PageSections, PageSection };
export type { PageSectionsProps, PageSectionProps };
