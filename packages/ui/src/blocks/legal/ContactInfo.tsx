"use client";

import { Globe, Mail } from "lucide-react";
import { cn } from "../../utils";

/**
 * Props for the ContactInfo component
 */
export interface ContactInfoProps {
  /** Organization name */
  organizationName: string;
  /** Contact email address */
  email: string;
  /** Website URL */
  website?: string;
  /** Additional className */
  className?: string;
}

/**
 * A styled contact information card for legal pages.
 * Displays organization name, email, and optional website with icons.
 *
 * @example
 * ```tsx
 * <ContactInfo
 *   organizationName="The Capital Collective"
 *   email="privacy@thecapitalcollective.org"
 *   website="https://thecapitalcollective.org"
 * />
 * ```
 */
export function ContactInfo({
  organizationName,
  email,
  website,
  className,
}: ContactInfoProps) {
  return (
    <div
      className={cn(
        "mt-6 rounded-lg border border-border bg-muted/30 p-6 not-prose",
        className,
      )}
    >
      <p className="text-lg font-semibold text-foreground mb-4">
        {organizationName}
      </p>
      <div className="space-y-3">
        <a
          href={`mailto:${email}`}
          className="flex items-center gap-3 text-primary hover:text-primary/80 transition-colors"
        >
          <Mail className="h-5 w-5 shrink-0" />
          <span className="underline underline-offset-2">{email}</span>
        </a>
        {website && (
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-primary hover:text-primary/80 transition-colors"
          >
            <Globe className="h-5 w-5 shrink-0" />
            <span className="underline underline-offset-2">
              {website.replace(/^https?:\/\//, "")}
            </span>
          </a>
        )}
      </div>
    </div>
  );
}
