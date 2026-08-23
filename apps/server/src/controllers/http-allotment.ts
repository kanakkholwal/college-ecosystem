/* eslint-disable @typescript-eslint/no-explicit-any */
import ExcelJS from "exceljs";
import type { Request, Response } from "express";
import { allotRooms } from '../services/allotment.service';

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
    if ("richText" in value) return value.richText.map((part: any) => part.text).join("");
    if ("error" in value) return undefined;
    return value;
}

export async function allotRoomsFromExcel(req: Request, res: Response) {
    try {
        const buffer = req.file?.buffer;
        if (!buffer) return res.status(400).send('Excel file required');

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer as any);
        const sheet = workbook.worksheets[0];
        if (!sheet) return res.status(400).send('Excel file has no sheets');
        const data = sheetToJson(sheet);

        const roomDistribution = JSON.parse(req.body.roomDistribution);
        const fieldMapping = JSON.parse(req.body.fieldMapping);
        const gender = req.body.gender;
        const soePriority = req.body.soePriority;

        const extraFields = JSON.parse(req.body.extraFields || '[]');

        const allocation = await allotRooms(data, roomDistribution,fieldMapping, gender, soePriority, extraFields);
        return res.status(200).json({ success: true, allocation });

    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
}
