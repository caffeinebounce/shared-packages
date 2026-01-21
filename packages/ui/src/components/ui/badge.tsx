import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "../../utils";

/**
 * Shape styles for badges
 * - pill: Fully rounded (default)
 * - rounded: Slightly rounded corners
 * - square: Sharp corners
 */
export type BadgeShape = "pill" | "rounded" | "square";

/**
 * Size variants for badges
 * - sm: Smaller badge
 * - default: Standard size
 * - lg: Larger badge
 */
export type BadgeSize = "sm" | "default" | "lg";

const badgeVariants = cva(
  "inline-flex items-center border font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        success:
          "border-transparent bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        warning:
          "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
        muted: "border-transparent bg-muted text-muted-foreground",
      },
      shape: {
        pill: "rounded-full",
        rounded: "rounded-md",
        square: "rounded-none",
      },
      size: {
        sm: "px-1 text-[9px]",
        default: "px-1.5 text-[10px]",
        lg: "px-2 py-0.5 text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      shape: "pill",
      size: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

/**
 * Badge - Visual indicator for status, counts, or labels
 *
 * @example
 * <Badge variant="secondary">New</Badge>
 *
 * @example
 * <Badge variant="destructive">Error</Badge>
 *
 * @example
 * <Badge variant="success" shape="rounded" size="lg">Active</Badge>
 */
function Badge({ className, variant, shape, size, ...props }: BadgeProps) {
  return (
    <div
      data-slot="badge"
      className={cn(badgeVariants({ variant, shape, size }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
