import * as React from "react";

import { useDataTableSettings } from "./DataTableSettings";

export const unifiedTableControlOrder = [
  "period",
  "comparison",
  "filters",
  "search",
  "columns",
  "export",
  "settings",
] as const;

export type UnifiedTableControlKind = (typeof unifiedTableControlOrder)[number];

export interface UnifiedTableSettingsItem {
  id: string;
  label: string;
  defaultValue: boolean;
  description?: string;
}

export interface UnifiedTableSettingsControl {
  kind: "settings";
  id?: string;
  items: UnifiedTableSettingsItem[];
  values: Record<string, unknown>;
  onChange: (id: string, value: unknown) => void;
}

interface UnifiedTableNodeControlBase {
  id?: string;
  hidden?: boolean;
  desktop: React.ReactNode;
  mobile?: React.ReactNode;
}

export interface UnifiedTablePeriodControl extends UnifiedTableNodeControlBase {
  kind: "period";
}

export interface UnifiedTableComparisonControl
  extends UnifiedTableNodeControlBase {
  kind: "comparison";
}

export interface UnifiedTableFiltersControl extends UnifiedTableNodeControlBase {
  kind: "filters";
}

export interface UnifiedTableSearchControl extends UnifiedTableNodeControlBase {
  kind: "search";
}

export interface UnifiedTableColumnsControl extends UnifiedTableNodeControlBase {
  kind: "columns";
}

export interface UnifiedTableExportControl extends UnifiedTableNodeControlBase {
  kind: "export";
}

export type UnifiedTableControl =
  | UnifiedTablePeriodControl
  | UnifiedTableComparisonControl
  | UnifiedTableFiltersControl
  | UnifiedTableSearchControl
  | UnifiedTableColumnsControl
  | UnifiedTableExportControl
  | UnifiedTableSettingsControl;

export function normalizeUnifiedTableControls(
  controls: UnifiedTableControl[],
): UnifiedTableControl[] {
  const order = new Map(unifiedTableControlOrder.map((kind, idx) => [kind, idx]));

  return controls
    .filter((control) => !("hidden" in control && control.hidden))
    .slice()
    .sort((a, b) => (order.get(a.kind) ?? 999) - (order.get(b.kind) ?? 999));
}

export function createFinanceTableSettingsItems({
  hideZeroRowsDefault = false,
  showRowTotalsDefault = true,
}: {
  hideZeroRowsDefault?: boolean;
  showRowTotalsDefault?: boolean;
} = {}): UnifiedTableSettingsItem[] {
  return [
    {
      id: "hideZeroRows",
      label: "Hide zero rows",
      defaultValue: hideZeroRowsDefault,
    },
    {
      id: "showRowTotals",
      label: "Show row totals",
      defaultValue: showRowTotalsDefault,
    },
  ];
}

export function useUnifiedTableSettings(
  tableId: string,
  settings: UnifiedTableSettingsItem[],
) {
  return useDataTableSettings(
    tableId,
    settings.map((setting) => ({
      id: setting.id,
      label: setting.label,
      type: "boolean" as const,
      defaultValue: setting.defaultValue,
    })),
  );
}
