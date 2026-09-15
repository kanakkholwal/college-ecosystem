"use server";

import { isValidRollNumber } from "~/constants";
import dbConnect from "~/lib/dbConnect";
import { sendEmail } from "~/lib/email";
import { serverFetch } from "~/lib/fetch-server";
import serverApis from "~/lib/server-apis/server";
import type {
  AbNormalResult,
  deleteResponseType,
  ResultType,
  rawResultSchemaType,
} from "~/lib/server-apis/types";
import ResultModel from "~/models/result";
import { appConfig } from "~/project.config";
import { serialize } from "~/utils/serialize";
import { guarded, unwrap, upstreamFailure } from "./guard";
import {
  academicYearLabel,
  parseRecipients,
  resultMailSubject,
} from "./mail-copy";

export async function getResultOverview() {
  return guarded("Couldn't load result totals", async () => {
    await dbConnect();
    const [total, batches, branches, withFailedCourse, latest] =
      await Promise.all([
        ResultModel.countDocuments(),
        ResultModel.distinct("batch"),
        ResultModel.distinct("branch"),
        ResultModel.countDocuments({ "semesters.courses.cgpi": 0 }),
        ResultModel.findOne({})
          .sort({ updatedAt: -1 })
          .select("updatedAt")
          .lean<{ updatedAt?: Date }>(),
      ]);
    return {
      total,
      batches: batches.length,
      branches: branches.length,
      withFailedCourse,
      lastUpdatedAt: latest?.updatedAt
        ? new Date(latest.updatedAt).toISOString()
        : null,
    };
  });
}

export async function getAbnormalResults() {
  return guarded("Couldn't load flagged records", async () => {
    const res = await serverApis.results.getAbnormalResults(undefined);
    return (
      unwrap<AbNormalResult[] | null>(res, "Couldn't load flagged records") ??
      []
    );
  });
}

export type ResultSummary = {
  name: string;
  rollNo: string;
  branch: string;
  batch: number;
  programme: string;
  semesters: number;
  latestCgpi: number | null;
  collegeRank: number | null;
  updatedAt: string | null;
};

function summarise(
  result: (rawResultSchemaType | ResultType) & {
    rank?: { college?: number };
  }
): ResultSummary {
  return {
    name: result.name,
    rollNo: result.rollNo,
    branch: result.branch,
    batch: result.batch,
    programme: result.programme,
    semesters: result.semesters?.length ?? 0,
    latestCgpi: result.semesters?.at(-1)?.cgpi ?? null,
    collegeRank: result.rank?.college ?? null,
    updatedAt: result.updatedAt
      ? new Date(result.updatedAt).toISOString()
      : null,
  };
}

function normaliseRollNo(rollNo: string) {
  const value = rollNo.trim().toLowerCase();
  if (!isValidRollNumber(value)) {
    throw new Error(
      `"${rollNo}" isn't a roll number (expected e.g. 21bcs001).`
    );
  }
  return value;
}

/** Reads the stored record; `null` means it isn't in the database yet. */
export async function findStoredResult(rollNo: string) {
  return guarded("Couldn't look up that roll number", async () => {
    const value = normaliseRollNo(rollNo);
    await dbConnect();
    const doc = await ResultModel.findOne({ rollNo: value })
      .select(
        "name rollNo branch batch programme semesters.cgpi rank updatedAt"
      )
      .lean();
    return doc ? summarise(serialize(doc)) : null;
  });
}

/** Scrapes the college site without saving anything. */
export async function previewResultFromSite(rollNo: string) {
  return guarded("The college site didn't return a result", async () => {
    const res = await serverApis.results.getResultByRollNoFromSite(
      normaliseRollNo(rollNo)
    );
    return summarise(unwrap(res, "The college site didn't return a result"));
  });
}

export async function addResultFromSite(rollNo: string) {
  return guarded("Couldn't add that result", async () => {
    const res = await serverApis.results.addResultByRollNo(
      normaliseRollNo(rollNo)
    );
    return summarise(unwrap(res, "Couldn't add that result"));
  });
}

export async function refreshStoredResult(rollNo: string) {
  return guarded("Couldn't refresh that result", async () => {
    const res = await serverApis.results.updateResultByRollNo([
      normaliseRollNo(rollNo),
      {},
    ]);
    return summarise(unwrap(res, "Couldn't refresh that result"));
  });
}

export async function deleteStoredResult(rollNo: string) {
  return guarded("Couldn't delete that result", async () => {
    const res = await serverApis.results.deleteResultByRollNo(
      normaliseRollNo(rollNo)
    );
    const data = unwrap<deleteResponseType>(res, "Couldn't delete that result");
    return { deletedCount: data?.deletedCount ?? 0 };
  });
}

export type RankJobSummary = {
  matchedCount: number | null;
  modifiedCount: number | null;
  failedCount: number;
  timeTaken: string | null;
  message: string;
};

export async function recalculateRanks() {
  return guarded("Rank recalculation failed", async () => {
    const res = await serverApis.results.assignRank(undefined);
    const data = unwrap<Record<string, unknown> | null>(
      res,
      "Rank recalculation failed"
    );
    const num = (v: unknown) => (typeof v === "number" ? v : null);
    return {
      matchedCount: num(data?.matchedCount),
      modifiedCount: num(data?.modifiedCount),
      failedCount: Array.isArray(data?.failed) ? data.failed.length : 0,
      timeTaken: typeof data?.timeTaken === "string" ? data.timeTaken : null,
      message: (res as { message?: string })?.message ?? "Ranks recalculated",
    } satisfies RankJobSummary;
  });
}

export async function syncBranchChanges() {
  return guarded("Branch sync failed", async () => {
    const res = await serverApis.results.assignBranchChange(undefined);
    const data = unwrap<Record<string, unknown> | null>(
      res,
      "Branch sync failed"
    );
    return {
      timeTaken: typeof data?.timeTaken === "string" ? data.timeTaken : null,
    };
  });
}

const MAX_BULK = 16;

function validRollNos(rollNos: string[], max: number) {
  const valid = Array.from(
    new Set(
      rollNos.map((r) => r.trim().toLowerCase()).filter(isValidRollNumber)
    )
  );
  if (valid.length === 0) throw new Error("No valid roll numbers to process.");
  if (valid.length > max)
    throw new Error(`Send at most ${max} roll numbers per request.`);
  return valid;
}

/** Re-scrapes semesters for a chunk. The server counts a failed scrape as updated, so callers re-check. */
export async function refreshResultsChunk(rollNos: string[]) {
  return guarded("Refresh request failed", async () => {
    const valid = validRollNos(rollNos, MAX_BULK);
    // endpoints.ts points at /bulk-update, which Express routes to POST /:rollNo instead.
    const { data, error } = await serverFetch<{
      data: {
        total: number;
        updated: number;
        errors: { rollNo: string; error: string }[];
      };
    }>("/api/results/bulk/update", {
      method: "POST",
      body: JSON.stringify({ rollNos: valid }),
    });
    if (error) throw upstreamFailure(error, "Refresh request failed");
    const payload = unwrap<{
      updated: number;
      errors: { rollNo: string; error: string }[];
    }>(data, "Refresh request failed");
    return { sent: valid.length, errors: payload?.errors ?? [] };
  });
}

export async function deleteResultsBulk(rollNos: string[]) {
  return guarded("Delete request failed", async () => {
    const valid = validRollNos(rollNos, 2000);
    const { data, error } = await serverFetch("/api/results/bulk/delete", {
      method: "POST",
      body: JSON.stringify({ rollNos: valid }),
    });
    if (error) throw upstreamFailure(error, "Delete request failed");
    const payload = unwrap<deleteResponseType>(data, "Delete request failed");
    return { deletedCount: payload?.deletedCount ?? 0 };
  });
}

const MAX_RECIPIENTS = 500;

export async function sendResultUpdateMail(input: string) {
  return guarded("Couldn't send the email", async () => {
    const { valid } = parseRecipients(input);
    if (valid.length === 0)
      throw new Error("Add at least one valid email address.");
    if (valid.length > MAX_RECIPIENTS) {
      throw new Error(`Send to at most ${MAX_RECIPIENTS} addresses at a time.`);
    }
    const { accepted, rejected } = await sendEmail({
      template: "result-update",
      to: valid,
      props: {
        subject: resultMailSubject(),
        academicYear: academicYearLabel(),
        resultsUrl: new URL("/results", appConfig.url).toString(),
      },
    });
    return { accepted: accepted.length, rejected };
  });
}
