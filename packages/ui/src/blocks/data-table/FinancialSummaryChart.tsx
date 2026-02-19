"use client";

import { BarChart3, ChevronDown, ChevronUp } from "lucide-react";
import * as React from "react";
import {
  Area,
  AreaChart,
  Bar,
  CartesianGrid,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Tooltip as RadixTooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../components/ui/tooltip";
import { cn } from "../../utils/cn";
import {
  ChartTooltipRow,
  ChartTooltipShell,
  ChartTooltipTitle,
} from "./ChartTooltip";
import {
  getUnitDivisor as _getUnitDivisor,
  useFinanceDisplay as _useFinanceDisplay,
} from "./DataTableCurrencyCell";
import type {
  FinancialStatementEntry,
  TimeUnit,
} from "./FinancialStatementTable";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface FinancialMetric {
  /** Unique key */
  key: string;
  /** Display label */
  label: string;
  /** Which account classes to sum (e.g. ["Revenue"]) */
  accountClasses: string[];
  /** Color for the chart (CSS variable or hex) */
  color: string;
  /** Sign multiplier (default 1) — use -1 to flip sign (e.g. expenses shown positive) */
  sign?: number;
}

export interface ComputedMetric {
  /** Unique key */
  key: string;
  /** Display label */
  label: string;
  /** Formula: array of metric keys, prefix with "-" to subtract */
  formula: string[];
  /** Color */
  color: string;
  /** Chart type override for this metric */
  chartType?: "line" | "bar" | "area";
  /** Whether to show as dashed line */
  dashed?: boolean;
}

export type ChartVariant = "area" | "bar" | "line";

export interface FinancialSummaryChartConfig {
  /** Metrics derived directly from account data */
  metrics: FinancialMetric[];
  /** Computed metrics (e.g. net income = revenue - expenses) */
  computedMetrics?: ComputedMetric[];
  /** Chart type (default: "area") */
  chartType?: ChartVariant;
  /** Height in pixels (default: 260) */
  height?: number;
  /** Whether to show the zero reference line */
  showZeroLine?: boolean;
  /** Whether chart starts expanded (default: true) */
  defaultExpanded?: boolean;
  /** Title for the chart section */
  title?: string;
}

// ── Presets ────────────────────────────────────────────────────────────────────

export const INCOME_STATEMENT_CHART_CONFIG: FinancialSummaryChartConfig = {
  title: "Financial Overview",
  chartType: "area",
  height: 240,
  showZeroLine: true,
  defaultExpanded: false,
  metrics: [
    {
      key: "revenue",
      label: "Revenue",
      accountClasses: ["Revenue"],
      color: "var(--chart-2, #22c55e)",
    },
    {
      key: "expenses",
      label: "Expenses",
      accountClasses: ["Expense"],
      color: "var(--chart-1, #ef4444)",
      sign: -1,
    },
  ],
  computedMetrics: [
    {
      key: "netIncome",
      label: "Net Income",
      formula: ["revenue", "expenses"],
      color: "var(--chart-3, #3b82f6)",
      chartType: "line",
      dashed: true,
    },
  ],
};

export const CASH_FLOW_CHART_CONFIG: FinancialSummaryChartConfig = {
  title: "Cash Flow Overview",
  chartType: "bar",
  height: 240,
  showZeroLine: true,
  defaultExpanded: false,
  metrics: [
    {
      key: "operating",
      label: "Operating",
      accountClasses: ["Operating"],
      color: "var(--chart-2, #22c55e)",
    },
    {
      key: "investing",
      label: "Investing",
      accountClasses: ["Investing"],
      color: "var(--chart-4, #f59e0b)",
    },
    {
      key: "financing",
      label: "Financing",
      accountClasses: ["Financing"],
      color: "var(--chart-5, #8b5cf6)",
    },
  ],
  computedMetrics: [
    {
      key: "netCash",
      label: "Net Change",
      formula: ["operating", "investing", "financing"],
      color: "var(--chart-3, #3b82f6)",
      chartType: "line",
      dashed: true,
    },
  ],
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function toPeriodKey(date: string, unit: TimeUnit): string {
  const [y, m] = date.split("-").map(Number);
  if (unit === "year") return String(y);
  if (unit === "quarter") {
    const q = Math.floor((m - 1) / 3) + 1;
    return `${y}-Q${q}`;
  }
  return `${y}-${String(m).padStart(2, "0")}`;
}

function toPeriodLabel(key: string, unit: TimeUnit): string {
  if (unit === "year") return key;
  if (unit === "quarter") return key.replace("-", " ");
  const [year, month] = key.split("-");
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

function formatCurrency(value: number, divisor = 1): string {
  const v = divisor === 1 ? value : value / divisor;
  if (v === 0) return "$0";
  const abs = Math.abs(v);
  const neg = v < 0;
  if (abs >= 1_000_000)
    return `${neg ? "(" : ""}$${(abs / 1_000_000).toFixed(1)}M${neg ? ")" : ""}`;
  if (abs >= 1_000)
    return `${neg ? "(" : ""}$${(abs / 1_000).toFixed(0)}K${neg ? ")" : ""}`;
  return `${neg ? "(" : ""}$${abs.toFixed(0)}${neg ? ")" : ""}`;
}

function formatTooltipCurrency(value: number, divisor = 1): string {
  const v = divisor === 1 ? value : value / divisor;
  if (v < 0)
    return `($${Math.abs(v).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })})`;
  return `$${v.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

// ── Build chart data ──────────────────────────────────────────────────────────

function buildChartData(
  data: FinancialStatementEntry[],
  config: FinancialSummaryChartConfig,
  timeUnit: TimeUnit,
  priorTotals?: Record<string, number>,
): {
  chartData: Record<string, unknown>[];
  summaryCards: {
    key: string;
    label: string;
    value: number;
    color: string;
    trend?: number;
    priorValue?: number;
  }[];
} {
  // Aggregate by period + metric
  const periodMetrics = new Map<string, Record<string, number>>();
  const periodSet = new Set<string>();

  for (const entry of data) {
    const pk = toPeriodKey(entry.period_first_day, timeUnit);
    periodSet.add(pk);

    if (!periodMetrics.has(pk)) periodMetrics.set(pk, {});
    const pm = periodMetrics.get(pk)!;

    for (const metric of config.metrics) {
      if (metric.accountClasses.includes(entry.account_class)) {
        const sign = metric.sign ?? 1;
        pm[metric.key] = (pm[metric.key] || 0) + entry.amount * sign;
      }
    }
  }

  const periods = [...periodSet].sort();

  // Compute derived metrics
  for (const pk of periods) {
    const pm = periodMetrics.get(pk)!;
    for (const cm of config.computedMetrics ?? []) {
      let val = 0;
      for (const ref of cm.formula) {
        const subtract = ref.startsWith("-");
        const key = subtract ? ref.slice(1) : ref;
        val += (pm[key] || 0) * (subtract ? -1 : 1);
      }
      pm[cm.key] = val;
    }
  }

  // Build chart data array
  const chartData = periods.map((pk) => {
    const pm = periodMetrics.get(pk)!;
    return {
      period: pk,
      periodLabel: toPeriodLabel(pk, timeUnit),
      ...pm,
    };
  });

  // Summary cards: latest period values + trend vs prior
  const allMetrics = [
    ...config.metrics.map((m) => ({
      key: m.key,
      label: m.label,
      color: m.color,
    })),
    ...(config.computedMetrics ?? []).map((m) => ({
      key: m.key,
      label: m.label,
      color: m.color,
    })),
  ];

  // Build sign map from metrics config so prior totals get the same treatment
  const signMap = new Map<string, number>();
  for (const m of config.metrics) {
    signMap.set(m.key, m.sign ?? 1);
  }

  const summaryCards = allMetrics.map(({ key, label, color }) => {
    // Sum across all periods in the range (already has sign applied via aggregation)
    let total = 0;
    for (const pk of periods) {
      total += periodMetrics.get(pk)?.[key] ?? 0;
    }
    // Apply same sign to prior total for display, but compute trend on
    // absolute values so direction is always intuitive (positive = magnitude grew)
    const rawPrior = priorTotals?.[key];
    const sign = signMap.get(key) ?? 1;
    const priorTotal = rawPrior != null ? rawPrior * sign : undefined;
    const absTotal = Math.abs(total);
    const absPrior = rawPrior != null ? Math.abs(rawPrior) : undefined;
    const trend =
      absPrior != null && absPrior !== 0
        ? ((absTotal - absPrior) / absPrior) * 100
        : 0;
    return { key, label, value: total, color, trend, priorValue: priorTotal };
  });

  return { chartData, summaryCards };
}

// ── Custom tooltip ────────────────────────────────────────────────────────────

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    dataKey: string;
  }>;
  label?: string;
  metrics: { key: string; label: string; color: string }[];
  divisor?: number;
}

function CustomTooltip({
  active,
  payload,
  label,
  metrics,
  divisor = 1,
}: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <ChartTooltipShell>
      <ChartTooltipTitle>{label}</ChartTooltipTitle>
      <div className="space-y-1">
        {payload.map((entry) => {
          const metric = metrics.find((m) => m.key === entry.dataKey);
          return (
            <ChartTooltipRow
              key={entry.dataKey}
              color={entry.color}
              label={metric?.label ?? entry.name}
              value={formatTooltipCurrency(entry.value, divisor)}
              isNegative={entry.value < 0}
            />
          );
        })}
      </div>
    </ChartTooltipShell>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export interface FinancialSummaryChartProps {
  /** Raw financial data (same as table) */
  data: FinancialStatementEntry[];
  /** Time unit for period grouping */
  timeUnit: TimeUnit;
  /** Chart configuration */
  config: FinancialSummaryChartConfig;
  /** Prior period totals for trend comparison — keyed by metric key (e.g. { revenue: 100000, expenses: 80000, netIncome: 20000 }) */
  priorTotals?: Record<string, number>;
  /** Short label for the time period (e.g. "LTM", "YTD", "FY25") — shown on stat cards */
  periodLabel?: string;
  /** Additional class name */
  className?: string;
}

// ── Sparkline card ─────────────────────────────────────────────────────────────

function SparklineTooltip({
  active,
  payload,
  color,
  divisor = 1,
}: {
  active?: boolean;
  payload?: Array<{ value: number; payload: Record<string, unknown> }>;
  color: string;
  divisor?: number;
}) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  const label = entry.payload.periodLabel as string;
  return (
    <ChartTooltipShell className="px-2 py-1">
      <div className="flex items-center gap-2 text-xs">
        <div
          className="size-1.5 rounded-full shrink-0"
          style={{ backgroundColor: color }}
        />
        <span className="text-muted-foreground">{label}</span>
        <span
          className={cn(
            "font-mono font-medium ml-auto",
            entry.value < 0 && "text-destructive",
          )}
        >
          {formatTooltipCurrency(entry.value, divisor)}
        </span>
      </div>
    </ChartTooltipShell>
  );
}

function CardSparkline({
  data,
  dataKey,
  color,
  divisor = 1,
}: {
  data: Record<string, unknown>[];
  dataKey: string;
  color: string;
  divisor?: number;
}) {
  return (
    <div className="h-10 w-full mt-1">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 4, right: 6, bottom: 2, left: 6 }}
        >
          <defs>
            <linearGradient id={`spark-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Tooltip
            content={<SparklineTooltip color={color} divisor={divisor} />}
            cursor={false}
          />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#spark-${dataKey})`}
            dot={false}
            activeDot={{
              r: 3,
              strokeWidth: 1.5,
              fill: "var(--background, #fff)",
              stroke: color,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function FinancialSummaryChart({
  data,
  timeUnit,
  config,
  priorTotals: priorTotalsProp,
  periodLabel: periodLabelProp,
  className,
}: FinancialSummaryChartProps) {
  const [expanded, setExpanded] = React.useState(
    config.defaultExpanded ?? true,
  );
  const [activeMetric, setActiveMetric] = React.useState<string | null>(null);
  const [flippedCards, setFlippedCards] = React.useState<Set<string>>(
    new Set(),
  );

  const { displayUnits } = _useFinanceDisplay();
  const divisor = _getUnitDivisor(displayUnits);

  const { chartData, summaryCards } = React.useMemo(
    () => buildChartData(data, config, timeUnit, priorTotalsProp),
    [data, config, timeUnit, priorTotalsProp],
  );

  const allMetrics = React.useMemo(
    () => [
      ...config.metrics.map((m) => ({
        key: m.key,
        label: m.label,
        color: m.color,
        chartType: config.chartType ?? "area",
        dashed: false,
      })),
      ...(config.computedMetrics ?? []).map((m) => ({
        key: m.key,
        label: m.label,
        color: m.color,
        chartType: m.chartType ?? config.chartType ?? "area",
        dashed: m.dashed ?? false,
      })),
    ],
    [config],
  );

  const handleCardClick = React.useCallback((key: string) => {
    setActiveMetric((prev) => (prev === key ? null : key));
  }, []);

  const handleFlip = React.useCallback((e: React.MouseEvent, key: string) => {
    e.stopPropagation();
    setFlippedCards((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  // Compute opacity for each metric based on activeMetric
  const getMetricOpacity = React.useCallback(
    (key: string) => {
      if (!activeMetric) return 1;
      return key === activeMetric ? 1 : 0.15;
    },
    [activeMetric],
  );

  return (
    <div className={cn("rounded-lg border bg-card", className)}>
      {/* Header — always visible */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-muted/30"
      >
        <div className="flex items-center gap-2">
          <BarChart3 className="size-4 text-muted-foreground" />
          <span className="text-sm font-medium">
            {config.title ?? "Summary"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {/* Mini summary pills when collapsed */}
          {!expanded &&
            summaryCards.map((card) => (
              <div key={card.key} className="flex items-center gap-1.5 text-xs">
                <div
                  className="size-1.5 rounded-full"
                  style={{ backgroundColor: card.color }}
                />
                <span className="text-muted-foreground">{card.label}:</span>
                <span
                  className={cn(
                    "font-mono font-medium",
                    card.value < 0 && "text-destructive",
                  )}
                >
                  {formatCurrency(card.value, divisor)}
                </span>
              </div>
            ))}
          {expanded ? (
            <ChevronUp className="size-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="size-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Expandable content */}
      <div
        className={cn(
          "grid transition-all duration-300 ease-in-out",
          expanded
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-4">
            {/* Summary cards */}
            <div
              className="mb-4 grid gap-3"
              style={{
                gridTemplateColumns: `repeat(${summaryCards.length}, minmax(0, 1fr))`,
              }}
            >
              {summaryCards.map((card) => {
                const isPositiveTrend =
                  card.key === "expenses"
                    ? (card.trend ?? 0) < 0
                    : (card.trend ?? 0) > 0;
                const isActive = activeMetric === card.key;
                const isFlipped = flippedCards.has(card.key);
                return (
                  <RadixTooltip
                    key={card.key}
                    delayDuration={200}
                    open={isFlipped ? false : undefined}
                  >
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => handleCardClick(card.key)}
                        className={cn(
                          "relative rounded-lg border bg-gradient-to-br from-background to-muted/20 p-3 text-left transition-all cursor-pointer",
                          isActive && "border-transparent",
                          !isActive && activeMetric && "opacity-50",
                        )}
                        style={
                          isActive
                            ? {
                                borderColor: card.color,
                                boxShadow: `0 0 0 2px ${card.color}40`,
                              }
                            : undefined
                        }
                      >
                        {/* Accent bar */}
                        <div
                          className="absolute inset-y-0 left-0 w-1 rounded-l-lg"
                          style={{ backgroundColor: card.color }}
                        />
                        <div className="pl-3">
                          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                            {card.label}
                            {periodLabelProp && (
                              <span className="ml-1.5 font-normal text-muted-foreground/60">
                                {periodLabelProp}
                              </span>
                            )}
                          </p>
                          {!isFlipped ? (
                            <>
                              <p
                                className={cn(
                                  "mt-0.5 text-lg font-semibold tabular-nums tracking-tight",
                                  card.value < 0 && "text-destructive",
                                )}
                              >
                                {formatTooltipCurrency(card.value, divisor)}
                              </p>
                              {card.trend !== undefined && card.trend !== 0 && (
                                <p
                                  className={cn(
                                    "mt-0.5 text-[11px] font-medium",
                                    isPositiveTrend
                                      ? "text-emerald-600 dark:text-emerald-400"
                                      : "text-red-500 dark:text-red-400",
                                  )}
                                >
                                  {card.trend > 0 ? "↑" : "↓"}{" "}
                                  {Math.abs(card.trend).toFixed(1)}% vs prior
                                </p>
                              )}
                            </>
                          ) : (
                            <CardSparkline
                              data={chartData}
                              dataKey={card.key}
                              color={card.color}
                              divisor={divisor}
                            />
                          )}
                          {/* Dot indicators */}
                          <div className="flex justify-center gap-1.5 mt-1.5">
                            {/* biome-ignore lint/a11y/useSemanticElements: dot indicator */}
                            <span
                              role="button"
                              tabIndex={0}
                              onClick={(e) => {
                                if (isFlipped) handleFlip(e, card.key);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && isFlipped)
                                  handleFlip(
                                    e as unknown as React.MouseEvent,
                                    card.key,
                                  );
                              }}
                              className={cn(
                                "size-1.5 rounded-full transition-colors",
                                !isFlipped
                                  ? "bg-foreground/60"
                                  : "bg-foreground/20 hover:bg-foreground/40",
                              )}
                            />
                            {/* biome-ignore lint/a11y/useSemanticElements: dot indicator */}
                            <span
                              role="button"
                              tabIndex={0}
                              onClick={(e) => {
                                if (!isFlipped) handleFlip(e, card.key);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && !isFlipped)
                                  handleFlip(
                                    e as unknown as React.MouseEvent,
                                    card.key,
                                  );
                              }}
                              className={cn(
                                "size-1.5 rounded-full transition-colors",
                                isFlipped
                                  ? "bg-foreground/60"
                                  : "bg-foreground/20 hover:bg-foreground/40",
                              )}
                            />
                          </div>
                        </div>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent
                      side="bottom"
                      align="center"
                      sideOffset={8}
                      className="max-w-none rounded-lg border bg-popover px-3 py-2 text-popover-foreground shadow-md"
                    >
                      <ChartTooltipTitle>
                        {card.label} — vs Prior Period
                      </ChartTooltipTitle>
                      <div className="space-y-1">
                        <ChartTooltipRow
                          color={card.color}
                          label="Current"
                          value={formatTooltipCurrency(card.value, divisor)}
                          isNegative={card.value < 0}
                        />
                        {card.priorValue != null && (
                          <ChartTooltipRow
                            color="var(--muted-foreground, #9ca3af)"
                            label="Prior"
                            value={formatTooltipCurrency(
                              card.priorValue,
                              divisor,
                            )}
                            isNegative={card.priorValue < 0}
                          />
                        )}
                        {card.trend !== undefined && card.trend !== 0 && (
                          <div className="border-t border-border/40 pt-1 mt-1 text-xs flex justify-between gap-4">
                            <span className="text-muted-foreground">
                              Change
                            </span>
                            <span
                              className={cn(
                                "font-mono font-medium",
                                (
                                  card.key === "expenses"
                                    ? card.trend < 0
                                    : card.trend > 0
                                )
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : "text-red-500 dark:text-red-400",
                              )}
                            >
                              {card.trend > 0 ? "↑" : "↓"}{" "}
                              {Math.abs(card.trend).toFixed(1)}%
                            </span>
                          </div>
                        )}
                      </div>
                    </TooltipContent>
                  </RadixTooltip>
                );
              })}
            </div>

            {/* Chart */}
            <div style={{ height: config.height ?? 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 4, right: 4, bottom: 0, left: -10 }}
                >
                  <defs>
                    {allMetrics.map((m) => (
                      <linearGradient
                        key={m.key}
                        id={`gradient-${m.key}`}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor={m.color}
                          stopOpacity={
                            activeMetric
                              ? m.key === activeMetric
                                ? 0.3
                                : 0.02
                              : 0.2
                          }
                        />
                        <stop
                          offset="95%"
                          stopColor={m.color}
                          stopOpacity={0}
                        />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="var(--border, #e5e7eb)"
                    strokeOpacity={0.5}
                  />
                  <XAxis
                    dataKey="periodLabel"
                    tick={{
                      fontSize: 11,
                      fill: "var(--muted-foreground, #9ca3af)",
                    }}
                    tickLine={false}
                    axisLine={false}
                    dy={8}
                  />
                  <YAxis
                    tick={{
                      fontSize: 11,
                      fill: "var(--muted-foreground, #9ca3af)",
                    }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => formatCurrency(v as number, divisor)}
                    width={65}
                  />
                  {config.showZeroLine && (
                    <ReferenceLine
                      y={0}
                      stroke="var(--border, #e5e7eb)"
                      strokeDasharray="3 3"
                    />
                  )}
                  <Tooltip
                    content={
                      <CustomTooltip metrics={allMetrics} divisor={divisor} />
                    }
                    cursor={{
                      stroke: "var(--border, #e5e7eb)",
                      strokeDasharray: "3 3",
                    }}
                  />
                  {allMetrics.map((m) => {
                    const opacity = getMetricOpacity(m.key);
                    return m.chartType === "line" || m.dashed ? (
                      <Line
                        key={m.key}
                        type="monotone"
                        dataKey={m.key}
                        stroke={m.color}
                        strokeWidth={m.key === activeMetric ? 3 : 2}
                        strokeDasharray={m.dashed ? "6 3" : undefined}
                        strokeOpacity={opacity}
                        dot={false}
                        activeDot={{
                          r: 4,
                          strokeWidth: 2,
                          fill: "var(--background, #fff)",
                        }}
                      />
                    ) : m.chartType === "bar" ? (
                      <Bar
                        key={m.key}
                        dataKey={m.key}
                        fill={m.color}
                        radius={[4, 4, 0, 0]}
                        fillOpacity={opacity * 0.8}
                      />
                    ) : (
                      <Area
                        key={m.key}
                        type="monotone"
                        dataKey={m.key}
                        stroke={m.color}
                        strokeWidth={m.key === activeMetric ? 3 : 2}
                        strokeOpacity={opacity}
                        fill={`url(#gradient-${m.key})`}
                        fillOpacity={opacity}
                        dot={false}
                        activeDot={{
                          r: 4,
                          strokeWidth: 2,
                          fill: "var(--background, #fff)",
                        }}
                      />
                    );
                  })}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
