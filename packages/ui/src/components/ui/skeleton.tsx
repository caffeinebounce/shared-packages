import { cn } from "../../utils";

/**
 * Skeleton - Placeholder for loading content
 *
 * @example
 * <Skeleton className="h-4 w-32" />
 *
 * @example
 * <div className="space-y-2">
 *   <Skeleton className="h-4 w-full" />
 *   <Skeleton className="h-4 w-3/4" />
 * </div>
 */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-accent animate-pulse rounded-box", className)}
      {...props}
    />
  );
}

export { Skeleton };
