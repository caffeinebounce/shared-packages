"use client";

import * as React from "react";
import { useFinanceDisplay as _useFinanceDisplay, getUnitDivisor as _getUnitDivisor } from "./DataTableCurrencyCell";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChevronDown, ChevronUp, BarChart3 } from "lucide-react";
import { cn } from "../../utils/cn";
import type { FinancialStatementEntry, TimeUnit } from "./FinancialStatementTable";

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
  defaultExpanded: true,
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
  if (abs >= 1_000_000) return `${neg ? "(" : ""}$${(abs / 1_000_000).toFixed(1)}M${neg ? ")" : ""}`;
  if (abs >= 1_000) return `${neg ? "(" : ""}$${(abs / 1_000).toFixed(0)}K${neg ? ")" : ""}`;
  return `${neg ? "(" : ""}$${abs.toFixed(0)}${neg ? ")" : ""}`;
}

function formatTooltipCurrency(value: number, divisor = 1): string {
  const v = divisor === 1 ? value : value / divisor;
  if (v < 0) return `($${Math.abs(v).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })})`;
  return `$${v.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

// ── Build chart data ──────────────────────────────────────────────────────────

function buildChartData(
  data: FinancialStatementEntry[],
  config: FinancialSummaryChartConfig,
  timeUnit: TimeUnit,
): { chartData: Record<string, unknown>[]; summaryCards: { key: string; label: string; value: number; color: string; trend?: number }[] } {
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
    ...config.metrics.map((m) => ({ key: m.key, label: m.label, color: m.color })),
    ...(config.computedMetrics ?? []).map((m) => ({ key: m.key, label: m.label, color: m.color })),
  ];

  const summaryCards = allMetrics.map(({ key, label, color }) => {
    // Sum across all periods in the range
    let total = 0;
    for (const pk of periods) {
      total += periodMetrics.get(pk)?.[key] ?? 0;
    }
    // Trend: compare last period vs the one before it
    const latest = periods.length > 0 ? (periodMetrics.get(periods[periods.length - 1])?.[key] ?? 0) : 0;
    const prior = periods.length > 1 ? (periodMetrics.get(periods[periods.length - 2])?.[key] ?? 0) : 0;
    const trend = prior !== 0 ? ((latest - prior) / Math.abs(prior)) * 100 : 0;
    return { key, label, value: total, color, trend };
  });

  return { chartData, summaryCards };
}

// ── Custom tooltip ────────────────────────────────────────────────────────────

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string; dataKey: string }>;
  label?: string;
  metrics: { key: string; label: string; color: string }[];
  divisor?: number;
}

function CustomTooltip({ active, payload, label, metrics, divisor = 1 }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-popover-foreground shadow-md">
      <p className="mb-1.5 text-xs font-medium text-muted-foreground">{label}</p>
      <div className="space-y-1">
        {payload.map((entry) => {
          const metric = metrics.find((m) => m.key === entry.dataKey);
          return (
            <div key={entry.dataKey} className="flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div
                  className="size-2 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span>{metric?.label ?? entry.name}</span>
              </div>
              <span className={cn("font-mono font-medium", entry.value < 0 && "text-destructive")}>
                {formatTooltipCurrency(entry.value, divisor)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
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
  /** Additional class name */
  className?: string;
}

export function FinancialSummaryChart({
  data,
  timeUnit,
  config,
  className,
}: FinancialSummaryChartProps) {
  const [expanded, setExpanded] = React.useState(config.defaultExpanded ?? true);

  const { displayUnits } = _useFinanceDisplay();
  const divisor = _getUnitDivisor(displayUnits);

  const { chartData, summaryCards } = React.useMemo(
    () => buildChartData(data, config, timeUnit),
    [data, config, timeUnit],
  );

  const allMetrics = React.useMemo(
    () => [
      ...config.metrics.map((m) => ({ key: m.key, label: m.label, color: m.color, chartType: config.chartType ?? "area", dashed: false })),
      ...(config.computedMetrics ?? []).map((m) => ({ key: m.key, label: m.label, color: m.color, chartType: m.chartType ?? config.chartType ?? "area", dashed: m.dashed ?? false })),
    ],
    [config],
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
          <span className="text-sm font-medium">{config.title ?? "Summary"}</span>
        </div>
        <div className="flex items-center gap-3">
          {/* Mini summary pills when collapsed */}
          {!expanded && summaryCards.map((card) => (
            <div key={card.key} className="flex items-center gap-1.5 text-xs">
              <div className="size-1.5 rounded-full" style={{ backgroundColor: card.color }} />
              <span className="text-muted-foreground">{card.label}:</span>
              <span className={cn("font-mono font-medium", card.value < 0 && "text-destructive")}>
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
          expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-4">
            {/* Summary cards */}
            <div className="mb-4 grid grid-cols-3 gap-3">
              {summaryCards.map((card) => {
                const isPositiveTrend = card.key === "expenses" ? (card.trend ?? 0) < 0 : (card.trend ?? 0) > 0;
                return (
                  <div
                    key={card.key}
                    className="relative overflow-hidden rounded-lg border bg-gradient-to-br from-background to-muted/20 p-3"
                  >
                    {/* Accent bar */}
                    <div
                      className="absolute inset-y-0 left-0 w-1 rounded-l-lg"
                      style={{ backgroundColor: card.color }}
                    />
                    <div className="pl-2">
                      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                        {card.label}
                      </p>
                      <p className={cn(
                        "mt-0.5 text-lg font-semibold tabular-nums tracking-tight",
                        card.value < 0 && "text-destructive",
                      )}>
                        {formatTooltipCurrency(card.value, divisor)}
                      </p>
                      {card.trend !== undefined && card.trend !== 0 && (
                        <p className={cn(
                          "mt-0.5 text-[11px] font-medium",
                          isPositiveTrend ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400",
                        )}>
                          {card.trend > 0 ? "↑" : "↓"} {Math.abs(card.trend).toFixed(1)}% vs prior
                        </p>
                      )}
                    </div>
                  </div>
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
                      <linearGradient key={m.key} id={`gradient-${m.key}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={m.color} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={m.color} stopOpacity={0} />
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
                    tick={{ fontSize: 11, fill: "var(--muted-foreground, #9ca3af)" }}
                    tickLine={false}
                    axisLine={false}
                    dy={8}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "var(--muted-foreground, #9ca3af)" }}
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
                    content={<CustomTooltip metrics={allMetrics} divisor={divisor} />}
                    cursor={{ stroke: "var(--border, #e5e7eb)", strokeDasharray: "3 3" }}
                  />
                  {allMetrics.map((m) =>
                    m.chartType === "line" || m.dashed ? (
                      <Line
                        key={m.key}
                        type="monotone"
                        dataKey={m.key}
                        stroke={m.color}
                        strokeWidth={2}
                        strokeDasharray={m.dashed ? "6 3" : undefined}
                        dot={false}
                        activeDot={{ r: 4, strokeWidth: 2, fill: "var(--background, #fff)" }}
                      />
                    ) : m.chartType === "bar" ? (
                      <Bar
                        key={m.key}
                        dataKey={m.key}
                        fill={m.color}
                        radius={[4, 4, 0, 0]}
                        fillOpacity={0.8}
                      />
                    ) : (
                      <Area
                        key={m.key}
                        type="monotone"
                        dataKey={m.key}
                        stroke={m.color}
                        strokeWidth={2}
                        fill={`url(#gradient-${m.key})`}
                        dot={false}
                        activeDot={{ r: 4, strokeWidth: 2, fill: "var(--background, #fff)" }}
                      />
                    ),
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
