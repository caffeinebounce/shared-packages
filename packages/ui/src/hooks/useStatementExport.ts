"use client";

import { useCallback } from "react";
import {
  type FinancialStatementConfig,
  type FinancialStatementEntry,
  flattenStatementForExport,
  type SubtotalRulesConfig,
  type TimeUnit,
} from "../blocks/data-table/FinancialStatementTable";
import {
  buildSpreadsheetWorkbookXml,
  downloadExcelXml,
  excelColumnName,
  type SpreadsheetCell,
} from "./spreadsheetWorkbook";

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
        const escapeCsv = (value: string) => `"${value.replace(/"/g, '""')}"`;
        const csv = [
          headers.map(escapeCsv).join(","),
          ...dataRows.map((row) => row.map(escapeCsv).join(",")),
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

      const rowStart = 2;
      const firstValueColumn = 1;
      const lastValueColumn = periodKeys.length;
      const totalColumn = headers.length - 1;

      const rows: SpreadsheetCell[][] = [
        headers.map((header, index) => ({
          value: header,
          style: index === totalColumn ? "totalLabel" : "header",
        })),
        ...flat.map((row, rowIndex) => {
          const excelRow = rowStart + rowIndex;
          const totalFormula = `SUM(${excelColumnName(firstValueColumn)}${excelRow}:${excelColumnName(lastValueColumn)}${excelRow})`;
          return [
            { value: row.account, style: "text" },
            ...periodKeys.map((periodKey) => ({
              value: Number(row[periodKey] ?? 0),
              style: "currency" as const,
              type: "Number" as const,
            })),
            {
              formula: totalFormula,
              value: Number(row.total ?? 0),
              style: "totalNumber",
              type: "Number",
            },
          ];
        }),
      ];

      const xml = buildSpreadsheetWorkbookXml({
        worksheetName,
        rows,
      });
      downloadExcelXml(xml, filename);
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
