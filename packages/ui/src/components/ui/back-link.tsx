"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { cn } from "../../utils";

export interface BackLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /** URL to navigate back to */
  href: string;
  /** Label text (defaults to "Back") */
  children?: React.ReactNode;
}

/**
 * BackLink - Simple back navigation link with arrow icon
 *
 * @example
 * ```tsx
 * <BackLink href="/cohorts">Back to Cohorts</BackLink>
 * ```
 */
export const BackLink = React.forwardRef<HTMLAnchorElement, BackLinkProps>(
  ({ href, children = "Back", className, ...props }, ref) => {
    return (
      <Link
        ref={ref}
        href={href}
        className={cn(
          "inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors",
          className,
        )}
        {...props}
      >
        <ArrowLeft className="size-4" />
        {children}
      </Link>
    );
  },
);

BackLink.displayName = "BackLink";
