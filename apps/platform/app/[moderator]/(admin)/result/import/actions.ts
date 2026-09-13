"use server";

import { z } from "zod";
import { isValidRollNumber } from "~/constants";
import dbConnect from "~/lib/dbConnect";
import serverApis from "~/lib/server-apis/server";
import ResultModel from "~/models/result";
import { guarded, unwrap } from "../guard";

const MAX_ROWS = 3000;
const MAX_CHUNK = 200;

const rowSchema = z.object({
  row: z.number().int().positive(),
  name: z.string().max(200),
  rollNo: z.string().max(40),
  gender: z.enum(["male", "female", "not_specified"]),
});

export type ImportRow = z.infer<typeof rowSchema>;
export type SkippedRow = { row: number; rollNo: string; reason: string };

async function existingRollNos(rollNos: string[]) {
  if (rollNos.length === 0) return new Set<string>();
  await dbConnect();
  const docs = await ResultModel.find({ rollNo: { $in: rollNos } })
    .select("rollNo")
    .lean<{ rollNo: string }[]>();
  return new Set(docs.map((d) => d.rollNo));
}

/** Dry run: nothing is written. Splits rows into ready and skipped, with a reason per skipped row. */
export async function previewFreshersImport(input: ImportRow[]) {
  return guarded("Couldn't check the rows", async () => {
    const rows = z.array(rowSchema).max(MAX_ROWS).parse(input);
    const ready: ImportRow[] = [];
    const skipped: SkippedRow[] = [];
    const firstSeen = new Map<string, number>();

    for (const raw of rows) {
      const row = {
        ...raw,
        name: raw.name.trim().replace(/\s+/g, " "),
        rollNo: raw.rollNo.trim().toLowerCase(),
      };
      if (!row.rollNo) {
        skipped.push({
          row: row.row,
          rollNo: "",
          reason: "Roll number is empty",
        });
      } else if (!isValidRollNumber(row.rollNo)) {
        skipped.push({
          row: row.row,
          rollNo: row.rollNo,
          reason: "Roll number should look like 25bcs001",
        });
      } else if (!row.name) {
        skipped.push({
          row: row.row,
          rollNo: row.rollNo,
          reason: "Name is empty",
        });
      } else if (firstSeen.has(row.rollNo)) {
        skipped.push({
          row: row.row,
          rollNo: row.rollNo,
          reason: `Duplicate of row ${firstSeen.get(row.rollNo)}`,
        });
      } else {
        firstSeen.set(row.rollNo, row.row);
        ready.push(row);
      }
    }

    const existing = await existingRollNos(ready.map((r) => r.rollNo));
    const fresh = ready.filter((r) => !existing.has(r.rollNo));
    for (const r of ready) {
      if (existing.has(r.rollNo)) {
        skipped.push({
          row: r.row,
          rollNo: r.rollNo,
          reason: "Already in the database",
        });
      }
    }
    skipped.sort((a, b) => a.row - b.row);
    return { ready: fresh, skipped };
  });
}

// apps/server rejects the whole request if any roll number already exists, so re-check each chunk.
export async function importFreshersChunk(input: ImportRow[]) {
  return guarded("Import request failed", async () => {
    const rows = z.array(rowSchema).min(1).max(MAX_CHUNK).parse(input);
    const valid = rows.filter(
      (r) => isValidRollNumber(r.rollNo) && r.name.trim()
    );
    const existing = await existingRollNos(valid.map((r) => r.rollNo));
    const toInsert = valid.filter((r) => !existing.has(r.rollNo));
    const skipped: SkippedRow[] = rows
      .filter((r) => !toInsert.includes(r))
      .map((r) => ({
        row: r.row,
        rollNo: r.rollNo,
        reason: existing.has(r.rollNo)
          ? "Already in the database"
          : "Invalid row",
      }));

    if (toInsert.length > 0) {
      const res = await serverApis.results.importFreshers(
        toInsert.map(({ name, rollNo, gender }) => ({ name, rollNo, gender }))
      );
      unwrap(res, "Import request failed");
    }
    return { imported: toInsert.length, skipped };
  });
}
