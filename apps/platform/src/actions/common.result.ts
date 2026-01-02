"use server";
import { cache } from "react";
import type { ResultTypeWithId } from "~/models/result";

import { PipelineStage } from "mongoose";
import { z } from "zod";
import dbConnect from "~/lib/dbConnect";
import { serverFetch } from "~/lib/fetch-server";
import redis from "~/lib/redis";
import ResultModel from "~/models/result";

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

    // ---- normalize batch ONCE ----
    let normalizedBatch: number | null = null;
    if (
      filter.batch &&
      filter.batch !== "all"
    ) {
      const parsed = Number.parseInt(filter.batch.trim(), 10);
      if (!Number.isNaN(parsed)) {
        normalizedBatch = parsed;
      }
    }

    // ---- deterministic cache key (normalized) ----
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

    if (!new_cache) {
      try {
        const cached = await redis?.get(cacheKey);
        if (cached) {
          console.log("Cache hit for key:", cacheKey);
          return JSON.parse(cached) as getResultsReturnType;
        }
      } catch (e) {
        console.log("Redis GET error:", e);
      }
    } else {
      try {
        await redis?.del(cacheKey);
      } catch (e) {
        console.log("Redis DEL error:", e);
      }
    }

    await dbConnect();

    const filterQuery: any = {};

    // ---- Text search ----
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

    // ---- Freshers handling (single source of truth) ----
    if (filter.include_freshers === false) {
      filterQuery["semesters.0"] = { $exists: true };
    }

    // ---- Structured filters ----
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
          lastSemester: { $last: "$semesters" },
          secondLastSemester: {
            $cond: [
              { $gte: [{ $size: "$semesters" }, 2] },
              {
                $arrayElemAt: [
                  "$semesters",
                  { $subtract: [{ $size: "$semesters" }, 2] },
                ],
              },
              null,
            ],
          },
        },
      },
      {
        $addFields: {
          cgpi: "$lastSemester.cgpi",
          prevCgpi: "$secondLastSemester.cgpi",
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

    try {
      await redis?.set(
        cacheKey,
        JSON.stringify(response),
        "EX",
        60 * 60 * 24
      );
    } catch (e) {
      console.log("Redis SET error:", e);
    }

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
export const getCachedLabels = cache(async (new_cache?: boolean): Promise<CachedLabels> => {
  const cacheKey = "cached_labels_v1";
  if (!new_cache) {
    try {
      const cached = await redis?.get(cacheKey);
      if (cached) return JSON.parse(cached);
    } catch (e) {
      console.log("Redis GET error:", e);
    }
  } else {
    try { await redis?.del(cacheKey); } catch (e) { console.log("Redis DEL error:", e); }
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
    try {
      await redis?.set(cacheKey, JSON.stringify(labels), "EX", 60 * 60 * 24 * 30 * 6); // 6 months
    } catch (e) {
      console.log("Redis SET error:", e);
    }
    return labels;
  } catch (err) {
    console.error("Error fetching labels:", err);
    return { branches: [], batches: [], programmes: [] };
  }
});


/*
/*  For admin
*/

export async function getResultByRollNo(
  rollNo: string,
  update?: boolean,
  is_new?: boolean
): Promise<ResultTypeWithId | null> {
  const cacheKey = `result_r_${rollNo}`;
  try {
    if (!is_new && !update) {
      try {
        const cached = await redis?.get(cacheKey);
        if (cached) {
          console.log("Cache hit for key:", cacheKey);
          return JSON.parse(cached) as ResultTypeWithId;
        }
      } catch (e) {
        console.log("Redis GET error:", e);
      }
    } else {
      try {
        await redis?.del(cacheKey);
      } catch (e) {
        console.log("Redis DEL error:", e);
      }
    }
  } catch (e) {
    console.log("Cache Error in getResultByRollNo:", e);
  }

  await dbConnect();
  const result = await ResultModel.findOne({ rollNo }).lean().exec() as ResultTypeWithId | null;

  if (result && update) {
    const response = await serverFetch<{
      data: ResultTypeWithId | null;
      message: string;
      error: boolean;
    }>("/api/results/:rollNo", {
      method: "PUT",
      params: { rollNo },
    });
    if (response.error || !response.data) return null;
    await assignRanks();
    // cache updated data if present
    try {
      await redis?.set(cacheKey, JSON.stringify(response.data), "EX", 60);
    } catch (e) {
      console.log("Redis SET error:", e);
    }
    return response.data.data;
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
    if (response.error || !response.data) return null;
    await assignRanks();
    try {
      await redis?.set(cacheKey, JSON.stringify(response.data), "EX", 60);
    } catch (e) {
      console.log("Redis SET error:", e);
    }
    return response.data.data;
  }

  if (!result) {
    console.log("Result not found for rollNo:", rollNo);
    return null;
  }

  try {
    await redis?.set(cacheKey, JSON.stringify(result), "EX", 60);
  } catch (e) {
    console.log("Redis SET error:", e);
  }

  return JSON.parse(JSON.stringify(result)); // deep clone
}


export async function assignRanks() {
  const response = await serverFetch<{
    error: boolean;
    message: string;
    data: object | null;
  }>("/api/results/assign-ranks", {
    method: "POST",
  });
  console.log(response);
  if (!response.data || response.data?.error) {
    return Promise.reject(response.data?.message);
  }

  return Promise.resolve(true);
}

const freshersDataSchema = z.array(
  z.object({
    name: z.string(),
    rollNo: z.string(),
    gender: z.enum(["male", "female", "not_specified"]),
  })
);

export async function bulkUpdateGenders(data: z.infer<typeof freshersDataSchema>) {
  const parsed = freshersDataSchema.safeParse(data);
  if (!parsed.success) return { error: true, message: "Invalid data", data: parsed.error };

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
