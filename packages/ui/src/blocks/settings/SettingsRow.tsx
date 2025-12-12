import type { ReactNode } from "react";
import { Label } from "../../components/ui/label";
import { cn } from "../../utils";

export interface SettingsRowProps {
  /** Setting label */
  label: string;
  /** Setting description */
  description?: string;
  /** The control (Switch, Select, etc.) */
  children: ReactNode;
  /** HTML id for the control (for label association) */
  htmlFor?: string;
  /** Additional class name */
  className?: string;
  /** Layout direction */
  layout?: "horizontal" | "vertical";
}

/**
 * SettingsRow - A single setting with label, description, and control
 *
 * @example
 * ```tsx
 * <SettingsRow
 *   label="Show keyboard shortcuts"
 *   description="Display keyboard shortcut hints throughout the interface"
 *   htmlFor="keyboard-shortcuts"
 * >
 *   <Switch
 *     id="keyboard-shortcuts"
 *     checked={showShortcuts}
 *     onCheckedChange={setShowShortcuts}
 *   />
 * </SettingsRow>
 * ```
 */
export function SettingsRow({
  label,
  description,
  children,
  htmlFor,
  className,
  layout = "horizontal",
}: SettingsRowProps) {
  if (layout === "vertical") {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="space-y-0.5">
          <Label htmlFor={htmlFor} className="text-base">
            {label}
          </Label>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {children}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div className="space-y-0.5">
        <Label htmlFor={htmlFor} className="text-base">
          {label}
        </Label>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}
