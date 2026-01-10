/**
 * Shared styling constants for DataTable topper action buttons.
 *
 * These ensure consistent appearance across all DataTable header actions:
 * - Views dropdown
 * - Column picker
 * - Add button
 * - Search (when implemented as button)
 *
 * Uses the ghost-icon variant for:
 * - No background hover effect
 * - Icon scale animation on hover
 * - Consistent text-icon color
 */

import type { ButtonProps } from "../../components/ui/button";

/**
 * Standard button props for DataTable topper actions.
 * Apply these to buttons that appear in the DataTableTopper.
 */
export const dataTableTopperButtonProps = {
  variant: "ghost-icon",
  size: "icon-sm",
} as const satisfies Pick<ButtonProps, "variant" | "size">;

/**
 * CSS classes for responsive topper buttons with labels.
 * Use when button has both icon and text label that hides on small screens.
 */
export const dataTableTopperResponsiveClasses =
  "w-8 @min-[450px]:w-auto @min-[450px]:px-2";

/**
 * CSS classes for the button when dropdown is open.
 */
export const dataTableTopperOpenStateClasses =
  "data-[state=open]:text-foreground";

/**
 * CSS classes for icon-only elements in the topper (matching ghost-icon variant).
 * Use for custom buttons or icon elements that aren't using the Button component.
 */
export const dataTableTopperIconClasses =
  "text-icon hover:text-icon-hover [&_svg]:transition-transform [&_svg]:duration-200 hover:[&_svg]:scale-110";
