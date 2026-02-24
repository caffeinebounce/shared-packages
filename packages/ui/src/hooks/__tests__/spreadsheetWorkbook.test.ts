import { describe, expect, it } from "vitest";
import {
  buildSpreadsheetWorkbookXml,
  excelCellRef,
  excelColumnName,
} from "../spreadsheetWorkbook";

describe("spreadsheetWorkbook", () => {
  it("builds stable excel column names and refs", () => {
    expect(excelColumnName(0)).toBe("A");
    expect(excelColumnName(25)).toBe("Z");
    expect(excelColumnName(26)).toBe("AA");
    expect(excelCellRef(1, 27)).toBe("AB2");
  });

  it("serializes formula + style ids", () => {
    const xml = buildSpreadsheetWorkbookXml({
      worksheetName: "Test",
      rows: [
        [
          { value: "Account", style: "header" },
          { value: "Jan", style: "header" },
          { value: "Total", style: "totalLabel" },
        ],
        [
          { value: "Revenue", style: "text" },
          { value: 1000, type: "Number", style: "currency" },
          {
            formula: "SUM(B2:B2)",
            value: 1000,
            type: "Number",
            style: "totalNumber",
          },
        ],
      ],
    });

    expect(xml).toContain('ss:StyleID="Header"');
    expect(xml).toContain('ss:StyleID="Currency"');
    expect(xml).toContain('ss:Formula="=SUM(B2:B2)"');
  });
});
