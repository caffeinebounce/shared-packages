"use client";

import { ExternalLink } from "lucide-react";
import { cn } from "../../utils/cn";
import type { SocialPlatform } from "./social-icon";
import { SocialIcon } from "./social-icon";

export interface DisplayFieldProps {
  /** Field label */
  label: string;
  /** Field value - if falsy, placeholder is shown */
  value?: string | number | null;
  /** Custom placeholder when value is empty */
  placeholder?: string;
  /** Makes the value a clickable link */
  href?: string;
  /** Opens link in new tab (default: true for external links) */
  external?: boolean;
  /** Icon component to show before the value */
  icon?: React.ElementType;
  /** Social platform icon (overrides icon prop) */
  platform?: SocialPlatform;
  /** Allows multiline value display with whitespace preservation */
  multiline?: boolean;
  /** Additional className for the container */
  className?: string;
  /** Additional className for the value */
  valueClassName?: string;
}

/**
 * DisplayField - A label/value display component for profile and detail views.
 *
 * @example
 * // Basic usage
 * <DisplayField label="Company Name" value={company.name} />
 *
 * @example
 * // With icon
 * <DisplayField label="Email" value={user.email} icon={Mail} />
 *
 * @example
 * // As link
 * <DisplayField label="Website" value={company.website} href={company.website} />
 *
 * @example
 * // With social platform icon
 * <DisplayField label="LinkedIn" value={linkedinUrl} href={linkedinUrl} platform="linkedin" />
 */
export function DisplayField({
  label,
  value,
  placeholder = "Not set",
  href,
  external = true,
  icon: Icon,
  platform,
  multiline = false,
  className,
  valueClassName,
}: DisplayFieldProps) {
  const isEmpty = value === null || value === undefined || value === "";
  const displayValue = isEmpty ? placeholder : String(value);

  const linkProps =
    href && !isEmpty
      ? {
          href,
          target: external ? "_blank" : undefined,
          rel: external ? "noopener noreferrer" : undefined,
        }
      : undefined;

  return (
    <div className={cn("space-y-1.5", className)}>
      <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </dt>
      <dd className="flex items-start gap-2 min-h-6">
        {platform && (
          <SocialIcon
            platform={platform}
            size={16}
            className="text-muted-foreground shrink-0 mt-0.5"
          />
        )}
        {Icon && !platform && (
          <Icon className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
        )}
        {isEmpty ? (
          <span className="text-muted-foreground italic text-sm">
            {placeholder}
          </span>
        ) : linkProps ? (
          <a
            {...linkProps}
            className={cn(
              "group flex items-center gap-1.5 text-foreground hover:text-primary hover:underline transition-colors",
              valueClassName,
            )}
          >
            <span className={multiline ? "whitespace-pre-wrap" : undefined}>
              {displayValue}
            </span>
            <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </a>
        ) : (
          <span
            className={cn(
              "text-foreground",
              multiline && "whitespace-pre-wrap",
              valueClassName,
            )}
          >
            {displayValue}
          </span>
        )}
      </dd>
    </div>
  );
}

export interface DisplayFieldGroupProps {
  /** Field group content (DisplayField components) */
  children: React.ReactNode;
  /** Number of columns for the grid layout */
  columns?: 1 | 2 | 3 | 4;
  /** Additional className for the container */
  className?: string;
}

/**
 * DisplayFieldGroup - Organizes multiple DisplayField components in a responsive grid.
 *
 * @example
 * <DisplayFieldGroup columns={2}>
 *   <DisplayField label="Name" value={user.name} />
 *   <DisplayField label="Email" value={user.email} />
 *   <DisplayField label="Phone" value={user.phone} />
 *   <DisplayField label="Location" value={user.location} />
 * </DisplayFieldGroup>
 */
export function DisplayFieldGroup({
  children,
  columns = 2,
  className,
}: DisplayFieldGroupProps) {
  const columnClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <dl className={cn("grid gap-4", columnClasses[columns], className)}>
      {children}
    </dl>
  );
}
