"use client";

import { BarChart3, ChevronDown, ChevronUp, PieChartIcon } from "lucide-react";
import * as React from "react";
import {
  Area,
  AreaChart,
  Bar,
  ComposedChart,
  CartesianGrid,
  Cell,
  Line,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Sector,
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
import { type DisplayUnits, getUnitDivisor } from "./DataTableCurrencyCell";
import type {
  FinancialStatementEntry,
  TimeUnit,
} from "./FinancialStatementTable";

// ── Types ─────────────────────────────────────────────────────────────────────

export type MetricValueDisplayFormat =
  | "currency"
  | "number"
  | "percent"
  | "multiple"
  | "bps";

export interface MetricValueDisplayOptions {
  /** Base format type */
  format?: MetricValueDisplayFormat;
  /** Decimal places override */
  decimalPlaces?: number;
  /** Optional post-format pipe (e.g. add unit labels like " days") */
  valuePipe?: (formatted: string, value: number) => string;
  /** Optional rich post-format pipe for card display (e.g. muted unit suffix) */
  valuePipeNode?: (formatted: string, value: number) => React.ReactNode;
}

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
  /** Display settings for stat card values */
  valueDisplay?: MetricValueDisplayOptions;
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
  /** Display settings for stat card values */
  valueDisplay?: MetricValueDisplayOptions;
}

export type ChartVariant = "area" | "bar" | "line" | "pie";

export interface FinancialSummaryChartSeries {
  key: string;
  label: string;
  color: string;
  chartType?: "line" | "bar" | "area";
  dashed?: boolean;
  valueDisplay?: MetricValueDisplayOptions;
}

export interface FinancialSummaryChartConfig {
  /** Chart display units independent of statement/table unit setting (default: "auto") */
  chartDisplayUnits?: DisplayUnits | "auto";
  /** Optional metric keys to include in pie slices (default: all summary cards) */
  pieSliceKeys?: string[];
  /** Optional metric keys to render as stat cards (default: all summary cards) */
  statCardKeys?: string[];
  /** Enable summary-card flip-to-sparkline interaction (default: true) */
  enableCardFlip?: boolean;
  /** Metrics derived directly from account data */
  metrics: FinancialMetric[];
  /** Computed metrics (e.g. net income = revenue - expenses) */
  computedMetrics?: ComputedMetric[];
  /** Chart type (default: "area") */
  chartType?: ChartVariant;
  /** Optional chart type choices shown in UI */
  chartTypes?: ChartVariant[];
  /** Height in pixels (default: 260) */
  height?: number;
  /** Whether to show the zero reference line */
  showZeroLine?: boolean;
  /** Whether chart starts expanded (default: desktop=true, mobile=false) */
  defaultExpanded?: boolean;
  /** Title for the chart section */
  title?: string;
  /** Extra controls rendered alongside chart controls */
  chartControls?: React.ReactNode;
  /** Render override for chart area; receives active chart type, chart data, derived series, and height */
  renderChart?: (
    chartType: ChartVariant,
    data: Record<string, unknown>[],
    series: FinancialSummaryChartSeries[],
    height: number,
  ) => React.ReactNode;
  /** How stat card values are computed: sum all periods (default) or latest period only */
  statValueMode?: "sum" | "latest";
  /** How period chip is shown on cards */
  statPeriodMode?: "label" | "asOfLatest";
  /** Optional prior-period label (e.g. 01/25) shown in summary card hover title */
  priorPeriodLabel?: string;
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

function _formatCurrency(value: number, divisor = 1): string {
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

function formatMetricDisplayValue(
  value: number,
  options: MetricValueDisplayOptions | undefined,
  divisor = 1,
): string {
  if (Number.isNaN(value) || value === 0) return "—";
  if (value === Number.POSITIVE_INFINITY) return "∞";
  if (value === Number.NEGATIVE_INFINITY) return "(∞)";

  const format = options?.format ?? "currency";
  const decimalPlaces =
    options?.decimalPlaces ??
    (format === "currency" ? 0 : format === "bps" ? 0 : 1);

  const scaled = format === "currency" ? value / divisor : value;
  const abs = Math.abs(scaled);

  const baseNumber = abs.toLocaleString("en-US", {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  });

  const wrapped =
    format === "currency"
      ? `$${baseNumber}`
      : format === "percent"
        ? `${baseNumber}%`
        : format === "multiple"
          ? `${baseNumber}x`
          : format === "bps"
            ? `${baseNumber} bps`
            : baseNumber;

  const withNegatives = scaled < 0 ? `(${wrapped})` : wrapped;
  return options?.valuePipe
    ? options.valuePipe(withNegatives, value)
    : withNegatives;
}

function renderMetricDisplayValue(
  value: number,
  options: MetricValueDisplayOptions | undefined,
  divisor = 1,
): React.ReactNode {
  const formatted = formatMetricDisplayValue(value, options, divisor);
  return options?.valuePipeNode
    ? options.valuePipeNode(formatted, value)
    : formatted;
}

const CHART_TYPE_ICONS: Record<ChartVariant, React.ReactNode> = {
  area: <BarChart3 className="size-3.5" />,
  line: <BarChart3 className="size-3.5" />,
  bar: <BarChart3 className="size-3.5 rotate-90" />,
  pie: <PieChartIcon className="size-3.5" />,
};

const CHART_TYPE_LABELS: Record<ChartVariant, string> = {
  area: "Area",
  line: "Line",
  bar: "Column",
  pie: "Pie",
};

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
      valueDisplay: m.valueDisplay,
    })),
    ...(config.computedMetrics ?? []).map((m) => ({
      key: m.key,
      label: m.label,
      color: m.color,
      valueDisplay: m.valueDisplay,
    })),
  ];

  // Build sign map from metrics config so prior totals get the same treatment
  const signMap = new Map<string, number>();
  for (const m of config.metrics) {
    signMap.set(m.key, m.sign ?? 1);
  }

  const latestPeriod = periods.at(-1);

  const summaryCards = allMetrics.map(({ key, label, color, valueDisplay }) => {
    const total =
      config.statValueMode === "latest"
        ? latestPeriod
          ? (periodMetrics.get(latestPeriod)?.[key] ?? 0)
          : 0
        : periods.reduce(
            (sum, pk) => sum + (periodMetrics.get(pk)?.[key] ?? 0),
            0,
          );
    // Apply same sign to prior total for display, but compute trend on
    // absolute values so direction is always intuitive (positive = magnitude grew)
    const rawPrior = priorTotals?.[key];
    const sign = signMap.get(key) ?? 1;
    const priorTotal = rawPrior != null ? rawPrior * sign : undefined;
    const absTotal = Math.abs(total);
    const absPrior = rawPrior != null ? Math.abs(rawPrior) : undefined;
    const hasFiniteTotal = Number.isFinite(absTotal);
    const hasFinitePrior =
      absPrior != null && Number.isFinite(absPrior) && absPrior !== Infinity;
    const hasPrior = hasFinitePrior;
    const noChange = hasFiniteTotal && hasFinitePrior && absTotal === absPrior;
    const trend =
      hasFiniteTotal && hasFinitePrior && absPrior !== 0
        ? ((absTotal - absPrior) / absPrior) * 100
        : undefined;

    return {
      key,
      label,
      value: total,
      color,
      valueDisplay: valueDisplay ?? { format: "currency" },
      trend,
      priorValue: priorTotal,
      hasPrior,
      noChange,
    };
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
  metrics: {
    key: string;
    label: string;
    color: string;
    valueDisplay?: MetricValueDisplayOptions;
  }[];
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
              value={formatMetricDisplayValue(
                entry.value,
                metric?.valueDisplay ?? { format: "currency" },
                divisor,
              )}
              isNegative={entry.value < 0}
            />
          );
        })}
      </div>
    </ChartTooltipShell>
  );
}

function PieTooltip({
  active,
  payload,
  divisor = 1,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { fill: string } }>;
  divisor?: number;
}) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];

  return (
    <ChartTooltipShell>
      <div className="flex items-center gap-2 text-xs">
        <div
          className="size-2 rounded-full"
          style={{ backgroundColor: entry.payload.fill }}
        />
        <span>{entry.name}</span>
        <span className="ml-2 font-mono font-medium">
          {formatTooltipCurrency(entry.value, divisor)}
        </span>
      </div>
    </ChartTooltipShell>
  );
}

function PieChartView({
  cards,
  height,
  divisor = 1,
  activeMetric,
  computedMetrics,
}: {
  cards: Array<{ key: string; label: string; value: number; color: string }>;
  height: number;
  divisor?: number;
  activeMetric?: string | null;
  computedMetrics?: ComputedMetric[];
}) {
  const pieData = cards
    .filter((card) => card.value !== 0)
    .map((card) => ({
      key: card.key,
      name: card.label,
      value: Math.abs(card.value),
      fill: card.color,
    }));
  const pieTotal = pieData.reduce((sum, item) => sum + item.value, 0);

  // Resolve active metric to a set of pie slice keys
  // If it's a computed metric, expand to its formula constituents
  const activeSliceKeys = React.useMemo(() => {
    if (!activeMetric) return new Set<string>();
    // Check if it's a computed metric
    const computed = computedMetrics?.find((m) => m.key === activeMetric);
    if (computed) {
      return new Set(computed.formula.map((f) => f.replace(/^-/, "")));
    }
    return new Set([activeMetric]);
  }, [activeMetric, computedMetrics]);

  // Custom shape renderer for every slice — active slices get offset from center
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderSlice = React.useCallback(
    (props: any) => {
      const {
        cx,
        cy,
        innerRadius,
        outerRadius,
        startAngle,
        endAngle,
        fill,
        payload,
      } = props;
      const isActive = activeSliceKeys.has(payload?.key);
      const dimmed = activeSliceKeys.size > 0 && !isActive;

      if (isActive) {
        // Offset along the slice's radial midpoint
        const midAngle = (startAngle + endAngle) / 2;
        const midRad = (midAngle * Math.PI) / 180;
        const pop = 6;
        return (
          <Sector
            cx={cx + Math.cos(midRad) * pop}
            cy={cy - Math.sin(midRad) * pop}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            startAngle={startAngle}
            endAngle={endAngle}
            fill={fill}
          />
        );
      }

      return (
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          fillOpacity={dimmed ? 0.35 : 1}
        />
      );
    },
    [activeSliceKeys],
  );

  return (
    <div className="flex h-full w-full" style={{ height }}>
      <div className="relative min-w-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
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
              shape={renderSlice as never}
            >
              {pieData.map((entry) => (
                <Cell key={entry.name} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip content={<PieTooltip divisor={divisor} />} />
          </PieChart>
        </ResponsiveContainer>

        <div
          className="pointer-events-none absolute"
          style={{
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
          }}
        >
          <div className="text-[11px] text-muted-foreground">Total</div>
          <div className="text-sm font-semibold text-foreground">
            {_formatCurrency(pieTotal, divisor)}
          </div>
        </div>
      </div>

      <div className="flex w-28 shrink-0 flex-col justify-center gap-2 pl-2">
        {pieData.map((entry) => (
          <div key={entry.name} className="flex items-center gap-1.5 text-xs">
            <span
              className="inline-block size-2 rounded-full"
              style={{ backgroundColor: entry.fill }}
            />
            <span className="text-muted-foreground">{entry.name}</span>
          </div>
        ))}
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
  valueDisplay,
  divisor = 1,
}: {
  active?: boolean;
  payload?: Array<{ value: number; payload: Record<string, unknown> }>;
  color: string;
  valueDisplay: MetricValueDisplayOptions;
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
          {formatMetricDisplayValue(entry.value, valueDisplay, divisor)}
        </span>
      </div>
    </ChartTooltipShell>
  );
}

function CardSparkline({
  data,
  dataKey,
  color,
  valueDisplay,
  divisor = 1,
}: {
  data: Record<string, unknown>[];
  dataKey: string;
  color: string;
  valueDisplay: MetricValueDisplayOptions;
  divisor?: number;
}) {
  return (
    <div className="h-10 w-full">
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
            content={
              <SparklineTooltip
                color={color}
                valueDisplay={valueDisplay}
                divisor={divisor}
              />
            }
            cursor={false}
          />
          <Area
            type="linear"
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

function isMobileViewport() {
  if (typeof window === "undefined") return true;
  const isTouchDevice = window.matchMedia(
    "(hover: none) and (pointer: coarse)",
  ).matches;
  const desktopWidth = window.matchMedia("(min-width: 1024px)").matches;
  return isTouchDevice && !desktopWidth;
}

function resolveDefaultExpanded(defaultExpanded?: boolean) {
  if (defaultExpanded !== undefined) return defaultExpanded;
  return !isMobileViewport();
}

export function FinancialSummaryChart({
  data,
  timeUnit,
  config,
  priorTotals: priorTotalsProp,
  periodLabel: periodLabelProp,
  className,
}: FinancialSummaryChartProps) {
  const [expanded, setExpanded] = React.useState(() =>
    resolveDefaultExpanded(config.defaultExpanded),
  );
  const [activeChartType, setActiveChartType] = React.useState<ChartVariant>(
    config.chartType ?? "area",
  );
  const [activeMetric, setActiveMetric] = React.useState<string | null>(null);
  const [flippedCards, setFlippedCards] = React.useState<Set<string>>(
    new Set(),
  );
  const [mobileCardIndex, setMobileCardIndex] = React.useState(0);
  const [useSwipeCards, setUseSwipeCards] = React.useState(false);
  const touchStartRef = React.useRef<{ x: number; y: number } | null>(null);
  const touchDeltaRef = React.useRef({ x: 0, y: 0 });

  const divisor =
    config.chartDisplayUnits && config.chartDisplayUnits !== "auto"
      ? getUnitDivisor(config.chartDisplayUnits)
      : 1;

  const { chartData, summaryCards } = React.useMemo(
    () => buildChartData(data, config, timeUnit, priorTotalsProp),
    [data, config, timeUnit, priorTotalsProp],
  );

  const visibleSummaryCards = React.useMemo(() => {
    if (!config.statCardKeys?.length) return summaryCards;
    const cardByKey = new Map(summaryCards.map((card) => [card.key, card]));
    return config.statCardKeys
      .map((key) => cardByKey.get(key))
      .filter((card): card is NonNullable<typeof card> => Boolean(card));
  }, [config.statCardKeys, summaryCards]);
  const cardFlipEnabled = config.enableCardFlip ?? true;

  React.useEffect(() => {
    setExpanded(resolveDefaultExpanded(config.defaultExpanded));
  }, [config.defaultExpanded]);

  React.useEffect(() => {
    setActiveChartType(config.chartType ?? "area");
  }, [config.chartType]);

  const allMetrics = React.useMemo<FinancialSummaryChartSeries[]>(() => {
    const baseChartType =
      config.chartType && config.chartType !== "pie"
        ? config.chartType
        : "area";

    return [
      ...config.metrics.map((m) => ({
        key: m.key,
        label: m.label,
        color: m.color,
        chartType: baseChartType,
        dashed: false,
        valueDisplay: m.valueDisplay,
      })),
      ...(config.computedMetrics ?? []).map((m) => ({
        key: m.key,
        label: m.label,
        color: m.color,
        chartType: m.chartType ?? baseChartType,
        dashed: m.dashed ?? false,
        valueDisplay: m.valueDisplay,
      })),
    ];
  }, [config]);

  const axisValueDisplay = React.useMemo<MetricValueDisplayOptions>(() => {
    if (allMetrics.length === 0) return { format: "currency" };

    const first = allMetrics[0]?.valueDisplay ?? { format: "currency" };
    const firstFormat = first.format ?? "currency";
    const firstDp = first.decimalPlaces ?? null;

    const sameBase = allMetrics.every((metric) => {
      const display = metric.valueDisplay ?? { format: "currency" };
      return (
        (display.format ?? "currency") === firstFormat &&
        (display.decimalPlaces ?? null) === firstDp
      );
    });

    return sameBase ? first : { format: "currency" };
  }, [allMetrics]);

  React.useEffect(() => {
    setMobileCardIndex((prev) =>
      Math.min(Math.max(prev, 0), Math.max(visibleSummaryCards.length - 1, 0)),
    );
  }, [visibleSummaryCards.length]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const coarsePointerQuery = window.matchMedia(
      "(hover: none) and (pointer: coarse)",
    );
    const desktopWidthQuery = window.matchMedia("(min-width: 1024px)");

    const syncSwipeMode = () => {
      setUseSwipeCards(
        coarsePointerQuery.matches && !desktopWidthQuery.matches,
      );
    };

    syncSwipeMode();
    coarsePointerQuery.addEventListener("change", syncSwipeMode);
    desktopWidthQuery.addEventListener("change", syncSwipeMode);

    return () => {
      coarsePointerQuery.removeEventListener("change", syncSwipeMode);
      desktopWidthQuery.removeEventListener("change", syncSwipeMode);
    };
  }, []);

  const handleCardClick = React.useCallback((key: string) => {
    setActiveMetric((prev) => (prev === key ? null : key));
  }, []);

  const handleFlip = React.useCallback(
    (e: React.MouseEvent<HTMLElement>, key: string) => {
      e.stopPropagation();
      setFlippedCards((prev) => {
        const next = new Set(prev);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        return next;
      });
    },
    [],
  );

  const goToMobileCard = React.useCallback(
    (nextIndex: number) => {
      setMobileCardIndex(
        Math.min(
          Math.max(nextIndex, 0),
          Math.max(visibleSummaryCards.length - 1, 0),
        ),
      );
    },
    [visibleSummaryCards.length],
  );

  const handleTouchStart = React.useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (visibleSummaryCards.length <= 1) return;
      const touch = e.touches[0];
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
      touchDeltaRef.current = { x: 0, y: 0 };
    },
    [visibleSummaryCards.length],
  );

  const handleTouchMove = React.useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (!touchStartRef.current || visibleSummaryCards.length <= 1) return;
      const touch = e.touches[0];
      touchDeltaRef.current = {
        x: touch.clientX - touchStartRef.current.x,
        y: touch.clientY - touchStartRef.current.y,
      };
    },
    [visibleSummaryCards.length],
  );

  const handleTouchEnd = React.useCallback(() => {
    if (!touchStartRef.current || visibleSummaryCards.length <= 1) return;

    const { x, y } = touchDeltaRef.current;
    const swipeThreshold = 40;
    const isHorizontalSwipe = Math.abs(x) > Math.abs(y);

    if (isHorizontalSwipe && Math.abs(x) >= swipeThreshold) {
      goToMobileCard(mobileCardIndex + (x < 0 ? 1 : -1));
    }

    touchStartRef.current = null;
    touchDeltaRef.current = { x: 0, y: 0 };
  }, [goToMobileCard, mobileCardIndex, visibleSummaryCards.length]);

  // Compute opacity for each metric based on activeMetric
  const getMetricOpacity = React.useCallback(
    (key: string) => {
      if (!activeMetric) return 1;
      if (key === activeMetric) return 1;
      // Check if activeMetric is a computed metric that includes this key
      const computed = config.computedMetrics?.find(
        (m) => m.key === activeMetric,
      );
      if (computed) {
        const constituents = computed.formula.map((f) => f.replace(/^-/, ""));
        if (constituents.includes(key)) return 1;
      }
      return 0.15;
    },
    [activeMetric, config.computedMetrics],
  );

  const hasChartToggle = !!config.chartTypes && config.chartTypes.length > 1;

  const renderSummaryCard = React.useCallback(
    (card: {
      key: string;
      label: string;
      value: number;
      color: string;
      valueDisplay?: MetricValueDisplayOptions;
      trend?: number;
      priorValue?: number;
      hasPrior?: boolean;
      noChange?: boolean;
    }) => {
      const cardValueDisplay = card.valueDisplay ?? axisValueDisplay;
      const isPositiveTrend =
        card.key === "expenses" ? (card.trend ?? 0) < 0 : (card.trend ?? 0) > 0;
      const showNoChange = card.hasPrior && card.noChange;
      const showTrend =
        card.trend !== undefined && card.trend !== 0 && !showNoChange;
      const showZeroHint = card.value === 0 && !showTrend && !showNoChange;
      const isActive = activeMetric === card.key;
      const isFlipped = cardFlipEnabled && flippedCards.has(card.key);
      const latestPeriodRaw = chartData.at(-1)?.period;
      const latestPeriodKey =
        typeof latestPeriodRaw === "string" ? latestPeriodRaw : undefined;
      const compactAsOf = latestPeriodKey
        ? (() => {
            const [year, month] = latestPeriodKey.split("-");
            const yy = year?.slice(-2);
            return month && yy ? `${month}/${yy}` : undefined;
          })()
        : undefined;
      const cardPeriodText =
        config.statPeriodMode === "asOfLatest" ? compactAsOf : periodLabelProp;

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
                "relative w-full rounded-lg border bg-gradient-to-br from-background to-muted/20 p-3 text-left transition-all cursor-pointer",
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
              <div
                className="absolute inset-y-0 left-0 w-1 rounded-l-lg"
                style={{ backgroundColor: card.color }}
              />
              <div className="relative min-h-[92px] pl-3 pb-3">
                <p className="min-h-[32px] text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  {card.label}
                  {cardPeriodText && (
                    <span className="ml-1.5 font-normal text-muted-foreground/60">
                      {cardPeriodText}
                    </span>
                  )}
                </p>
                <div className="mt-0.5 grid min-h-[44px] grid-rows-[auto_18px]">
                  {!cardFlipEnabled || !isFlipped ? (
                    <>
                      <p
                        className={cn(
                          "text-lg font-semibold tabular-nums tracking-tight",
                          card.value < 0 && "text-destructive",
                        )}
                      >
                        {renderMetricDisplayValue(
                          card.value,
                          cardValueDisplay,
                          divisor,
                        )}
                      </p>
                      <div>
                        {showNoChange && (
                          <p className="text-[11px] font-medium text-muted-foreground">
                            No change vs prior
                          </p>
                        )}
                        {showTrend && (
                          <p
                            className={cn(
                              "text-[11px] font-medium",
                              isPositiveTrend
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-red-500 dark:text-red-400",
                            )}
                          >
                            {card.trend && card.trend > 0 ? "↑" : "↓"}{" "}
                            {Math.abs(card.trend ?? 0).toFixed(1)}% vs prior
                          </p>
                        )}
                        {showZeroHint && (
                          <p className="text-[11px] font-medium text-muted-foreground">
                            No activity
                          </p>
                        )}
                      </div>
                    </>
                  ) : (
                    <CardSparkline
                      data={chartData}
                      dataKey={card.key}
                      color={card.color}
                      valueDisplay={cardValueDisplay}
                      divisor={divisor}
                    />
                  )}
                </div>
                {cardFlipEnabled && (
                  <div
                    className={cn(
                      "absolute bottom-0 right-1 hidden justify-end gap-1",
                      !useSwipeCards && "sm:flex",
                    )}
                  >
                    {/* biome-ignore lint/a11y/useSemanticElements: nested inside button trigger */}
                    <span
                      role="button"
                      tabIndex={0}
                      aria-label={`Show ${card.label} value`}
                      onClick={(e) => {
                        if (isFlipped) handleFlip(e, card.key);
                      }}
                      onKeyDown={(e) => {
                        if ((e.key === "Enter" || e.key === " ") && isFlipped)
                          handleFlip(
                            e as unknown as React.MouseEvent<HTMLElement>,
                            card.key,
                          );
                      }}
                      className={cn(
                        "block h-2 rounded-full transition-all duration-200",
                        !isFlipped ? "w-5 bg-primary" : "w-2 bg-foreground/35",
                      )}
                    >
                      <span aria-hidden="true" />
                    </span>
                    {/* biome-ignore lint/a11y/useSemanticElements: nested inside button trigger */}
                    <span
                      role="button"
                      tabIndex={0}
                      aria-label={`Show ${card.label} trend sparkline`}
                      onClick={(e) => {
                        if (!isFlipped) handleFlip(e, card.key);
                      }}
                      onKeyDown={(e) => {
                        if ((e.key === "Enter" || e.key === " ") && !isFlipped)
                          handleFlip(
                            e as unknown as React.MouseEvent<HTMLElement>,
                            card.key,
                          );
                      }}
                      className={cn(
                        "block h-2 rounded-full transition-all duration-200",
                        isFlipped ? "w-5 bg-primary" : "w-2 bg-foreground/35",
                      )}
                    >
                      <span aria-hidden="true" />
                    </span>
                  </div>
                )}
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
              {config.priorPeriodLabel ? ` (${config.priorPeriodLabel})` : ""}
            </ChartTooltipTitle>
            <div className="space-y-1">
              <ChartTooltipRow
                color={card.color}
                label="Current"
                value={formatMetricDisplayValue(
                  card.value,
                  cardValueDisplay,
                  divisor,
                )}
                isNegative={card.value < 0}
              />
              {card.priorValue != null && (
                <ChartTooltipRow
                  color="var(--muted-foreground, #9ca3af)"
                  label="Prior"
                  value={formatMetricDisplayValue(
                    card.priorValue,
                    cardValueDisplay,
                    divisor,
                  )}
                  isNegative={card.priorValue < 0}
                />
              )}
              {showNoChange && (
                <div className="border-t border-border/40 pt-1 mt-1 text-xs flex justify-between gap-4">
                  <span className="text-muted-foreground">Change</span>
                  <span className="font-mono font-medium text-muted-foreground">
                    No change
                  </span>
                </div>
              )}
              {showTrend && (
                <div className="border-t border-border/40 pt-1 mt-1 text-xs flex justify-between gap-4">
                  <span className="text-muted-foreground">Change</span>
                  <span
                    className={cn(
                      "font-mono font-medium",
                      (
                        card.key === "expenses"
                          ? (card.trend ?? 0) < 0
                          : (card.trend ?? 0) > 0
                      )
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-red-500 dark:text-red-400",
                    )}
                  >
                    {(card.trend ?? 0) > 0 ? "↑" : "↓"}{" "}
                    {Math.abs(card.trend ?? 0).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          </TooltipContent>
        </RadixTooltip>
      );
    },
    [
      activeMetric,
      chartData,
      divisor,
      flippedCards,
      handleCardClick,
      handleFlip,
      periodLabelProp,
      useSwipeCards,
      config.statPeriodMode,
      config.priorPeriodLabel,
      axisValueDisplay,
      cardFlipEnabled,
    ],
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
        <div className="flex min-w-0 items-center gap-2">
          {/* Mini summary pills when collapsed */}
          {!expanded &&
            visibleSummaryCards.map((card) => (
              <div
                key={card.key}
                className="hidden items-center gap-1.5 text-xs md:flex"
              >
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
                  {formatMetricDisplayValue(
                    card.value,
                    (card as { valueDisplay?: MetricValueDisplayOptions })
                      .valueDisplay ?? axisValueDisplay,
                    divisor,
                  )}
                </span>
              </div>
            ))}
          {expanded ? (
            <ChevronUp className="size-4 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
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
            {useSwipeCards ? (
              <div className="mb-4">
                <div
                  className="relative overflow-hidden touch-pan-y pb-3"
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  <div
                    className="flex transition-transform duration-300 ease-out"
                    style={{
                      transform: `translateX(-${mobileCardIndex * 100}%)`,
                    }}
                  >
                    {visibleSummaryCards.map((card) => (
                      <div key={card.key} className="w-full shrink-0">
                        {renderSummaryCard(card)}
                      </div>
                    ))}
                  </div>

                  {visibleSummaryCards.length > 1 && (
                    <div className="absolute bottom-0 right-1 flex items-center justify-end gap-1">
                      {visibleSummaryCards.map((card, index) => (
                        <button
                          key={card.key}
                          type="button"
                          aria-label={`Go to ${card.label} card`}
                          onClick={() => goToMobileCard(index)}
                          className={cn(
                            "block h-2 rounded-full transition-all duration-200",
                            index === mobileCardIndex
                              ? "w-5 bg-primary"
                              : "w-2 bg-foreground/35",
                          )}
                        >
                          <span aria-hidden="true" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div
                className={cn("mb-4 grid gap-3", {
                  "grid-cols-1": visibleSummaryCards.length === 1,
                  "grid-cols-2": visibleSummaryCards.length === 2,
                  "grid-cols-3": visibleSummaryCards.length === 3,
                  "grid-cols-2 lg:grid-cols-4": visibleSummaryCards.length >= 4,
                })}
              >
                {visibleSummaryCards.map((card) => renderSummaryCard(card))}
              </div>
            )}

            {(hasChartToggle || config.chartControls) && (
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {hasChartToggle &&
                    config.chartTypes!.map((chartType) => (
                      <button
                        key={chartType}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveChartType(chartType);
                        }}
                        className={cn(
                          "flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors",
                          activeChartType === chartType
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                        )}
                      >
                        {CHART_TYPE_ICONS[chartType]}
                        {CHART_TYPE_LABELS[chartType]}
                      </button>
                    ))}
                </div>
                {config.chartControls && (
                  <div className="flex items-center">
                    {config.chartControls}
                  </div>
                )}
              </div>
            )}

            {/* Chart */}
            <div
              style={{
                width: "100%",
                ...(config.renderChart ? {} : { height: config.height ?? 240 }),
              }}
            >
              {config.renderChart ? (
                config.renderChart(
                  activeChartType,
                  chartData,
                  allMetrics,
                  config.height ?? 240,
                )
              ) : activeChartType === "pie" ? (
                <PieChartView
                  cards={
                    config.pieSliceKeys?.length
                      ? summaryCards.filter((card) =>
                          config.pieSliceKeys?.includes(card.key),
                        )
                      : summaryCards
                  }
                  height={config.height ?? 240}
                  divisor={divisor}
                  activeMetric={activeMetric}
                  computedMetrics={config.computedMetrics}
                />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={chartData}
                    margin={{ top: 4, right: 8, bottom: 0, left: 12 }}
                    barCategoryGap="20%"
                    barGap={0}
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
                      padding={{ left: 0, right: 0 }}
                    />
                    <YAxis
                      tick={{
                        fontSize: 11,
                        fill: "var(--muted-foreground, #9ca3af)",
                      }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) =>
                        formatMetricDisplayValue(
                          v as number,
                          axisValueDisplay,
                          divisor,
                        )
                      }
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
                          type="linear"
                          dataKey={m.key}
                          stroke={m.color}
                          strokeWidth={m.key === activeMetric ? 3 : 2}
                          strokeDasharray={m.dashed ? "6 3" : undefined}
                          strokeOpacity={opacity}
                          isAnimationActive={false}
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
                          stackId={config.chartType === "bar" ? "summary" : undefined}
                          fill={m.color}
                          radius={[4, 4, 0, 0]}
                          fillOpacity={opacity * 0.8}
                          isAnimationActive={false}
                          maxBarSize={24}
                        />
                      ) : (
                        <Area
                          key={m.key}
                          type="linear"
                          dataKey={m.key}
                          stroke={m.color}
                          strokeWidth={m.key === activeMetric ? 3 : 2}
                          strokeOpacity={opacity}
                          fill={`url(#gradient-${m.key})`}
                          fillOpacity={opacity}
                          isAnimationActive={false}
                          dot={false}
                          activeDot={{
                            r: 4,
                            strokeWidth: 2,
                            fill: "var(--background, #fff)",
                          }}
                        />
                      );
                    })}
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
