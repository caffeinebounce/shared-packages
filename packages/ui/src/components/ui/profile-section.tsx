"use client";

import { Check, ChevronDown, Pencil, X } from "lucide-react";
import { useState } from "react";
import { cn } from "../../utils/cn";
import { Button } from "./button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./card";
import { Spinner } from "./spinner";

export interface ProfileSectionProps {
  /** Section title */
  title: string;
  /** Optional description below title */
  description?: string;
  /** Section content */
  children: React.ReactNode;
  /** Icon to display before title */
  icon?: React.ElementType;
  /** Whether section is in editing mode */
  isEditing?: boolean;
  /** Edit button click handler - shows edit button if provided */
  onEdit?: () => void;
  /** Cancel button click handler (shown in edit mode) */
  onCancel?: () => void;
  /** Save button click handler (shown in edit mode) */
  onSave?: () => void;
  /** Whether save operation is in progress */
  isSaving?: boolean;
  /** Disable the edit button */
  editDisabled?: boolean;
  /** Custom label for edit button tooltip */
  editLabel?: string;
  /** Custom action element (overrides edit/save/cancel buttons) */
  action?: React.ReactNode;
  /** Whether section can be collapsed */
  collapsible?: boolean;
  /** Initial collapsed state (only when collapsible=true) */
  defaultCollapsed?: boolean;
  /** Additional className for the container */
  className?: string;
  /** Additional className for the content area */
  contentClassName?: string;
  /** Variant style */
  variant?: "card" | "simple";
}

/**
 * ProfileSection - A section wrapper component for profile and settings pages.
 *
 * @example
 * // Basic display section
 * <ProfileSection title="Contact Information" icon={Mail}>
 *   <DisplayFieldGroup>
 *     <DisplayField label="Email" value={user.email} />
 *     <DisplayField label="Phone" value={user.phone} />
 *   </DisplayFieldGroup>
 * </ProfileSection>
 *
 * @example
 * // Editable section
 * <ProfileSection
 *   title="Company Details"
 *   icon={Building}
 *   isEditing={isEditing}
 *   onEdit={() => setIsEditing(true)}
 *   onCancel={() => setIsEditing(false)}
 *   onSave={handleSave}
 *   isSaving={isSaving}
 * >
 *   {isEditing ? <EditForm /> : <DisplayContent />}
 * </ProfileSection>
 *
 * @example
 * // Collapsible section
 * <ProfileSection title="Advanced Settings" collapsible defaultCollapsed>
 *   <SettingsForm />
 * </ProfileSection>
 */
export function ProfileSection({
  title,
  description,
  children,
  icon: Icon,
  isEditing,
  onEdit,
  onCancel,
  onSave,
  isSaving,
  editDisabled,
  editLabel,
  action,
  collapsible = false,
  defaultCollapsed = false,
  className,
  contentClassName,
  variant = "card",
}: ProfileSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  const renderActions = () => {
    // Custom action overrides built-in buttons
    if (action) {
      return action;
    }

    // Edit/Save/Cancel buttons for editable sections
    if (onEdit) {
      if (isEditing) {
        return (
          <div className="flex items-center gap-1">
            {onCancel && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground/60 hover:bg-transparent hover:text-destructive"
                onClick={onCancel}
                disabled={isSaving}
                aria-label="Cancel"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            {onSave && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground/60 hover:bg-transparent hover:text-green-600"
                onClick={onSave}
                disabled={isSaving}
                aria-label="Save"
              >
                {isSaving ? (
                  <Spinner className="h-4 w-4" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        );
      }

      return (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground/60 hover:bg-transparent hover:text-primary"
          onClick={onEdit}
          disabled={editDisabled}
          aria-label={editLabel ?? `Edit ${title}`}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      );
    }

    // Collapse button for collapsible sections
    if (collapsible) {
      return (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground/60 hover:bg-transparent"
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-expanded={!isCollapsed}
          aria-label={isCollapsed ? "Expand" : "Collapse"}
        >
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              isCollapsed && "-rotate-90",
            )}
          />
        </Button>
      );
    }

    return null;
  };

  // Simple variant - no card wrapper
  if (variant === "simple") {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="flex items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
            <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
          </div>
          {renderActions()}
        </div>
        {description && (
          <p className="text-sm text-muted-foreground px-1">{description}</p>
        )}
        {(!collapsible || !isCollapsed) && (
          <div className={contentClassName}>{children}</div>
        )}
      </div>
    );
  }

  // Card variant (default)
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            {Icon && <Icon className="size-5" />}
            {title}
          </CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {renderActions()}
      </CardHeader>
      {(!collapsible || !isCollapsed) && (
        <CardContent className={contentClassName}>{children}</CardContent>
      )}
    </Card>
  );
}
