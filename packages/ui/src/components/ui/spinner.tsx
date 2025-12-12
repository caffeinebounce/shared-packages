import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "../../utils";

const spinnerVariants = cva("animate-spin text-muted-foreground", {
  variants: {
    size: {
      xs: "h-3 w-3",
      sm: "h-4 w-4",
      md: "h-6 w-6",
      lg: "h-8 w-8",
    },
  },
  defaultVariants: {
    size: "sm",
  },
});

export interface SpinnerProps
  extends React.ComponentProps<"svg">,
    VariantProps<typeof spinnerVariants> {}

function Spinner({ className, size, ...props }: SpinnerProps) {
  return (
    <Loader2 className={cn(spinnerVariants({ size, className }))} {...props} />
  );
}

export { Spinner, spinnerVariants };
