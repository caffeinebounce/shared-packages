export type SpreadsheetStyle =
  | "header"
  | "text"
  | "number"
  | "currency"
  | "percent"
  | "totalLabel"
  | "totalNumber";

export interface SpreadsheetCell {
  value?: string | number;
  formula?: string;
  type?: "String" | "Number";
  style?: SpreadsheetStyle;
}

export interface SpreadsheetWorkbookInput {
  worksheetName: string;
  rows: SpreadsheetCell[][];
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function styleId(style?: SpreadsheetStyle): string | undefined {
  if (!style) return undefined;
  const map: Record<SpreadsheetStyle, string> = {
    header: "Header",
    text: "Text",
    number: "Number",
    currency: "Currency",
    percent: "Percent",
    totalLabel: "TotalLabel",
    totalNumber: "TotalNumber",
  };
  return map[style];
}

export function excelColumnName(columnIndex: number): string {
  let n = columnIndex + 1;
  let result = "";
  while (n > 0) {
    const rem = (n - 1) % 26;
    result = String.fromCharCode(65 + rem) + result;
    n = Math.floor((n - 1) / 26);
  }
  return result;
}

export function excelCellRef(rowIndex: number, columnIndex: number): string {
  return `${excelColumnName(columnIndex)}${rowIndex + 1}`;
}

export function buildSpreadsheetWorkbookXml({
  worksheetName,
  rows,
}: SpreadsheetWorkbookInput): string {
  const xmlRows = rows
    .map(
      (row) =>
        `<Row>${row
          .map((cell) => {
            const inferredType =
              cell.type ??
              (typeof cell.value === "number" || cell.formula
                ? "Number"
                : "String");
            const rawValue = cell.value ?? "";
            const value =
              inferredType === "Number"
                ? Number(rawValue || 0)
                : escapeXml(String(rawValue));
            const style = styleId(cell.style);
            const styleAttr = style ? ` ss:StyleID="${style}"` : "";
            const formulaAttr = cell.formula
              ? ` ss:Formula="=${escapeXml(cell.formula)}"`
              : "";
            return `<Cell${styleAttr}${formulaAttr}><Data ss:Type="${inferredType}">${value}</Data></Cell>`;
          })
          .join("")}</Row>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
<Styles>
  <Style ss:ID="Header"><Font ss:Bold="1"/><Interior ss:Color="#F3F4F6" ss:Pattern="Solid"/></Style>
  <Style ss:ID="Text"><NumberFormat ss:Format="@"/></Style>
  <Style ss:ID="Number"><NumberFormat ss:Format="#,##0.00"/></Style>
  <Style ss:ID="Currency"><NumberFormat ss:Format="$#,##0.00;[Red]($#,##0.00)"/></Style>
  <Style ss:ID="Percent"><NumberFormat ss:Format="0.00%"/></Style>
  <Style ss:ID="TotalLabel"><Font ss:Bold="1"/><Interior ss:Color="#F9FAFB" ss:Pattern="Solid"/></Style>
  <Style ss:ID="TotalNumber"><Font ss:Bold="1"/><NumberFormat ss:Format="$#,##0.00;[Red]($#,##0.00)"/><Interior ss:Color="#F9FAFB" ss:Pattern="Solid"/></Style>
</Styles>
<Worksheet ss:Name="${escapeXml(worksheetName)}"><Table>
${xmlRows}
</Table></Worksheet></Workbook>`;
}

export function downloadExcelXml(xml: string, filename: string): void {
  const blob = new Blob([xml], {
    type: "application/vnd.ms-excel;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.xls`;
  link.click();
  URL.revokeObjectURL(url);
}
