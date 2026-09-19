import { describe, expect, it } from "vitest";

import {
  calculateDesktopFinancialColumnSizing,
  resolvePeriodColumns,
  type StatementRow,
} from "./FinancialStatementTable";

describe("resolvePeriodColumns", () => {
  it("defaults to oldest-first when no explicit order is provided", () => {
    const periods = ["2024-01", "2024-02", "2024-03"];

    const resolved = resolvePeriodColumns(periods, "month");

    expect(resolved).toEqual(["2024-01", "2024-02", "2024-03"]);
  });

  it("supports global newest-first order", () => {
    const periods = ["2024-01", "2024-02", "2024-03"];

    const resolved = resolvePeriodColumns(
      periods,
      "month",
      undefined,
      "newest-first",
    );

    expect(resolved).toEqual(["2024-03", "2024-02", "2024-01"]);
  });

  it("keeps explicit period order for mobile/priority paths", () => {
    const periods = ["2024-01", "2024-02", "2024-03"];

    const resolved = resolvePeriodColumns(
      periods,
      "month",
      ["2024-03", "2024-01"],
      "oldest-first",
    );

    expect(resolved).toEqual(["2024-03", "2024-01", "2024-02"]);
  });
});

describe("calculateDesktopFinancialColumnSizing", () => {
  const baseRows: StatementRow[] = [
    {
      _type: "account",
      id: "1",
      name: "Revenue",
      accountNumber: "4000",
      periodAmounts: {
        "2024-01": 1234,
        "2024-02": 94567,
        "2024-03": 1200000,
        "2024-04": 8765432,
      },
      total: 10000000,
      children: [],
      depth: 1,
    },
  ];

  it("gives wider account column when there are fewer period columns", () => {
    const few = calculateDesktopFinancialColumnSizing({
      periods: ["2024-01", "2024-02"],
      rows: baseRows,
      showRowTotals: true,
      showVariance: false,
    });
    const many = calculateDesktopFinancialColumnSizing({
      periods: [
        "2024-01",
        "2024-02",
        "2024-03",
        "2024-04",
        "2024-05",
        "2024-06",
        "2024-07",
      ],
      rows: baseRows,
      showRowTotals: true,
      showVariance: false,
    });

    expect(few.accountSize).toBeGreaterThan(many.accountSize);
  });

  it("shrinks data columns toward min width as period count increases", () => {
    const result = calculateDesktopFinancialColumnSizing({
      periods: [
        "2024-01",
        "2024-02",
        "2024-03",
        "2024-04",
        "2024-05",
        "2024-06",
        "2024-07",
        "2024-08",
      ],
      rows: baseRows,
      showRowTotals: true,
      showVariance: true,
    });

    expect(result.dataSize).toBeGreaterThanOrEqual(result.dataMinSize);
    expect(result.dataMinSize).toBe(88);
  });
});
