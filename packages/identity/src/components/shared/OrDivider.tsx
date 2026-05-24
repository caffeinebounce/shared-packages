import { cn } from "@caffeinebounce/ui/primitives";

export interface OrDividerProps {
  /** Additional className */
  className?: string;
}

/**
 * OrDivider - A horizontal divider with centered 'or' text, used between OAuth and email/password forms
 */
export function OrDivider({ className }: OrDividerProps) {
  return (
    <div className={cn("flex items-center gap-3 py-1", className)}>
      <span className="flex-1 border-t border-border" />
      <span className="text-xs uppercase text-muted-foreground">or</span>
      <span className="flex-1 border-t border-border" />
    </div>
  );
}
