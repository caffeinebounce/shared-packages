"use client";

import { useCallback } from "react";
import {
  type FinancialStatementConfig,
  type FinancialStatementEntry,
  flattenStatementForExport,
  type SubtotalRulesConfig,
  type TimeUnit,
} from "../blocks/data-table/FinancialStatementTable";

interface UseStatementExportParams {
  entries: FinancialStatementEntry[];
  config: FinancialStatementConfig;
  timeUnit: TimeUnit;
  subtotalRules?: SubtotalRulesConfig;
  hideZeroRows: boolean;
  periodStart: string;
  periodEnd: string;
  filenamePrefix: string;
  worksheetName: string;
}

export function useStatementExport({
  entries,
  config,
  timeUnit,
  subtotalRules,
  hideZeroRows,
  periodStart,
  periodEnd,
  filenamePrefix,
  worksheetName,
}: UseStatementExportParams) {
  return useCallback(
    (format: "csv" | "excel") => {
      const { rows: flat, periodKeys } = flattenStatementForExport(
        entries,
        config,
        timeUnit,
        subtotalRules,
        hideZeroRows,
      );
      const headers = ["Account", ...periodKeys, "Total"];
      const dataRows = flat.map((row) => [
        row.account,
        ...periodKeys.map((periodKey) => String(row[periodKey] ?? 0)),
        String(row.total ?? 0),
      ]);
      const filename = `${filenamePrefix}-${periodStart}-to-${periodEnd}`;

      if (format === "csv") {
        const csv = [
          headers.join(","),
          ...dataRows.map((row) => row.map((value) => `"${value}"`).join(",")),
        ].join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `${filename}.csv`;
        anchor.click();
        URL.revokeObjectURL(url);
        return;
      }

      const escapeXml = (value: string) =>
        value
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
<Styles><Style ss:ID="H"><Font ss:Bold="1"/></Style></Styles>
<Worksheet ss:Name="${escapeXml(worksheetName)}"><Table>
<Row>${headers.map((header) => `<Cell ss:StyleID="H"><Data ss:Type="String">${escapeXml(header)}</Data></Cell>`).join("")}</Row>
${dataRows
  .map(
    (row) =>
      `<Row>${row
        .map((value, index) => {
          const isNumber = index > 0 && !Number.isNaN(Number(value));
          return `<Cell><Data ss:Type="${isNumber ? "Number" : "String"}">${isNumber ? value : escapeXml(value)}</Data></Cell>`;
        })
        .join("")}</Row>`,
  )
  .join("\n")}
</Table></Worksheet></Workbook>`;

      const blob = new Blob([xml], {
        type: "application/vnd.ms-excel;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${filename}.xls`;
      anchor.click();
      URL.revokeObjectURL(url);
    },
    [
      config,
      entries,
      filenamePrefix,
      hideZeroRows,
      periodEnd,
      periodStart,
      subtotalRules,
      timeUnit,
      worksheetName,
    ],
  );
}
