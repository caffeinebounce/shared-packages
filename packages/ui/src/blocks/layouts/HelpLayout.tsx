import { type ReactNode } from "react";
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
export function HelpLayout({ children, panel, isOpen, className }: HelpLayoutProps) {
  return (
    <div className={cn("flex min-h-screen", className)}>
      {/* Main content area - shrinks when panel is open */}
      <div
        className={cn(
          "flex-1 min-w-0 transition-all duration-200 ease-out",
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
