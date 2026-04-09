import type { Row } from "read-excel-file";

export type CellValue = string | number | boolean | null;
export type RowType = CellValue[];

export function convertRowsToStringArray(rows: Row[]) {
  return rows
    .map((row) => row.map((cell) => (cell != null ? cell.toString() : ""))) // Convert non-null cells to string, empty for null/undefined
    .filter((row) => row.some((cell) => cell.trim() !== "")); // Remove fully empty rows
}

export function filterRowsByCallback<T>(
  rows: RowType[],
  callback: (row: RowType) => boolean
): T[] {
  return rows.filter(callback) as T[];
}

export function filterColumnsByCallback<T>(
  rows: RowType[],
  callback: (cell: CellValue) => boolean
): T[] {
  return rows.filter((row) => row.some(callback)) as T[];
}
