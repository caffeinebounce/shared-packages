"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3, ChevronDown, ChevronUp, PieChartIcon } from "lucide-react";
import { cn } from "../../utils/cn";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SummaryMetric {
  /** Unique key */
  key: string;
  /** Display label */
  label: string;
  /** Current total value */
  value: number;
  /** Color (CSS var or hex) */
  color: string;
  /** Trend percentage vs prior period (optional) */
  trend?: number;
  /** Trend description (e.g., "vs prior") */
  trendLabel?: string;
  /** Whether lower is better (flips trend color) */
  invertTrend?: boolean;
  /** Subtitle text */
  subtitle?: string;
  /** Custom display string (overrides default currency formatting) */
  displayValue?: string;
}

export interface SummaryChartDataPoint {
  /** Period label (e.g., "Jan 25") */
  label: string;
  /** Values keyed by metric key */
  [key: string]: string | number;
}

export type SummaryChartType = "area" | "bar" | "line" | "pie";

export interface SummaryChartSeries {
  /** Metric key (matches data keys) */
  key: string;
  /** Display label */
  label: string;
  /** Color */
  color: string;
  /** Override chart type for this series */
  chartType?: "line" | "bar" | "area";
  /** Dashed line */
  dashed?: boolean;
}

export interface SummaryPanelProps {
  /** Title for the panel header */
  title?: string;
  /** Summary metric cards to display */
  metrics: SummaryMetric[];
  /** Chart data points (optional — omit for metrics-only panel) */
  chartData?: SummaryChartDataPoint[];
  /** Chart series configuration */
  chartSeries?: SummaryChartSeries[];
  /** Default chart type */
  chartType?: SummaryChartType;
  /** Available chart types the user can toggle between */
  chartTypes?: SummaryChartType[];
  /** Chart height in px */
  chartHeight?: number;
  /** Show zero reference line */
  showZeroLine?: boolean;
  /** Start expanded */
  defaultExpanded?: boolean;
  /** Format function for Y axis / tooltip values */
  formatValue?: (value: number) => string;
  /** Additional className */
  className?: string;
  /** Render prop for chart — receives (activeChartType, data, series, height). Use when built-in charts don't work in your bundler. */
  renderChart?: (chartType: SummaryChartType, data: SummaryChartDataPoint[], series: SummaryChartSeries[], height: number) => React.ReactNode;
  /** Extra controls to render on the same line as chart type toggles (e.g., data mode dropdown) */
  chartControls?: React.ReactNode;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function defaultFormat(value: number): string {
  if (value === 0) return "$0";
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${value < 0 ? "-" : ""}$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${value < 0 ? "-" : ""}$${(abs / 1_000).toFixed(0)}K`;
  return `${value < 0 ? "(" : ""}$${abs.toFixed(0)}${value < 0 ? ")" : ""}`;
}

function tooltipFormat(value: number): string {
  if (value < 0)
    return `($${Math.abs(value).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })})`;
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

const CHART_TYPE_ICONS: Record<SummaryChartType, React.ReactNode> = {
  area: <BarChart3 className="size-3.5" />,
  line: <BarChart3 className="size-3.5" />,
  bar: <BarChart3 className="size-3.5 rotate-90" />,
  pie: <PieChartIcon className="size-3.5" />,
};

const CHART_TYPE_LABELS: Record<SummaryChartType, string> = {
  area: "Area",
  line: "Line",
  bar: "Column",
  pie: "Pie",
};

// ── Custom Tooltip ────────────────────────────────────────────────────────────

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string; dataKey: string }>;
  label?: string;
  series: SummaryChartSeries[];
  formatFn: (v: number) => string;
}

function CustomTooltip({ active, payload, label, series, formatFn }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-popover-foreground shadow-md">
      <p className="mb-1.5 text-xs font-medium text-muted-foreground">{label}</p>
      <div className="space-y-1">
        {payload.map((entry) => {
          const s = series.find((m) => m.key === entry.dataKey);
          return (
            <div key={entry.dataKey} className="flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="size-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span>{s?.label ?? entry.name}</span>
              </div>
              <span className={cn("font-mono font-medium", entry.value < 0 && "text-destructive")}>
                {formatFn(entry.value)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Pie Tooltip ───────────────────────────────────────────────────────────────

function PieTooltip({ active, payload, formatFn }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { fill: string } }>; formatFn: (v: number) => string }) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-popover-foreground shadow-md">
      <div className="flex items-center gap-1.5 text-xs">
        <div className="size-2 rounded-full" style={{ backgroundColor: entry.payload.fill }} />
        <span>{entry.name}</span>
        <span className="font-mono font-medium ml-2">{formatFn(entry.value)}</span>
      </div>
    </div>
  );
}

// ── Chart Renderers ───────────────────────────────────────────────────────────

function AreaLineChart({ data, series, height, showZeroLine, formatFn }: {
  data: SummaryChartDataPoint[]; series: SummaryChartSeries[]; height: number;
  showZeroLine?: boolean; formatFn: (v: number) => string;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
        <defs>
          {series.map((s) => (
            <linearGradient key={s.key} id={`sp-gradient-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity={0.2} />
              <stop offset="95%" stopColor={s.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border, #e5e7eb)" strokeOpacity={0.5} />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--muted-foreground, #9ca3af)" }} tickLine={false} axisLine={false} dy={8} />
        <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground, #9ca3af)" }} tickLine={false} axisLine={false} tickFormatter={(v) => formatFn(v as number)} width={65} />
        {showZeroLine && <ReferenceLine y={0} stroke="var(--border, #e5e7eb)" strokeDasharray="3 3" />}
        <Tooltip content={<CustomTooltip series={series} formatFn={tooltipFormat} />} cursor={{ stroke: "var(--border, #e5e7eb)", strokeDasharray: "3 3" }} />
        {series.map((s) => {
          const type = s.chartType ?? "area";
          if (type === "line" || s.dashed) {
            return <Line key={s.key} type="monotone" dataKey={s.key} stroke={s.color} strokeWidth={2} strokeDasharray={s.dashed ? "6 3" : undefined} dot={false} activeDot={{ r: 4, strokeWidth: 2, fill: "var(--background, #fff)" }} />;
          }
          return <Area key={s.key} type="monotone" dataKey={s.key} stroke={s.color} strokeWidth={2} fill={`url(#sp-gradient-${s.key})`} dot={false} activeDot={{ r: 4, strokeWidth: 2, fill: "var(--background, #fff)" }} />;
        })}
      </AreaChart>
    </ResponsiveContainer>
  );
}

function ColumnChart({ data, series, height, showZeroLine, formatFn }: {
  data: SummaryChartDataPoint[]; series: SummaryChartSeries[]; height: number;
  showZeroLine?: boolean; formatFn: (v: number) => string;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border, #e5e7eb)" strokeOpacity={0.5} />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--muted-foreground, #9ca3af)" }} tickLine={false} axisLine={false} dy={8} />
        <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground, #9ca3af)" }} tickLine={false} axisLine={false} tickFormatter={(v) => formatFn(v as number)} width={65} />
        {showZeroLine && <ReferenceLine y={0} stroke="var(--border, #e5e7eb)" strokeDasharray="3 3" />}
        <Tooltip content={<CustomTooltip series={series} formatFn={tooltipFormat} />} cursor={{ fill: "var(--muted, #f3f4f6)", fillOpacity: 0.3 }} />
        {series.map((s) => (
          <Bar key={s.key} dataKey={s.key} fill={s.color} radius={[4, 4, 0, 0]} fillOpacity={0.8} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

function PieChartView({ metrics, height, formatFn }: {
  metrics: SummaryMetric[]; height: number; formatFn: (v: number) => string;
}) {
  const pieData = metrics.filter((m) => m.value !== 0).map((m) => ({
    name: m.label,
    value: Math.abs(m.value),
    fill: m.color,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={pieData}
          cx="50%"
          cy="50%"
          innerRadius="55%"
          outerRadius="80%"
          paddingAngle={2}
          dataKey="value"
          nameKey="name"
          stroke="none"
        >
          {pieData.map((entry) => (
            <Cell key={entry.name} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip content={<PieTooltip formatFn={tooltipFormat} />} />
        <Legend
          verticalAlign="middle"
          align="right"
          layout="vertical"
          iconType="circle"
          iconSize={8}
          formatter={(value: string) => <span className="text-xs text-muted-foreground">{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ── Exported chart renderers (for renderChart prop) ───────────────────────────

export { AreaLineChart as SummaryAreaChart, ColumnChart as SummaryBarChart, PieChartView as SummaryPieChart };

// ── Main Component ────────────────────────────────────────────────────────────

export function SummaryPanel({
  title = "Financial Overview",
  metrics,
  chartData,
  chartSeries,
  chartType: defaultChartType = "area",
  chartTypes,
  chartHeight = 240,
  showZeroLine = false,
  defaultExpanded = true,
  formatValue,
  className,
  renderChart,
  chartControls,
}: SummaryPanelProps) {
  const [expanded, setExpanded] = React.useState(defaultExpanded);
  const [activeChartType, setActiveChartType] = React.useState<SummaryChartType>(defaultChartType);

  const formatFn = formatValue ?? defaultFormat;
  const hasChart = (!!chartData && chartData.length > 0 && !!chartSeries) || !!renderChart;
  const hasChartToggle = chartTypes && chartTypes.length > 1;

  return (
    <div className={cn("rounded-lg border bg-card", className)}>
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-muted/30 outline-none focus-visible:outline-none"
      >
        <div className="flex items-center gap-2">
          <BarChart3 className="size-4 text-muted-foreground" />
          <span className="text-sm font-medium">{title}</span>
        </div>
        <div className="flex items-center gap-3">
          {/* Mini pills when collapsed */}
          {!expanded && metrics.map((m) => (
            <div key={m.key} className="flex items-center gap-1.5 text-xs">
              <div className="size-1.5 rounded-full" style={{ backgroundColor: m.color }} />
              <span className="text-muted-foreground">{m.label}:</span>
              <span className={cn("font-mono font-medium", m.value < 0 && "text-destructive")}>
                {m.displayValue ?? formatFn(m.value)}
              </span>
            </div>
          ))}
          {expanded
            ? <ChevronUp className="size-4 text-muted-foreground" />
            : <ChevronDown className="size-4 text-muted-foreground" />
          }
        </div>
      </button>

      {/* Expandable content */}
      {expanded && (
          <div className="px-4 pb-4">
            {/* Metric cards */}
            <div className={cn("mb-4 grid gap-3", {
              "grid-cols-1": metrics.length === 1,
              "grid-cols-2": metrics.length === 2,
              "grid-cols-3": metrics.length === 3,
              "grid-cols-4": metrics.length >= 4,
            })}>
              {metrics.map((m) => {
                const isPositiveTrend = m.invertTrend ? (m.trend ?? 0) < 0 : (m.trend ?? 0) > 0;
                return (
                  <div
                    key={m.key}
                    className="relative overflow-hidden rounded-lg border bg-gradient-to-br from-background to-muted/20 p-3"
                  >
                    <div className="absolute inset-y-0 left-0 w-1 rounded-l-lg" style={{ backgroundColor: m.color }} />
                    <div className="pl-2">
                      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{m.label}</p>
                      <p className={cn("mt-0.5 text-lg font-semibold tabular-nums tracking-tight", m.value < 0 && "text-destructive")}>
                        {m.displayValue ?? tooltipFormat(m.value)}
                      </p>
                      {m.trend !== undefined && m.trend !== 0 && (
                        <p className={cn("mt-0.5 text-[11px] font-medium",
                          isPositiveTrend ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400",
                        )}>
                          {m.trend > 0 ? "↑" : "↓"} {Math.abs(m.trend).toFixed(1)}% {m.trendLabel ?? "vs prior"}
                        </p>
                      )}
                      {m.subtitle && (
                        <p className="mt-0.5 text-[11px] text-muted-foreground">{m.subtitle}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Chart toolbar: type toggles + extra controls */}
            {hasChart && (hasChartToggle || chartControls) && (
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {hasChartToggle && chartTypes!.map((ct) => (
                    <button
                      key={ct}
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setActiveChartType(ct); }}
                      className={cn(
                        "flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors outline-none focus-visible:outline-none",
                        activeChartType === ct
                          ? "bg-muted text-foreground"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                      )}
                    >
                      {CHART_TYPE_ICONS[ct]}
                      {CHART_TYPE_LABELS[ct]}
                    </button>
                  ))}
                </div>
                {chartControls && <div className="flex items-center">{chartControls}</div>}
              </div>
            )}

            {/* Chart */}
            {hasChart && (
              <div style={{ width: "100%", ...(renderChart ? {} : { height: chartHeight }) }}>
                {renderChart ? (
                  renderChart(activeChartType, chartData ?? [], chartSeries ?? [], chartHeight)
                ) : activeChartType === "pie" ? (
                  <PieChartView metrics={metrics} height={chartHeight} formatFn={formatFn} />
                ) : activeChartType === "bar" ? (
                  <ColumnChart data={chartData!} series={chartSeries!} height={chartHeight} showZeroLine={showZeroLine} formatFn={formatFn} />
                ) : (
                  <AreaLineChart data={chartData!} series={chartSeries!} height={chartHeight} showZeroLine={showZeroLine} formatFn={formatFn} />
                )}
              </div>
            )}
          </div>
      )}
    </div>
  );
}
