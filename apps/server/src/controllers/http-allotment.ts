/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Request, Response } from "express";
import * as XLSX from 'xlsx';
import { allotRooms } from '../services/allotment.service';

export async function allotRoomsFromExcel(req: Request, res: Response) {
    try {
        const buffer = req.file?.buffer;
        if (!buffer) return res.status(400).send('Excel file required');

        const tempWorkbook = XLSX.read(buffer);
        const sheet = tempWorkbook.Sheets[tempWorkbook.SheetNames[0]];
        const data: any[] = XLSX.utils.sheet_to_json(sheet);

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

