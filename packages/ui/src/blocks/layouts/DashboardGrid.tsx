"use client";

import { cn } from "../../utils";

export interface DashboardGridProps {
  /** Content to render inside the dashboard grid layout. */
  children: React.ReactNode;
  /** Additional CSS class names to apply to the root container. */
  className?: string;
}

/**
 * Dashboard layout container for stacking page sections with consistent spacing.
 *
 * Use \`DashboardGrid\` to wrap the main content areas of a dashboard page, such as
 * summary cards, data tables, and activity feeds. It arranges children in a
 * vertical column with a standard gap, while allowing additional layout control
 * via the \`className\` prop.
 *
 * @remarks
 * This component is intentionally minimal and only manages vertical spacing.
 * Combine it with other layout primitives (such as card, grid, or section
 * components) to build rich dashboard views.
 *
 * @example Basic usage
 * \`\`\`tsx
 * import { DashboardGrid } from "@caffeinebounce/ui";
 *
 * function DashboardPage() {
 *   return (
 *     <DashboardGrid>
 *       <StatsOverview />
 *       <RecentActivity />
 *       <TeamTable />
 *     </DashboardGrid>
 *   );
 * }
 * \`\`\`
 *
 * @example With custom spacing and max width
 * \`\`\`tsx
 * <DashboardGrid className="max-w-6xl mx-auto gap-6">
 *   <StatsOverview />
 *   <RecentActivity />
 * </DashboardGrid>
 * \`\`\`
 *
 * @param props - Dashboard layout props.
 */
export function DashboardGrid({ children, className }: DashboardGridProps) {
  return <div className={cn("flex flex-col gap-6", className)}>{children}</div>;
}
