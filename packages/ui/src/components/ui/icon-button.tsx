import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "../../utils";

const iconButtonVariants = cva(
  "inline-flex items-center justify-center rounded-md transition-colors duration-200 cursor-pointer disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default: "text-muted-foreground hover:text-foreground hover:bg-accent",
        ghost:
          "text-muted-foreground/50 hover:text-foreground hover:bg-transparent",
        delete:
          "text-muted-foreground/50 hover:text-destructive hover:bg-transparent",
        edit: "text-muted-foreground/50 hover:text-foreground hover:bg-transparent",
        destructive:
          "text-destructive hover:text-destructive hover:bg-destructive/10",
      },
      size: {
        default: "h-8 w-8 [&_svg]:size-4",
        sm: "h-6 w-6 [&_svg]:size-3.5",
        lg: "h-10 w-10 [&_svg]:size-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface IconButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof iconButtonVariants> {}

/**
 * Icon-only button with common variants for actions like edit, delete, etc.
 *
 * @example
 * ```tsx
 * <IconButton variant="delete" onClick={handleDelete}>
 *   <Trash2 />
 * </IconButton>
 *
 * <IconButton variant="edit" onClick={handleEdit}>
 *   <Pencil />
 * </IconButton>
 * ```
 */
function IconButton({ className, variant, size, ...props }: IconButtonProps) {
  return (
    <button
      type="button"
      data-slot="icon-button"
      className={cn(iconButtonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { IconButton, iconButtonVariants };
