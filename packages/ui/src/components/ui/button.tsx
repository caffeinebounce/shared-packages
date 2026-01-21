import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import type * as React from "react";

import { cn } from "../../utils";

/**
 * Hover effect styles for buttons
 * - slide: Color slides up from bottom (default for primary buttons via CSS)
 * - glow: Adds a glow effect on hover
 * - scale: Scales up slightly on hover
 * - none: No hover effect
 */
export type ButtonHoverEffect = "slide" | "glow" | "scale" | "none";

/**
 * Corner styles for buttons
 * - default: Standard rounded corners (rounded-md)
 * - pill: Fully rounded ends (rounded-full)
 * - sharp: No rounding (rounded-none)
 */
export type ButtonCorners = "default" | "pill" | "sharp";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all cursor-pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm " +
          "hover:bg-primary/90 hover:shadow-md " +
          "active:bg-primary/80",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background text-foreground shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "text-foreground hover:bg-accent hover:text-accent-foreground",
        "ghost-icon":
          "text-icon hover:text-icon-hover [&_svg]:transition-transform [&_svg]:duration-200 hover:[&_svg]:scale-110",
        muted: "text-muted-foreground hover:text-foreground transition-colors",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-xs": "size-6 [&_svg]:size-3.5",
        "icon-lg": "size-10",
      },
      corners: {
        default: "",
        pill: "rounded-full",
        sharp: "rounded-none",
      },
      hoverEffect: {
        slide: "", // Handled via CSS data-attribute for default variant
        glow: "hover:shadow-lg hover:shadow-primary/25",
        scale: "hover:scale-105 active:scale-95",
        none: "hover:shadow-none",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      corners: "default",
      hoverEffect: "slide",
    },
  },
);

export interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  /** Show loading spinner and disable button */
  loading?: boolean;
}

function Button({
  className,
  variant,
  size,
  corners,
  hoverEffect,
  asChild = false,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  // When asChild is true, we can't modify the children structure
  // so loading prop won't show a spinner (the wrapped component handles its own state)
  if (asChild) {
    return (
      <Slot
        data-slot="button"
        data-variant={variant || "default"}
        data-hover-effect={hoverEffect || "slide"}
        className={cn(
          buttonVariants({ variant, size, corners, hoverEffect, className }),
        )}
        aria-disabled={disabled || loading || undefined}
        {...props}
      >
        {children}
      </Slot>
    );
  }

  return (
    <button
      data-slot="button"
      data-variant={variant || "default"}
      data-hover-effect={hoverEffect || "slide"}
      className={cn(
        buttonVariants({ variant, size, corners, hoverEffect, className }),
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

export { Button, buttonVariants };
