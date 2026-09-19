/**
 * Finance blocks — financial statement tables, period/comparison controls and
 * summary charts. These are domain components (Compass finance); the generic
 * table lives in `blocks/table`. `legacy/` holds the private table engine the
 * statement table still renders with and is deliberately not exported.
 */
export {
  ChartTooltipRow,
  ChartTooltipShell,
  ChartTooltipTitle,
} from "./ChartTooltip";
export {
  type ComparisonMode,
  ComparisonSelector,
  type ComparisonSelectorProps,
} from "./ComparisonSelector";
export {
  type CurrencySignDisplay,
  DataTableCurrencyCell,
  type DataTableCurrencyCellProps,
  type DisplayUnits,
  FinanceDecimalsProvider,
  FinanceDisplayProvider,
  formatCurrencyValue,
  getUnitDivisor,
  getUnitLabel,
  getUnitSuffix,
  useFinanceDecimals,
  useFinanceDecimalsSetting,
  useFinanceDisplay,
} from "./DataTableCurrencyCell";
export {
  type DataTableSettingDef,
  DataTableSettings,
  type DataTableSettingsProps,
  useDataTableSettings,
} from "./DataTableSettings";
export {
  FinancialStatementControls,
  type FinancialStatementControlsProps,
} from "./FinancialStatementControls";
export {
  BALANCE_SHEET_CONFIG,
  buildFinancialStatementData,
  calculateDesktopFinancialColumnSizing,
  type FinancialStatementConfig,
  type FinancialStatementEntry,
  type FinancialStatementSection,
  FinancialStatementTable,
  type FinancialStatementTableProps,
  type FinancialStatementTotal,
  type FlatExportRow,
  flattenStatementForExport,
  INCOME_STATEMENT_CONFIG,
  type PeriodColumnOrder,
  resolvePeriodColumns,
  type StatementRow,
  type SubtotalRule,
  type SubtotalRulesConfig,
  type TimeUnit,
} from "./FinancialStatementTable";
export {
  CASH_FLOW_CHART_CONFIG,
  type ChartVariant,
  type ComputedMetric,
  type FinancialMetric,
  FinancialSummaryChart,
  type FinancialSummaryChartConfig,
  type FinancialSummaryChartProps,
  type FinancialSummaryChartSeries,
  INCOME_STATEMENT_CHART_CONFIG,
} from "./FinancialSummaryChart";
export {
  createFinancialStatementRowImportanceResolver,
  type FinancialStatementKind,
  type FinancialStatementRowImportance,
  type FinancialStatementRowImportanceResolver,
  getFinancialStatementRowImportanceClassName,
} from "./financialStatementRowImportance";
export {
  MobilePeriodStepper,
  type MobilePeriodStepperProps,
} from "./MobilePeriodStepper";
export {
  type MobileStatementActionExport,
  type MobileStatementActionSetting,
  MobileStatementActions,
  type MobileStatementActionsProps,
} from "./MobileStatementActions";
export {
  MobileStatementFilters,
  type MobileStatementFiltersProps,
} from "./MobileStatementFilters";
export {
  type PeriodGranularity,
  PeriodSelector,
  type PeriodSelectorChangeParams,
  type PeriodSelectorProps,
} from "./PeriodSelector";
export {
  SummaryAreaChart,
  SummaryBarChart,
  type SummaryChartDataPoint,
  type SummaryChartSeries,
  type SummaryChartType,
  type SummaryMetric,
  SummaryPanel,
  type SummaryPanelProps,
  SummaryPieChart,
} from "./SummaryPanel";
export {
  UnifiedTableControls,
  type UnifiedTableControlsProps,
} from "./UnifiedTableControls";
export {
  createFinanceTableSettingsItems,
  normalizeUnifiedTableControls,
  type UnifiedTableControl,
  type UnifiedTableControlKind,
  type UnifiedTableSettingsControl,
  type UnifiedTableSettingsItem,
  unifiedTableControlOrder,
  useUnifiedTableSettings,
} from "./UnifiedTableControls.schema";
