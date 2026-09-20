import { cva, type VariantProps } from "class-variance-authority";
import { Loader2Icon } from "lucide-react";
import type * as React from "react";

import { cn } from "../../utils";

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <Loader2Icon
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  );
}

// --- local extension over shadcn ---
// Consumers size the spinner through `size="xs" | "sm" | "md" | "lg"`, and the
// pre-sync spinner inherited the muted foreground colour. Layer both on top of
// the upstream component instead of forking it.
const spinnerVariants = cva("text-muted-foreground", {
  variants: {
    size: {
      xs: "size-3",
      sm: "size-4",
      md: "size-6",
      lg: "size-8",
    },
  },
  defaultVariants: {
    size: "sm",
  },
});

interface SpinnerProps
  extends React.ComponentProps<typeof Spinner>,
    VariantProps<typeof spinnerVariants> {}

function SizedSpinner({ className, size, ...props }: SpinnerProps) {
  return (
    <Spinner className={cn(spinnerVariants({ size }), className)} {...props} />
  );
}

export type { SpinnerProps };
export { SizedSpinner as Spinner, spinnerVariants };
