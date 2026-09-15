"use server";
import { after } from "next/server";
import { cache } from "react";
import type { ResultTypeWithId } from "~/models/result";

import { PipelineStage } from "mongoose";
import dbConnect from "~/lib/dbConnect";
import { serverFetch } from "~/lib/fetch-server";
import { redisGet, redisSet } from "~/lib/redis";
import ResultModel from "~/models/result";
import { consumeRateLimit, getClientIp } from "~/lib/rate-limit";
import { z } from "zod/v3";
import { serialize } from "~/utils/serialize";

/*
/*  For Public Search
*/

type responseResultType = Omit<ResultTypeWithId, "semesters"> & {
  cgpi: number;
  prevCgpi?: number;
};
type getResultsReturnType = {
  results: responseResultType[];
  totalPages: number;
  totalCount: number;
};
// helper: escape regex special chars
function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
export async function getResults(
  query: string,
  currentPage: number,
  filter: {
    branch?: string;
    programme?: string;
    batch?: string; // comes as string from query params
    limit?: number;
    include_freshers?: boolean;
  },
  new_cache?: boolean
): Promise<getResultsReturnType> {
  try {
    const resultsPerPage = Math.max(1, filter?.limit || 32);
    const page = Math.max(1, Number(currentPage) || 1);

    // normalize batch ONCE
    let normalizedBatch: number | null = null;
    if (filter.batch && filter.batch !== "all") {
      const parsed = Number.parseInt(filter.batch.trim(), 10);
      if (!Number.isNaN(parsed)) {
        normalizedBatch = parsed;
      }
    }

    //  deterministic cache key (normalized)
    const keyParts = [
      `q=${encodeURIComponent(query || "")}`,
      `p=${page}`,
      `l=${resultsPerPage}`,
      `b=${filter?.branch ?? "all"}`,
      `pr=${filter?.programme ?? "all"}`,
      `bt=${normalizedBatch ?? "all"}`,
      `f=${filter?.include_freshers ? "1" : "0"}`,
    ];
    const cacheKey = `results:${keyParts.join("|")}`;

    // A forced refresh skips the read; the write below overwrites the stale entry.
    if (!new_cache) {
      const cached = await redisGet<getResultsReturnType>(cacheKey);
      if (cached) return cached;
    }

    await dbConnect();

    const filterQuery: any = {};

    if (query && query.trim() !== "") {
      const tokens = query.trim().split(/\s+/).filter(Boolean);

      filterQuery.$and = tokens.map((token) => {
        const safe = escapeRegExp(token);
        const regex = { $regex: safe, $options: "i" };
        return {
          $or: [{ name: regex }, { rollNo: regex }],
        };
      });
    }

    if (filter.include_freshers === false) {
      filterQuery["semesters.0"] = { $exists: true };
    }

    if (filter.branch && filter.branch !== "all") {
      filterQuery.branch = filter.branch;
    }

    if (filter.programme && filter.programme !== "all") {
      filterQuery.programme = filter.programme;
    }

    if (normalizedBatch !== null) {
      filterQuery.batch = normalizedBatch; // correct type: number
    }

    const skip = (page - 1) * resultsPerPage;

    const aggregationPipeline: PipelineStage[] = [
      { $match: filterQuery },
      { $sort: { "rank.college": 1 } },
      { $skip: skip },
      { $limit: resultsPerPage },
      {
        $addFields: {
          semestersCount: { $size: "$semesters" },
          lastSemester: { $last: "$semesters" },
        },
      },
      {
        $addFields: {
          cgpi: {
            $cond: [
              { $gte: ["$semestersCount", 1] },
              "$lastSemester.cgpi",
              null,
            ],
          },
          prevCgpi: {
            $cond: [
              { $gte: ["$semestersCount", 2] },
              {
                $arrayElemAt: [
                  "$semesters",
                  { $subtract: ["$semestersCount", 2] },
                ],
              },
              null,
            ],
          },
        },
      },
      {
        $addFields: {
          prevCgpi: "$prevCgpi.cgpi",
        },
      },

      {
        $project: {
          semesters: 0,
          lastSemester: 0,
          secondLastSemester: 0,
        },
      },
    ];

    const [results, totalCount] = await Promise.all([
      ResultModel.aggregate(aggregationPipeline),
      ResultModel.countDocuments(filterQuery),
    ]);

    const totalPages = Math.max(1, Math.ceil(totalCount / resultsPerPage));
    const response = { results, totalPages, totalCount };

    // Cache writes never block the response.
    after(() => redisSet(cacheKey, response, 60 * 60 * 24));

    return response;
  } catch (err) {
    console.error("Error in getResults:", err);
    throw new Error("Failed to fetch results");
  }
}

type CachedLabels = {
  branches: string[];
  batches: string[];
  programmes: string[];
};
export const getCachedLabels = cache(
  async (new_cache?: boolean): Promise<CachedLabels> => {
    const cacheKey = "result:cached_labels:v1";
    if (!new_cache) {
      const cached = await redisGet<CachedLabels>(cacheKey);
      if (cached) return cached;
    }

    try {
      await dbConnect();
      // distinct is fine for small label sets
      const [branches, batches, programmes] = await Promise.all([
        ResultModel.distinct("branch"),
        ResultModel.distinct("batch"),
        ResultModel.distinct("programme"),
      ]);

      const labels = { branches, batches, programmes };
      after(() => redisSet(cacheKey, labels, 60 * 60 * 24 * 30 * 6));
      return labels;
    } catch (err) {
      console.error("Error fetching labels:", err);
      return { branches: [], batches: [], programmes: [] };
    }
  }
);

/*
/*  For admin
*/

async function loadResult(
  rollNo: string,
  update?: boolean,
  is_new?: boolean
): Promise<ResultTypeWithId | null> {
  const cacheKey = `result:r:${rollNo}`;
  if (!is_new && !update) {
    const cached = await redisGet<ResultTypeWithId>(cacheKey);
    if (cached) return cached;
  }

  await dbConnect();
  const result = (await ResultModel.findOne({ rollNo })
    .lean()
    .exec()) as ResultTypeWithId | null;

  if (result && update) {
    const response = await serverFetch<{
      data: ResultTypeWithId | null;
      message: string;
      error: boolean;
    }>("/api/results/:rollNo", {
      method: "PUT",
      params: { rollNo },
    });
    const updated = response.data?.data;
    if (response.error || !updated) return null;
    await assignRanks();
    after(() => redisSet(cacheKey, updated, 60));
    return updated;
  }

  if (!result && is_new) {
    const response = await serverFetch<{
      data: ResultTypeWithId | null;
      message: string;
      error: boolean;
    }>("/api/results/:rollNo", {
      method: "POST",
      params: { rollNo },
    });
    const created = response.data?.data;
    if (response.error || !created) return null;
    await assignRanks();
    after(() => redisSet(cacheKey, created, 60));
    return created;
  }

  if (!result) {
    console.log("Result not found for rollNo:", rollNo);
    return null;
  }

  after(() => redisSet(cacheKey, result, 60));

  return serialize<ResultTypeWithId>(result);
}

// A refresh scrapes the college site and re-ranks every result, so it is capped per visitor and per roll number.
const REFRESH_LIMITS = {
  perIp: { max: 5, windowSeconds: 10 * 60 },
  perRollNo: { max: 3, windowSeconds: 60 * 60 },
};

export type ResultLookup = {
  result: ResultTypeWithId | null;
  refreshBlocked: boolean;
  retryAfterSeconds: number;
};

export async function getResultWithRefresh(
  rollNo: string,
  refresh: { update?: boolean; isNew?: boolean } = {}
): Promise<ResultLookup> {
  const wantsRefresh = Boolean(refresh.update || refresh.isNew);
  if (!wantsRefresh) {
    return {
      result: await loadResult(rollNo),
      refreshBlocked: false,
      retryAfterSeconds: 0,
    };
  }

  let blocked = false;
  let retryAfterSeconds = 0;
  try {
    const ip = await getClientIp();
    const [byIp, byRoll] = await Promise.all([
      consumeRateLimit({
        key: `result-refresh:ip:${ip}`,
        ...REFRESH_LIMITS.perIp,
      }),
      consumeRateLimit({
        key: `result-refresh:roll:${rollNo.toLowerCase()}`,
        ...REFRESH_LIMITS.perRollNo,
      }),
    ]);
    blocked = !byIp.allowed || !byRoll.allowed;
    retryAfterSeconds = Math.max(
      byIp.retryAfterSeconds,
      byRoll.retryAfterSeconds
    );
  } catch (e) {
    // Fail closed: without a working limiter, serve the stored result instead of scraping.
    console.error("Rate limit check failed:", e);
    blocked = true;
  }

  const result = blocked
    ? await loadResult(rollNo)
    : await loadResult(rollNo, refresh.update, refresh.isNew);
  return { result, refreshBlocked: blocked, retryAfterSeconds };
}

export async function getResultByRollNo(
  rollNo: string,
  update?: boolean,
  is_new?: boolean
): Promise<ResultTypeWithId | null> {
  const { result } = await getResultWithRefresh(rollNo, {
    update,
    isNew: is_new,
  });
  return result;
}

// Not exported: exports of a "use server" file are publicly callable actions.
async function assignRanks() {
  const response = await serverFetch<{
    error: boolean;
    message: string;
    data: object | null;
  }>("/api/results/assign-ranks", {
    method: "POST",
  });
  console.log(response);
  if (!response.data || response.data?.error) {
    throw new Error(response.data?.message || "Couldn't assign ranks");
  }

  return true;
}
const freshersDataSchema = z.array(
  z.object({
    name: z.string(),
    rollNo: z.string(),
    gender: z.enum(["male", "female", "not_specified"]),
  })
);

export async function bulkUpdateGenders(
  data: z.infer<typeof freshersDataSchema>
) {
  const parsed = freshersDataSchema.safeParse(data);
  if (!parsed.success)
    return { error: true, message: "Invalid data", data: parsed.error };

  await dbConnect();

  const ops = parsed.data.map((s) => ({
    updateOne: {
      filter: { rollNo: s.rollNo, gender: "not_specified" }, // only update unspecified
      update: { $set: { gender: s.gender } },
      upsert: false,
    },
  }));

  // execute in batches to avoid huge payloads
  const BATCH = 500;
  for (let i = 0; i < ops.length; i += BATCH) {
    const batchOps = ops.slice(i, i + BATCH);
    try {
      await ResultModel.bulkWrite(batchOps, { ordered: false });
    } catch (e) {
      console.error("bulkWrite error:", e);
      // continue with next batch
    }
  }

  return { error: false, message: "OK" };
}
