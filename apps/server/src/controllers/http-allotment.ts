/* biome-ignore-all lint/suspicious/noExplicitAny: sheet rows are untyped spreadsheet data */
import ExcelJS from "exceljs";
import type { Request, Response } from "express";
import { z } from "zod";
import { allotRooms } from "../services/allotment.service";

// Rooms are materialised one object per seat group, so an uncapped count can exhaust memory.
const MAX_ROOMS = 5000;

const allotmentBodySchema = z.object({
  roomDistribution: z
    .record(z.string().regex(/^\d+$/), z.number().int().min(0).max(MAX_ROOMS))
    .refine(
      (d) => Object.values(d).reduce((sum, n) => sum + n, 0) <= MAX_ROOMS,
      `At most ${MAX_ROOMS} rooms`
    ),
  fieldMapping: z.record(z.string(), z.string()),
  gender: z.string().min(1),
  soePriority: z.string().optional(),
  extraFields: z.array(z.string()).max(50),
});

function parseJson(value: unknown): unknown {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
}

// Mirrors the old XLSX.utils.sheet_to_json: header row keys the objects and
// empty cells are omitted rather than set to undefined.
function sheetToJson(sheet: ExcelJS.Worksheet): any[] {
  const headers = (sheet.getRow(1).values as any[] | undefined) ?? [];
  const rows: any[] = [];

  sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return;
    const values = row.values as any[];
    const record: Record<string, any> = {};
    for (let col = 1; col < headers.length; col++) {
      const key = headers[col];
      const value = cellValue(values[col]);
      if (key === undefined || key === null || value === undefined) continue;
      record[String(key).trim()] = value;
    }
    if (Object.keys(record).length > 0) rows.push(record);
  });

  return rows;
}

// exceljs hands back objects for formulas, hyperlinks and rich text.
function cellValue(value: any): any {
  if (value === null || value === undefined || value === "") return undefined;
  if (typeof value !== "object" || value instanceof Date) return value;
  if ("result" in value) return cellValue(value.result);
  if ("text" in value) return value.text;
  if ("richText" in value)
    return value.richText.map((part: any) => part.text).join("");
  if ("error" in value) return undefined;
  return value;
}

export async function allotRoomsFromExcel(req: Request, res: Response) {
  try {
    const buffer = req.file?.buffer;
    if (!buffer) return res.status(400).send("Excel file required");

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as any);
    const sheet = workbook.worksheets[0];
    if (!sheet) return res.status(400).send("Excel file has no sheets");
    const data = sheetToJson(sheet);

    const parsed = allotmentBodySchema.safeParse({
      roomDistribution: parseJson(req.body.roomDistribution),
      fieldMapping: parseJson(req.body.fieldMapping),
      gender: req.body.gender,
      soePriority: req.body.soePriority,
      extraFields: parseJson(req.body.extraFields || "[]"),
    });
    if (!parsed.success) {
      return res.status(400).json({
        error: true,
        message: `Invalid allotment options: ${parsed.error.issues.map((issue) => issue.path.join(".") || issue.message).join(", ")}`,
        data: null,
      });
    }
    const { roomDistribution, fieldMapping, gender, soePriority, extraFields } =
      parsed.data;

    const allocation = await allotRooms(
      data,
      roomDistribution,
      fieldMapping as any,
      gender,
      soePriority,
      extraFields
    );
    return res.status(200).json({ success: true, allocation });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({
        error: true,
        message: "Room allotment failed on the server",
        data: null,
      });
  }
}
