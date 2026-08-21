export type ExportCell = string | number

// UTF-8 byte order mark so Excel detects the encoding (currency symbols, accented names)
const BOM = String.fromCharCode(0xfeff)

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function exportToCSV(filename: string, headers: string[], rows: ExportCell[][]) {
  const csv = [headers, ...rows]
    .map((row) => row.map((field) => `"${String(field ?? "").replace(/"/g, '""')}"`).join(","))
    .join("\n")
  const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" })
  triggerDownload(blob, filename)
}

export async function exportToExcel(filename: string, sheetName: string, headers: string[], rows: ExportCell[][]) {
  const XLSX = await import("xlsx")
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows])
  worksheet["!cols"] = headers.map((h, i) => ({
    wch: Math.min(
      40,
      Math.max(h.length, ...rows.map((r) => String(r[i] ?? "").length)) + 2,
    ),
  }))
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.slice(0, 31))
  XLSX.writeFile(workbook, filename)
}

interface ExcelSheet {
  name: string
  headers: string[]
  rows: ExportCell[][]
}

/**
 * Build an .xlsx workbook with multiple sheets in one download.
 * Used when a single export must carry both a summary and a detailed
 * breakdown (e.g. student summary + every grade record).
 */
export async function exportToExcelMulti(filename: string, sheets: ExcelSheet[]) {
  const XLSX = await import("xlsx")
  const workbook = XLSX.utils.book_new()
  for (const sheet of sheets) {
    const worksheet = XLSX.utils.aoa_to_sheet([sheet.headers, ...sheet.rows])
    worksheet["!cols"] = sheet.headers.map((h, i) => ({
      wch: Math.min(
        40,
        Math.max(h.length, ...sheet.rows.map((r) => String(r[i] ?? "").length)) + 2,
      ),
    }))
    XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name.slice(0, 31))
  }
  XLSX.writeFile(workbook, filename)
}
