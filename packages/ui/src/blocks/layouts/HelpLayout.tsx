import type { ReactNode } from "react";
import { cn } from "../../utils";

export interface HelpLayoutProps {
  children: ReactNode;
  panel: ReactNode;
  isOpen: boolean;
  className?: string;
}

/**
 * HelpLayout wraps content and shifts it when the help panel is open.
 * This allows users to continue working while viewing help.
 */
export function HelpLayout({
  children,
  panel,
  isOpen,
  className,
}: HelpLayoutProps) {
  return (
    // Inherits height from parent, handles horizontal layout only
    <div className={cn("flex h-full min-h-0", className)}>
      {/* Main content area - shrinks when panel is open */}
      <div
        className={cn(
          "flex flex-col flex-1 min-w-0 min-h-0 transition-all duration-200 ease-out",
          isOpen && "sm:mr-100",
        )}
      >
        {children}
      </div>

      {/* Help panel - fixed position on the right */}
      {panel}
    </div>
  );
}
