import { describe, expect, it } from "vitest";

import {
  createFinanceTableSettingsItems,
  normalizeUnifiedTableControls,
  unifiedTableControlOrder,
  type UnifiedTableControl,
} from "./UnifiedTableControls.schema";

describe("UnifiedTableControls.schema", () => {
  it("normalizes controls into deterministic order", () => {
    const controls: UnifiedTableControl[] = [
      { kind: "export", desktop: "export" },
      { kind: "period", desktop: "period" },
      { kind: "filters", desktop: "filters" },
      {
        kind: "settings",
        items: [{ id: "x", label: "X", defaultValue: false }],
        values: { x: false },
        onChange: () => {},
      },
    ];

    expect(normalizeUnifiedTableControls(controls).map((c) => c.kind)).toEqual([
      "period",
      "filters",
      "export",
      "settings",
    ]);
    expect(unifiedTableControlOrder).toEqual([
      "period",
      "comparison",
      "filters",
      "search",
      "columns",
      "export",
      "settings",
    ]);
  });

  it("builds finance settings defaults", () => {
    expect(createFinanceTableSettingsItems()).toEqual([
      {
        id: "hideZeroRows",
        label: "Hide zero rows",
        defaultValue: false,
      },
      {
        id: "showRowTotals",
        label: "Show row totals",
        defaultValue: true,
      },
    ]);
  });
});
