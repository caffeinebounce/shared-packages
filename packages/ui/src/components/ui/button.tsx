import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import type * as React from "react";

import { cn } from "../../utils";

/**
 * Hover effect styles for buttons
 * - slide: Color slides up from bottom
 * - glow: Adds a glow effect on hover
 * - scale: Scales up slightly on hover
 * - none: No hover effect
 */
export type ButtonHoverEffect = "slide" | "glow" | "scale" | "none";

/**
 * Corner styles for buttons
 * - default: Uses the shared global box radius
 * - pill: Fully rounded ends (rounded-full)
 * - sharp: No rounding (rounded-none)
 */
export type ButtonCorners = "default" | "pill" | "sharp";

const CTA_BUTTON_VARIANTS = ["default", "outline", "secondary", "premium"] as const;
type CtaButtonVariant = (typeof CTA_BUTTON_VARIANTS)[number];
type ResolvedButtonHoverEffect = ButtonHoverEffect | "theme";

function isCtaButtonVariant(variant: ButtonProps["variant"]): variant is CtaButtonVariant {
  return CTA_BUTTON_VARIANTS.includes((variant || "default") as CtaButtonVariant);
}

function resolveButtonHoverEffect(
  variant: ButtonProps["variant"],
  hoverEffect: ButtonProps["hoverEffect"],
): ResolvedButtonHoverEffect {
  if (hoverEffect) {
    return hoverEffect;
  }

  return isCtaButtonVariant(variant) ? "theme" : "slide";
}

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm transition-all cursor-pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "button-cta button-cta-default border shadow-sm",
        premium: "button-cta button-cta-premium border shadow-sm",
        destructive:
          "border bg-destructive text-white hover:bg-destructive/90 dark:bg-destructive/60",
        outline: "button-cta button-cta-outline border shadow-xs",
        secondary: "button-cta button-cta-secondary border",
        ghost: "font-medium text-foreground hover:bg-accent hover:text-accent-foreground",
        "ghost-icon":
          "font-medium text-icon hover:text-icon-hover [&_svg]:transition-transform [&_svg]:duration-200 hover:[&_svg]:scale-110",
        muted: "font-medium text-muted-foreground hover:text-foreground transition-colors",
        link: "font-medium text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-xs": "size-6 [&_svg]:size-3.5",
        "icon-lg": "size-10",
      },
      corners: {
        default: "rounded-box",
        pill: "rounded-full",
        sharp: "rounded-none",
      },
      hoverEffect: {
        // Slide/theme effects are handled via CSS pseudo-elements (see base.css)
        slide: "",
        glow: "hover:shadow-lg hover:shadow-primary/25",
        scale: "hover:scale-105 active:scale-95",
        // "none" disables extra hover effects but preserves variant hover styles
        none: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      corners: "default",
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
  const resolvedHoverEffect = resolveButtonHoverEffect(variant, hoverEffect);

  // When asChild is true, we can't modify the children structure
  // so loading prop won't show a spinner (the wrapped component handles its own state)
  if (asChild) {
    return (
      <Slot
        data-slot="button"
        data-variant={variant || "default"}
        data-hover-effect={resolvedHoverEffect}
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
      data-hover-effect={resolvedHoverEffect}
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
