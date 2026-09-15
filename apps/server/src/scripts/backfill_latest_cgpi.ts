import mongoose from "mongoose";
import ResultModel from "../models/result";
import dbConnect from "../utils/dbConnect";

function readArgs() {
  const args = process.argv.slice(2);
  const db = args.find((arg) => arg.startsWith("--db="))?.slice("--db=".length);
  if (db !== "production" && db !== "testing") {
    throw new Error("Pass --db=production or --db=testing");
  }
  return { db, dryRun: args.includes("--dry-run") } as const;
}

// Same value the save hook writes: the last semester's cgpi, or 0.
const LAST_CGPI = {
  $ifNull: [{ $arrayElemAt: ["$semesters.cgpi", -1] }, 0],
};

// Only docs whose stored value is missing or out of date, so re-runs write nothing.
const STALE = {
  semesters: { $exists: true, $type: "array", $ne: [] },
  $expr: { $ne: [{ $ifNull: ["$latestCgpi", null] }, LAST_CGPI] },
};

/** GET /results/batch used to refresh latestCgpi as a side effect; ranking now relies on the stored value. */
async function backfillLatestCgpi() {
  const { db, dryRun } = readArgs();
  await dbConnect(db);

  const staleCount = await ResultModel.countDocuments(STALE);
  console.log({ db, dryRun, staleCount });
  if (dryRun || staleCount === 0) {
    console.log(dryRun ? "Dry run: nothing written." : "Nothing to backfill.");
    return;
  }

  // timestamps off: the backlog scrape queue is ordered by updatedAt.
  const result = await ResultModel.updateMany(
    STALE,
    [{ $set: { latestCgpi: LAST_CGPI } }],
    { timestamps: false }
  );
  console.log({ matched: result.matchedCount, modified: result.modifiedCount });
  console.log("Done. Re-run assign-ranks so ranks use the refreshed values.");
}

backfillLatestCgpi()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
