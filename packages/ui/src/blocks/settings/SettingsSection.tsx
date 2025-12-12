import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { cn } from "../../utils";

export interface SettingsSectionProps {
  /** Section title */
  title: string;
  /** Section description */
  description?: string;
  /** Section content - typically setting rows/controls */
  children: ReactNode;
  /** Additional class name */
  className?: string;
  /** Whether to wrap in a card (default: true) */
  card?: boolean;
}

/**
 * SettingsSection - A group of related settings within a tab
 *
 * Use this to organize settings into logical groups. Each section
 * has a title, optional description, and contains setting controls.
 *
 * @example
 * ```tsx
 * <SettingsSection
 *   title="Display"
 *   description="Control how content is displayed"
 * >
 *   <SettingsRow
 *     label="Reduce motion"
 *     description="Minimize animations"
 *   >
 *     <Switch checked={reduceMotion} onCheckedChange={setReduceMotion} />
 *   </SettingsRow>
 * </SettingsSection>
 * ```
 */
export function SettingsSection({
  title,
  description,
  children,
  className,
  card = true,
}: SettingsSectionProps) {
  if (card) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent className="space-y-6">{children}</CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-1">
        <h3 className="text-lg font-medium">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="space-y-6">{children}</div>
    </div>
  );
}
