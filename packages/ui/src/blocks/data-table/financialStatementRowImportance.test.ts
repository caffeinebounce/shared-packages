import { describe, expect, it } from "vitest";

import {
  createFinancialStatementRowImportanceResolver,
  getFinancialStatementRowImportanceClassName,
} from "./financialStatementRowImportance";
import type { StatementRow } from "./FinancialStatementTable";

function makeRow(name: string): StatementRow {
  return {
    _type: "grand-total",
    id: name,
    name,
    accountNumber: null,
    periodAmounts: {},
    total: 0,
    children: [],
    depth: 0,
  };
}

describe("createFinancialStatementRowImportanceResolver", () => {
  it("maps income statement labels to emphasis and key-summary", () => {
    const resolve = createFinancialStatementRowImportanceResolver(
      "income-statement",
    );

    expect(resolve(makeRow("Total Revenue"))).toBe("emphasis");
    expect(resolve(makeRow("Operating Income"))).toBe("emphasis");
    expect(resolve(makeRow("Net Income"))).toBe("key-summary");
    expect(resolve(makeRow("Random"))).toBe("normal");
  });

  it("maps balance, cash-flow, and working-capital labels", () => {
    const balance = createFinancialStatementRowImportanceResolver(
      "balance-sheet",
    );
    const cash = createFinancialStatementRowImportanceResolver("cash-flow");
    const wc = createFinancialStatementRowImportanceResolver("working-capital");

    expect(balance(makeRow("Total Liabilities"))).toBe("emphasis");
    expect(balance(makeRow("Total Liabilities & Equity"))).toBe("key-summary");

    expect(cash(makeRow("Net Cash from Operating Activities"))).toBe(
      "emphasis",
    );
    expect(cash(makeRow("Ending Cash"))).toBe("key-summary");

    expect(wc(makeRow("Total Current Assets"))).toBe("emphasis");
    expect(wc(makeRow("Net Working Capital"))).toBe("key-summary");
  });

  it("supports overrides", () => {
    const resolve = createFinancialStatementRowImportanceResolver(
      "income-statement",
      {
        keySummary: ["Profit"],
      },
    );

    expect(resolve(makeRow("Profit"))).toBe("key-summary");
    expect(resolve(makeRow("Net Income"))).toBe("normal");
  });
});

describe("getFinancialStatementRowImportanceClassName", () => {
  it("returns classes for emphasis and key-summary", () => {
    expect(getFinancialStatementRowImportanceClassName("emphasis")).toContain(
      "font-medium",
    );
    expect(
      getFinancialStatementRowImportanceClassName("key-summary"),
    ).toContain("font-semibold");
    expect(getFinancialStatementRowImportanceClassName("normal")).toBe(
      undefined,
    );
  });
});
