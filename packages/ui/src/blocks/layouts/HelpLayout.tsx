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
 * 
 * The layout maintains bounded height (h-full) to ensure child components
 * like AppLayout can use sticky headers with overflow-y-auto content areas.
 */
export function HelpLayout({
  children,
  panel,
  isOpen,
  className,
}: HelpLayoutProps) {
  return (
    // Inherits height from parent (h-full), handles horizontal layout only
    // min-h-0 allows shrinking below content size for proper overflow handling
    <div className={cn("flex h-full min-h-0", className)}>
      {/* Main content area - h-full ensures bounded height for sticky headers */}
      <div
        className={cn(
          "h-full min-h-0 min-w-0 flex-1 transition-all duration-200 ease-out",
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
