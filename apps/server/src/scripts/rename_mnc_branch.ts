import mongoose from "mongoose";
import { getDepartmentName } from "../constants/departments";
import ResultModel from "../models/result";
import dbConnect from "../utils/dbConnect";

// The name determineDepartment used to write before it read DEPARTMENTS_LIST.
const LEGACY_NAME = "Mathematics and Computing";
const CANONICAL_NAME = getDepartmentName("mnc");

function readArgs() {
  const args = process.argv.slice(2);
  const db = args.find((arg) => arg.startsWith("--db="))?.slice("--db=".length);
  if (db !== "production" && db !== "testing") {
    throw new Error("Pass --db=production or --db=testing");
  }
  return { db, dryRun: args.includes("--dry-run") } as const;
}

async function renameMncBranch() {
  const { db, dryRun } = readArgs();
  if (CANONICAL_NAME === "other") {
    throw new Error("DEPARTMENTS_LIST has no department with code mnc");
  }
  await dbConnect(db);

  const legacyCount = await ResultModel.countDocuments({ branch: LEGACY_NAME });
  const canonicalCount = await ResultModel.countDocuments({
    branch: CANONICAL_NAME,
  });
  console.log({
    db,
    dryRun,
    from: LEGACY_NAME,
    to: CANONICAL_NAME,
    legacyCount,
    canonicalCount,
  });

  if (dryRun || legacyCount === 0) {
    console.log(dryRun ? "Dry run: nothing written." : "Nothing to rename.");
    return;
  }

  // timestamps off: the backlog scrape queue is ordered by updatedAt.
  const result = await ResultModel.updateMany(
    { branch: LEGACY_NAME },
    { $set: { branch: CANONICAL_NAME } },
    { timestamps: false }
  );
  console.log({
    matched: result.matchedCount,
    modified: result.modifiedCount,
  });
  console.log("Done. Re-run assign-ranks so branch ranks merge.");
}

renameMncBranch()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
