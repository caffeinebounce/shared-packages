import { TrendingDown, TrendingUp } from "lucide-react";
import type * as React from "react";

import { cn } from "../../utils";
import { Badge } from "./badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";

export type TrendDirection = "up" | "down" | "neutral";

export interface StatCardTrend {
  /** Percentage or absolute value to display */
  value: number;
  /** Direction of the trend */
  direction: TrendDirection;
  /** Optional label (e.g., "vs last month") */
  label?: string;
}

export interface StatCardProps {
  /** Title/label for the stat */
  title: string;
  /** The main value to display */
  value: string | number;
  /** Optional description shown below the value */
  description?: string;
  /** Optional footer text with additional context */
  footer?: string;
  /** Optional icon displayed in the card action area */
  icon?: React.ReactNode;
  /** Optional trend indicator with badge */
  trend?: StatCardTrend;
  /** Visual variant */
  variant?: "default" | "gradient" | "outline";
  /** Optional className for customization */
  className?: string;
  /** Whether to format the value as a number with locale formatting */
  formatValue?: boolean;
  /** Click handler for interactive cards */
  onClick?: () => void;
}

function formatTrendValue(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value}%`;
}

function TrendBadge({ trend }: { trend: StatCardTrend }) {
  const Icon =
    trend.direction === "up"
      ? TrendingUp
      : trend.direction === "down"
        ? TrendingDown
        : null;

  const colorClass =
    trend.direction === "up"
      ? "text-emerald-600 dark:text-emerald-400"
      : trend.direction === "down"
        ? "text-destructive"
        : "text-muted-foreground";

  return (
    <Badge
      variant="outline"
      className={cn("gap-1 rounded-md text-xs", colorClass)}
    >
      {Icon && <Icon className="size-3" />}
      {formatTrendValue(trend.value)}
    </Badge>
  );
}

export function StatCard({
  title,
  value,
  description,
  footer,
  icon,
  trend,
  variant = "default",
  className,
  formatValue = false,
  onClick,
}: StatCardProps) {
  const displayValue =
    formatValue && typeof value === "number" ? value.toLocaleString() : value;

  const variantStyles = {
    default: "",
    gradient: "bg-gradient-to-t from-primary/5 to-card dark:bg-card",
    outline: "border-2",
  };

  return (
    <Card
      className={cn(
        "@container/stat-card",
        variantStyles[variant],
        onClick && "cursor-pointer transition-colors hover:border-primary/50",
        className,
      )}
      onClick={onClick}
    >
      <CardHeader>
        <CardDescription className="text-sm font-medium">
          {title}
        </CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[200px]/stat-card:text-3xl">
          {displayValue}
        </CardTitle>
        {(icon || trend) && (
          <CardAction>
            <div className="flex items-center gap-2">
              {trend && <TrendBadge trend={trend} />}
              {icon && <div className="text-muted-foreground">{icon}</div>}
            </div>
          </CardAction>
        )}
        {description && (
          <CardDescription className="col-span-2 mt-1">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      {(footer || (trend?.label && !footer)) && (
        <CardFooter className="flex-col items-start gap-1 text-sm">
          {footer ? (
            <div className="line-clamp-1 flex items-center gap-2 font-medium">
              {footer}
              {trend && (
                <>
                  {trend.direction === "up" && (
                    <TrendingUp className="size-4 text-emerald-600 dark:text-emerald-400" />
                  )}
                  {trend.direction === "down" && (
                    <TrendingDown className="size-4 text-destructive" />
                  )}
                </>
              )}
            </div>
          ) : null}
          {trend?.label && (
            <div className="text-muted-foreground">{trend.label}</div>
          )}
        </CardFooter>
      )}
    </Card>
  );
}

/** Container for stat cards with responsive grid */
export interface StatCardsContainerProps {
  children: React.ReactNode;
  /** Number of columns on different breakpoints */
  columns?: {
    default?: 1 | 2 | 3 | 4;
    sm?: 1 | 2 | 3 | 4;
    md?: 1 | 2 | 3 | 4;
    lg?: 1 | 2 | 3 | 4;
  };
  className?: string;
}

export function StatCardsContainer({
  children,
  columns = { default: 1, sm: 2, lg: 4 },
  className,
}: StatCardsContainerProps) {
  const colClasses = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
  };

  return (
    <div
      className={cn(
        "grid gap-4",
        columns.default && colClasses[columns.default],
        columns.sm && `sm:${colClasses[columns.sm]}`,
        columns.md && `md:${colClasses[columns.md]}`,
        columns.lg && `lg:${colClasses[columns.lg]}`,
        className,
      )}
    >
      {children}
    </div>
  );
}
