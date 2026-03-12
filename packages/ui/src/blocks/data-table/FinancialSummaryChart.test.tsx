import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { FinancialStatementEntry } from "./FinancialStatementTable";
import type { FinancialSummaryChartConfig } from "./FinancialSummaryChart";
import { FinancialSummaryChart } from "./FinancialSummaryChart";

const baseConfig: FinancialSummaryChartConfig = {
  title: "Summary",
  metrics: [
    {
      key: "revenue",
      label: "Revenue",
      accountClasses: ["Revenue"],
      color: "#22c55e",
    },
  ],
};

function createEntry(
  periodFirstDay: string,
  amount: number,
): FinancialStatementEntry {
  return {
    period_first_day: periodFirstDay,
    account_id: `acc-${periodFirstDay}`,
    account_name: "Revenue",
    account_number: "4000",
    account_class: "Revenue",
    amount,
  };
}

describe("FinancialSummaryChart", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockImplementation((query: string) => ({
        matches: query.includes("min-width"),
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    );
  });

  it("uses statValueMode='sum' to aggregate across periods", () => {
    render(
      <FinancialSummaryChart
        data={[createEntry("2026-01-01", 100), createEntry("2026-02-01", 200)]}
        timeUnit="month"
        config={{ ...baseConfig, defaultExpanded: false, statValueMode: "sum" }}
      />,
    );

    expect(screen.getAllByText("$300").length).toBeGreaterThan(0);
  });

  it("uses statValueMode='latest' to show only the latest period total", () => {
    render(
      <FinancialSummaryChart
        data={[createEntry("2026-01-01", 100), createEntry("2026-02-01", 200)]}
        timeUnit="month"
        config={{
          ...baseConfig,
          defaultExpanded: false,
          statValueMode: "latest",
        }}
      />,
    );

    expect(screen.getAllByText("$200").length).toBeGreaterThan(0);
    expect(screen.queryAllByText("$300")).toHaveLength(0);
  });

  it("shows latest period short label when statPeriodMode='asOfLatest'", () => {
    render(
      <FinancialSummaryChart
        data={[createEntry("2025-12-01", 100), createEntry("2026-01-01", 200)]}
        timeUnit="month"
        config={{
          ...baseConfig,
          defaultExpanded: true,
          statPeriodMode: "asOfLatest",
        }}
      />,
    );

    expect(screen.getByText("01/26")).toBeInTheDocument();
  });
});
