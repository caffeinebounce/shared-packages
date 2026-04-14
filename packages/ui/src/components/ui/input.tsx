import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "../../utils";

/**
 * Input style variants
 * - default: Standard bordered input
 * - filled: Filled background, no border
 * - underline: Only bottom border
 */
export type InputVariant = "default" | "filled" | "underline";

const inputVariants = cva(
  "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground h-9 w-full min-w-0 px-3 py-1 text-base transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
  {
    variants: {
      variant: {
        default:
          "dark:bg-input/30 border-input rounded-box border bg-transparent shadow-xs " +
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] " +
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        filled:
          "bg-muted/50 dark:bg-input/50 rounded-box border-0 " +
          "focus-visible:bg-muted/70 dark:focus-visible:bg-input/70 focus-visible:ring-ring/50 focus-visible:ring-[3px] " +
          "aria-invalid:bg-destructive/10 aria-invalid:ring-destructive/20",
        underline:
          "bg-transparent border-0 border-b-2 border-input rounded-none px-0 " +
          "focus-visible:border-primary " +
          "aria-invalid:border-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface InputProps
  extends React.ComponentProps<"input">,
    VariantProps<typeof inputVariants> {}

/**
 * Input - Text input field with consistent styling
 *
 * @example
 * <Input type="text" placeholder="Enter your name" />
 *
 * @example
 * <Input type="email" placeholder="email@example.com" variant="filled" />
 *
 * @example
 * <Input type="text" placeholder="Search..." variant="underline" />
 */
function Input({ className, type, variant, ...props }: InputProps) {
  return (
    <input
      type={type}
      data-slot="input"
      data-autofill-aware="true"
      className={cn(inputVariants({ variant, className }))}
      {...props}
    />
  );
}

export { Input, inputVariants };
