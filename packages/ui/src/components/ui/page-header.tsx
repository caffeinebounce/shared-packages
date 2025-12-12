"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { cn } from "../../utils";
import { Button } from "./button";

/**
 * PageHeader component for consistent page titles and descriptions.
 */

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Page title */
  title: string;
  /** Optional description */
  description?: string;
  /** Optional actions (buttons, etc.) to display on the right */
  actions?: React.ReactNode;
  /** Whether to add bottom border */
  bordered?: boolean;
  /** Optional back link URL */
  backHref?: string;
  /** Optional back link label (defaults to "Back") */
  backLabel?: string;
}

const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  (
    {
      className,
      title,
      description,
      actions,
      bordered = false,
      backHref,
      backLabel = "Back",
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "mb-6",
          bordered && "border-b border-border pb-6",
          className,
        )}
        {...props}
      >
        {backHref && (
          <div className="mb-4">
            <Link href={backHref}>
              <Button variant="ghost" size="sm" className="-ml-2">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {backLabel}
              </Button>
            </Link>
          </div>
        )}
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
            {description && (
              <p className="text-muted-foreground">{description}</p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2 mt-4 sm:mt-0">
              {actions}
            </div>
          )}
        </div>
      </div>
    );
  },
);
PageHeader.displayName = "PageHeader";

export { PageHeader, type PageHeaderProps };
