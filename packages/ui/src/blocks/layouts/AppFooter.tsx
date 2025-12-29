import type { ReactNode } from "react";
import { cn } from "../../utils";

export interface AppFooterProps {
  children: ReactNode;
  className?: string;
}

export function AppFooter({ children, className }: AppFooterProps) {
  return (
    <div
      className={cn(
        "sticky bottom-0 z-10 mt-auto border-t bg-background/95 px-4 py-1 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className,
      )}
    >
      {children}
    </div>
  );
}
