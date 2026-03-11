"use client";

import { ArrowUpRight, TrendingDown, TrendingUp } from "lucide-react";
import type * as React from "react";
import { useState } from "react";

import { cn } from "../../utils";
import { Badge } from "./badge";
import { Card, CardContent, CardHeader, CardTitle } from "./card";

export type TrendDirection = "up" | "down" | "neutral";

export interface StatCardTrend {
  /** The trend value to display */
  value: number;
  /** Direction of the trend */
  direction: TrendDirection;
  /** Optional label (e.g., "vs last month") */
  label?: string;
  /** Whether to format value as percentage (default: true) */
  isPercentage?: boolean;
}

/** Format type for stat values */
export type StatValueFormat =
  | "number"
  | "currency"
  | "percent"
  | "compact"
  | "none";

/** Data point for the chart */
export interface StatChartDataPoint {
  /** Label for the data point (e.g., date, month) */
  label: string;
  /** The value at this point */
  value: number;
}

/** Chart configuration for the flip side */
export interface StatCardChartConfig {
  /** Array of data points to display */
  data: StatChartDataPoint[];
  /** Type of chart to display */
  type?: "line" | "bar" | "area";
  /** Period label (e.g., "Last 7 days", "This month") */
  periodLabel?: string;
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
  /** Optional icon displayed in the card header */
  icon?: React.ReactNode;
  /** Optional trend indicator with badge */
  trend?: StatCardTrend;
  /** Visual variant */
  variant?: "default" | "muted" | "gradient" | "outline";
  /** Optional className for customization */
  className?: string;
  /** Size variant for layout density */
  size?: "default" | "compact";
  /**
   * How to format the numeric value
   * - "number": Locale-formatted number (1,234)
   * - "currency": Currency format ($1,234.00)
   * - "percent": Percentage format (12.3%)
   * - "compact": Compact notation (1.2K, 1.5M)
   * - "none": Display as-is
   * @default "number" for numeric values, "none" for strings
   */
  format?: StatValueFormat;
  /** Currency code for currency format (default: "USD") */
  currencyCode?: string;
  /** Number of decimal places for percent format (default: 1) */
  percentDecimals?: number;
  /** @deprecated Use format="number" instead */
  formatValue?: boolean;
  /** Click handler for interactive cards */
  onClick?: () => void;
  /** URL to link to (wraps card in anchor behavior) */
  href?: string;
  /** Chart configuration for the flip side. When provided, enables the flip feature */
  chart?: StatCardChartConfig;
  /** Which side to show initially when chart is enabled */
  defaultSide?: "stat" | "chart";
}

function formatTrendValue(value: number, isPercentage = true): string {
  const sign = value >= 0 ? "+" : "";
  return isPercentage ? `${sign}${value}%` : `${sign}${value}`;
}

/**
 * Format a numeric value based on the specified format type
 */
function formatStatValue(
  value: string | number,
  format: StatValueFormat,
  options?: { currencyCode?: string; percentDecimals?: number },
): string {
  // If it's already a string and format is "none", return as-is
  if (typeof value === "string") {
    return value;
  }

  const num = value;

  switch (format) {
    case "currency":
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: options?.currencyCode ?? "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: num >= 1000 ? 0 : 2,
      }).format(num);

    case "percent":
      return new Intl.NumberFormat("en-US", {
        style: "percent",
        minimumFractionDigits: 0,
        maximumFractionDigits: options?.percentDecimals ?? 1,
      }).format(num / 100);

    case "compact":
      return new Intl.NumberFormat("en-US", {
        notation: "compact",
        compactDisplay: "short",
        maximumFractionDigits: 1,
      }).format(num);

    case "number":
      // For large numbers, use compact notation automatically
      if (Math.abs(num) >= 1_000_000) {
        return new Intl.NumberFormat("en-US", {
          notation: "compact",
          compactDisplay: "short",
          maximumFractionDigits: 1,
        }).format(num);
      }
      return new Intl.NumberFormat("en-US").format(num);

    default:
      return String(value);
  }
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
      {formatTrendValue(trend.value, trend.isPercentage ?? true)}
    </Badge>
  );
}

/** Navigation dots for flip card - visual indicator only, parent button handles click */
function FlipIndicator({ activeSide }: { activeSide: "stat" | "chart" }) {
  return (
    <div
      className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 pointer-events-none"
      aria-hidden="true"
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full transition-colors",
          activeSide === "stat" ? "bg-foreground/60" : "bg-foreground/20",
        )}
      />
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full transition-colors",
          activeSide === "chart" ? "bg-foreground/60" : "bg-foreground/20",
        )}
      />
    </div>
  );
}

/** Simple mini chart using SVG - styled to match NewUsersChart */
function MiniChart({ data, type = "area", periodLabel }: StatCardChartConfig) {
  if (!data || data.length === 0) return null;

  const values = data.map((d) => d.value);
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const range = maxValue - minValue || 1;

  // Chart dimensions - taller for better visibility
  const width = 100;
  const height = 40;
  const paddingX = 0;
  const paddingY = 4;

  // Calculate points with some vertical padding
  const points = data.map((d, i) => {
    const normalizedX = data.length > 1 ? i / (data.length - 1) : 0.5;
    const x = paddingX + normalizedX * (width - paddingX * 2);
    const y =
      height -
      paddingY -
      ((d.value - minValue) / range) * (height - paddingY * 2);
    return { x, y, ...d };
  });

  // Create smooth bezier curve path (similar to Recharts "natural" type)
  const createSmoothPath = (pts: typeof points): string => {
    if (pts.length < 2) return "";

    let path = `M ${pts[0].x} ${pts[0].y}`;

    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[Math.min(pts.length - 1, i + 2)];

      // Calculate control points for smooth curve
      const tension = 0.3;
      const cp1x = p1.x + (p2.x - p0.x) * tension;
      const cp1y = p1.y + (p2.y - p0.y) * tension;
      const cp2x = p2.x - (p3.x - p1.x) * tension;
      const cp2y = p2.y - (p3.y - p1.y) * tension;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }

    return path;
  };

  const smoothPath = createSmoothPath(points);
  const areaPath = `${smoothPath} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  // Calculate bar width for bar chart
  const barWidth = (width - paddingX * 2) / data.length - 2;

  // Generate unique ID for gradient
  const gradientId = `miniChartGradient-${Math.random().toString(36).substring(2, 11)}`;

  return (
    <div className="flex flex-col h-full justify-center px-1">
      {periodLabel && (
        <p className="text-xs text-muted-foreground mb-2">{periodLabel}</p>
      )}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-20"
        preserveAspectRatio="none"
        aria-label="Chart showing trend data"
        role="img"
      >
        <defs>
          {/* Gradient matching NewUsersChart style */}
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              className="[stop-color:hsl(var(--primary))]"
              stopOpacity={0.8}
            />
            <stop
              offset="95%"
              className="[stop-color:hsl(var(--primary))]"
              stopOpacity={0.1}
            />
          </linearGradient>
        </defs>

        {type === "bar" ? (
          // Bar chart
          <g>
            {points.map((p, i) => (
              <rect
                key={p.label}
                x={paddingX + (i * (width - paddingX * 2)) / data.length + 1}
                y={p.y}
                width={barWidth}
                height={height - p.y}
                className="fill-primary/30"
                rx={1}
              />
            ))}
          </g>
        ) : (
          // Line/Area chart - matching NewUsersChart style
          <g>
            {type === "area" && (
              <path d={areaPath} fill={`url(#${gradientId})`} />
            )}
            <path
              d={smoothPath}
              fill="none"
              className="stroke-primary"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        )}
      </svg>
      {/* X-axis labels */}
      <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
        <span>{data[0]?.label}</span>
        <span>{data[data.length - 1]?.label}</span>
      </div>
    </div>
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
  size = "default",
  format,
  currencyCode,
  percentDecimals,
  formatValue = false,
  onClick,
  href,
  chart,
  defaultSide = "stat",
}: StatCardProps) {
  const [activeSide, setActiveSide] = useState<"stat" | "chart">(defaultSide);

  // Determine format: explicit format prop takes precedence, then legacy formatValue, then auto-detect
  const effectiveFormat: StatValueFormat =
    format ??
    (formatValue ? "number" : typeof value === "number" ? "number" : "none");

  const displayValue = formatStatValue(value, effectiveFormat, {
    currencyCode,
    percentDecimals,
  });

  const variantStyles = {
    default: "",
    muted:
      "bg-linear-to-t from-muted/60 to-muted/20 hover:from-muted/70 hover:to-muted/30 transition-colors",
    gradient: "bg-gradient-to-t from-primary/5 to-card dark:bg-card",
    outline: "border-2",
  };

  const isInteractive = onClick || href;
  const hasChart = !!chart;
  const isCompact = size === "compact";

  const handleFlip = () => {
    setActiveSide((prev) => (prev === "stat" ? "chart" : "stat"));
  };

  // Handle card body click - flip if chart available, otherwise use onClick
  const handleBodyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasChart) {
      handleFlip();
    } else if (onClick) {
      onClick();
    }
  };

  // Handle header click - navigate if href, otherwise flip or onClick
  const handleHeaderClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (href) {
      // Let the anchor handle navigation
      return;
    }
    if (onClick) {
      onClick();
    } else if (hasChart) {
      handleFlip();
    }
  };

  const cardBaseStyles = cn(
    "h-full relative overflow-hidden gap-0",
    isCompact ? "min-h-[112px] p-3 md:min-h-[120px] md:p-4" : "py-3",
    variantStyles[variant],
    hasChart && "pb-6",
  );

  // Shared header component for both sides
  const renderHeader = (showIcon = true) => (
    <CardHeader
      className={cn(
        "flex flex-row items-center justify-between space-y-0 py-0",
        isCompact ? "px-0" : "px-4",
      )}
    >
      {href ? (
        <a
          href={href}
          className="flex items-center gap-2 hover:text-primary transition-colors z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <CardTitle
            className={cn(
              isCompact
                ? "text-xs md:text-sm font-medium text-muted-foreground"
                : "text-sm font-medium",
            )}
          >
            {title}
          </CardTitle>
          <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
        </a>
      ) : (
        <CardTitle
          className={cn(
            isCompact
              ? "text-xs md:text-sm font-medium text-muted-foreground"
              : "text-sm font-medium",
            "flex items-center gap-2",
            onClick && "cursor-pointer hover:text-primary transition-colors",
          )}
          onClick={handleHeaderClick}
        >
          {title}
        </CardTitle>
      )}
      {showIcon && icon && <div className="text-muted-foreground">{icon}</div>}
    </CardHeader>
  );

  // If no chart, render simple card without flip
  if (!hasChart) {
    return (
      <Card
        className={cn(
          cardBaseStyles,
          "group",
          isInteractive &&
            "cursor-pointer transition-colors hover:border-primary/50",
          className,
        )}
        onClick={onClick}
      >
        {renderHeader()}
        <CardContent
          className={cn("relative py-0", isCompact ? "px-0" : "px-4")}
        >
          {isCompact ? (
            <>
              <div className="mt-2 min-w-0">
                <span className="block text-2xl md:text-3xl font-semibold tracking-tight tabular-nums leading-none md:leading-tight truncate">
                  {displayValue}
                </span>
              </div>
              {(description || trend) && (
                <div className="mt-1.5 flex items-center gap-2 min-w-0">
                  {trend && <TrendBadge trend={trend} />}
                  {description && (
                    <p className="text-xs text-muted-foreground truncate">
                      {description}
                    </p>
                  )}
                </div>
              )}
              {trend?.label && (
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {trend.label}
                </p>
              )}
              {footer && (
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {footer}
                </p>
              )}
            </>
          ) : (
            <>
              <div className="relative overflow-hidden">
                <span className="block text-7xl md:text-8xl font-black tabular-nums leading-none tracking-tighter text-foreground/10 truncate">
                  {displayValue}
                </span>
              </div>
              {(description || trend) && (
                <div className="-mt-6 flex items-center gap-2 min-w-0">
                  {trend && <TrendBadge trend={trend} />}
                  {description && (
                    <p className="text-xs text-foreground/80 truncate">
                      {description}
                    </p>
                  )}
                </div>
              )}
              {footer && (
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {footer}
                </p>
              )}
              {trend?.label && (
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {trend.label}
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  // With chart: render flipping card
  return (
    <div
      className={cn("group h-full min-h-[160px]", className)}
      style={{ perspective: "1000px" }}
    >
      <button
        type="button"
        className={cn(
          "relative h-full w-full transition-transform duration-500 cursor-pointer text-left",
          "[transform-style:preserve-3d]",
          activeSide === "chart" && "[transform:rotateY(180deg)]",
        )}
        onClick={handleBodyClick}
        aria-label={
          activeSide === "chart" ? "Show statistic view" : "Show chart view"
        }
        aria-pressed={activeSide === "chart"}
      >
        {/* Front side - Stat Card */}
        <Card
          className={cn(
            cardBaseStyles,
            "absolute inset-0 [backface-visibility:hidden] [transform-style:preserve-3d] [transform:rotateY(0deg)]",
            "transition-colors hover:border-primary/50",
          )}
        >
          {renderHeader()}
          <CardContent
            className={cn("relative py-0", isCompact ? "px-0" : "px-4")}
          >
            {isCompact ? (
              <>
                <div className="mt-2 min-w-0">
                  <span className="block text-2xl md:text-3xl font-semibold tracking-tight tabular-nums leading-none md:leading-tight truncate">
                    {displayValue}
                  </span>
                </div>
                {(description || trend) && (
                  <div className="mt-1.5 flex items-center gap-2 min-w-0">
                    {trend && <TrendBadge trend={trend} />}
                    {description && (
                      <p className="text-xs text-muted-foreground truncate">
                        {description}
                      </p>
                    )}
                  </div>
                )}
                {trend?.label && (
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {trend.label}
                  </p>
                )}
                {footer && (
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {footer}
                  </p>
                )}
              </>
            ) : (
              <>
                <div className="relative overflow-hidden">
                  <span className="block text-7xl md:text-8xl font-black tabular-nums leading-none tracking-tighter text-foreground/10 truncate">
                    {displayValue}
                  </span>
                </div>
                {(description || trend) && (
                  <div className="-mt-6 flex items-center gap-2 min-w-0">
                    {trend && <TrendBadge trend={trend} />}
                    {description && (
                      <p className="text-xs text-foreground/80 truncate">
                        {description}
                      </p>
                    )}
                  </div>
                )}
                {footer && (
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {footer}
                  </p>
                )}
                {trend?.label && (
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {trend.label}
                  </p>
                )}
              </>
            )}
          </CardContent>
          <FlipIndicator activeSide={activeSide} />
        </Card>

        {/* Back side - Chart Card */}
        <Card
          className={cn(
            cardBaseStyles,
            "absolute inset-0 [backface-visibility:hidden] [transform-style:preserve-3d] [transform:rotateY(180deg)]",
            "transition-colors hover:border-primary/50",
          )}
        >
          {renderHeader(false)}
          <CardContent className="relative px-4 py-0 h-full">
            <MiniChart {...chart} />
          </CardContent>
          <FlipIndicator activeSide={activeSide} />
        </Card>
      </button>
    </div>
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
  } as const;

  const smColClasses = {
    1: "sm:grid-cols-1",
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-3",
    4: "sm:grid-cols-4",
  } as const;

  const mdColClasses = {
    1: "md:grid-cols-1",
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-4",
  } as const;

  const lgColClasses = {
    1: "lg:grid-cols-1",
    2: "lg:grid-cols-2",
    3: "lg:grid-cols-3",
    4: "lg:grid-cols-4",
  } as const;

  return (
    <div
      className={cn(
        "grid gap-4",
        columns.default && colClasses[columns.default],
        columns.sm && smColClasses[columns.sm],
        columns.md && mdColClasses[columns.md],
        columns.lg && lgColClasses[columns.lg],
        className,
      )}
    >
      {children}
    </div>
  );
}
