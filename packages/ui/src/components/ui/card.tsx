import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "../../utils";

/**
 * Elevation styles for cards
 * - flat: No shadow, subtle background
 * - raised: Default shadow (shadow-sm)
 * - floating: Elevated shadow for emphasis
 */
export type CardElevation = "flat" | "raised" | "floating";

/**
 * Border styles for cards
 * - default: Standard border
 * - subtle: Lighter border
 * - none: No border
 */
export type CardBorder = "default" | "subtle" | "none";

const cardVariants = cva(
  "bg-card text-card-foreground flex flex-col gap-6 rounded-box py-6",
  {
    variants: {
      elevation: {
        flat: "shadow-none",
        raised: "shadow-sm",
        floating: "shadow-lg",
      },
      border: {
        default: "border",
        subtle: "border border-border/50",
        none: "border-0",
      },
    },
    defaultVariants: {
      elevation: "raised",
      border: "default",
    },
  },
);

export interface CardProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof cardVariants> {}

/**
 * Card - Container component for grouping related content
 *
 * @example
 * <Card>
 *   <CardHeader>
 *     <CardTitle>Title</CardTitle>
 *     <CardDescription>Description</CardDescription>
 *   </CardHeader>
 *   <CardContent>Content goes here</CardContent>
 * </Card>
 *
 * @example
 * <Card elevation="floating" border="none">
 *   <CardContent>Floating card without border</CardContent>
 * </Card>
 */
function Card({ className, elevation, border, ...props }: CardProps) {
  return (
    <div
      data-slot="card"
      className={cn(cardVariants({ elevation, border, className }))}
      {...props}
    />
  );
}

/**
 * CardHeader - Header section of a card, typically contains title and description
 *
 * @example
 * <CardHeader>
 *   <CardTitle>Settings</CardTitle>
 *   <CardDescription>Manage your account settings</CardDescription>
 * </CardHeader>
 */
function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className,
      )}
      {...props}
    />
  );
}

/**
 * CardTitle - Primary heading for a card
 */
function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  );
}

/**
 * CardDescription - Descriptive text for a card, appears below the title
 */
function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

/**
 * CardAction - Container for action buttons or controls in card header
 *
 * @example
 * <CardAction>
 *   <Button variant="ghost" size="icon-sm">
 *     <MoreVertical />
 *   </Button>
 * </CardAction>
 */
function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className,
      )}
      {...props}
    />
  );
}

/**
 * CardContent - Main content area of a card
 */
function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  );
}

/**
 * CardFooter - Footer section of a card, typically contains actions or metadata
 */
function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  );
}

export {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  cardVariants,
};
