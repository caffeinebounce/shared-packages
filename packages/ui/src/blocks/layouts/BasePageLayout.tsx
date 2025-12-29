"use client";

import type { ReactNode } from "react";
import { cn } from "../../utils";

export interface BasePageLayoutProps {
  /** Page title displayed in header */
  title?: string;
  /** Page description/subtitle displayed below title */
  description?: string;
  /** Actions to display in the header (buttons, etc.) */
  actions?: ReactNode;
  /** Main content */
  children?: ReactNode;
  /** Additional class names for the container */
  className?: string;
  /** Additional class names for the content area */
  contentClassName?: string;
  /** Optional footer content */
  footer?: ReactNode;
}

/**
 * Base layout component for application pages.
 * Provides consistent padding, spacing, and optional header with title/description.
 * Used by AdminPageLayout and UserPageLayout.
 */
export function BasePageLayout({
  title,
  description,
  actions,
  children,
  className,
  contentClassName,
  footer,
}: BasePageLayoutProps) {
  const showHeader = Boolean(title || description || actions);

  return (
    <div
      className={cn(
        "flex flex-1 flex-col min-w-0 min-h-full",
        className,
      )}
    >
      <div className="flex flex-1 flex-col gap-4 p-4">
        {showHeader && (
          <div className="flex items-center justify-between">
            <div>
              {title && <h1 className="text-2xl font-semibold">{title}</h1>}
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </div>
        )}
        <div className={cn("flex-1", contentClassName)}>{children}</div>
      </div>
      {footer}
    </div>
  );
}
